#!/usr/bin/env bash

set -Eeuo pipefail
umask 077

# ============================================================
# Smart Backup Script for Spire CRM
# ============================================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/backup.env"

# Load environment
if [[ -f "$ENV_FILE" ]]; then
    # shellcheck disable=SC1090
    source "$ENV_FILE"
fi

DB_USER="${BACKUP_DB_USER:-spire}"
DB_NAME="${BACKUP_DB_NAME:-spire}"
DB_PASS="${BACKUP_DB_PASS:-}"
DB_HOST="${BACKUP_DB_HOST:-localhost}"

BACKUP_DIR="${SCRIPT_DIR}/backups"
ARCHIVE_DIR="${BACKUP_DIR}/archives"
LATEST_BACKUP_FILE="${BACKUP_DIR}/full_backup.sql.gz"
LATEST_CHECKSUM_FILE="${BACKUP_DIR}/latest_backup_checksum.txt"
LAST_SUCCESSFUL_BACKUP_FILE="${BACKUP_DIR}/last_successful_backup.txt"
LAST_DB_CHANGE_FILE="${BACKUP_DIR}/last_db_change.txt"
LOG_FILE="${BACKUP_DIR}/backup_log.txt"
ERROR_LOG_FILE="${BACKUP_DIR}/error_log.txt"
LOCK_FILE="${BACKUP_DIR}/backup.lock"
EMAIL="${BACKUP_EMAIL_TO:-}"
MAIL_SUBJECT="${BACKUP_EMAIL_SUBJECT:-Spire DB Backup}"
RETENTION_COUNT=7
TZ_NAME="Asia/Kolkata"
GZIP_LEVEL=6

BACKUP_CHANGED=0
TMP_BACKUP_FILE=""
HASH_COMMAND=""

# ============================================================
# Helper functions
# ============================================================
timestamp() {
    TZ="$TZ_NAME" date +"%Y-%m-%d %H:%M:%S"
}

log_message() {
    printf '[%s] %s\n' "$(timestamp)" "$1" | tee -a "$LOG_FILE"
}

log_error() {
    printf '[%s] %s\n' "$(timestamp)" "$1" | tee -a "$ERROR_LOG_FILE" "$LOG_FILE"
}

cleanup() {
    local rc=$?
    if [[ -n "${TMP_BACKUP_FILE:-}" && -f "$TMP_BACKUP_FILE" ]]; then
        rm -f -- "$TMP_BACKUP_FILE"
    fi
    if (( rc != 0 )); then
        log_error "Backup job failed with exit code $rc."
    fi
}

trap cleanup EXIT
trap 'log_error "Backup job interrupted."; exit 1' INT TERM

die() {
    log_error "$1"
    exit 1
}

prepare_directories() {
    mkdir -p "$BACKUP_DIR" "$ARCHIVE_DIR"
    touch "$LOG_FILE" "$ERROR_LOG_FILE"
    chown -R www-data:www-data "$BACKUP_DIR" 2>/dev/null || true
}

acquire_lock() {
    exec 9>"$LOCK_FILE"
    if command -v flock >/dev/null 2>&1; then
        if ! flock -n 9; then
            log_message "Another backup run is already in progress. Exiting."
            exit 0
        fi
    fi
}

configure_hash_command() {
    if command -v sha256sum >/dev/null 2>&1; then
        HASH_COMMAND="sha256sum"
    elif command -v md5sum >/dev/null 2>&1; then
        HASH_COMMAND="md5sum"
    else
        die "Neither sha256sum nor md5sum is available."
    fi
}

# ============================================================
# Smart check: Has the database actually changed?
# ============================================================
get_latest_db_change() {
    # Returns the newest UPDATE_TIME from information_schema
    local result
    result=$(MYSQL_PWD="$DB_PASS" mysql -h "$DB_HOST" -u "$DB_USER" -N -e "
        SELECT COALESCE(MAX(UPDATE_TIME), MAX(CREATE_TIME), '1970-01-01 00:00:00')
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = '$DB_NAME';
    " 2>>"$ERROR_LOG_FILE")

    if [[ -z "$result" ]]; then
        echo "1970-01-01 00:00:00"
    else
        echo "$result"
    fi
}

should_run_backup() {
    local current_change last_change

    current_change=$(get_latest_db_change)
    log_message "Latest database change detected: $current_change"

    if [[ -f "$LAST_DB_CHANGE_FILE" ]]; then
        last_change=$(<"$LAST_DB_CHANGE_FILE")
    else
        last_change="1970-01-01 00:00:00"
    fi

    if [[ "$current_change" == "$last_change" ]]; then
        log_message "No new data found since last backup. Skipping mysqldump."
        printf '%s\n' "$(timestamp)" > "$LAST_SUCCESSFUL_BACKUP_FILE"
        return 1   # false ? skip backup
    fi

    # Save the new change timestamp
    printf '%s\n' "$current_change" > "$LAST_DB_CHANGE_FILE"
    return 0   # true ? run backup
}

# ============================================================
# Actual backup functions
# ============================================================
run_mysqldump() {
    MYSQL_PWD="$DB_PASS" mysqldump \
        -h "$DB_HOST" \
        -u "$DB_USER" \
        --single-transaction \
        --quick \
        --triggers \
        --routines \
        --events \
        --hex-blob \
        --skip-comments \
        --skip-dump-date \
        --no-tablespaces \
        --databases "$DB_NAME"
}

get_file_checksum() {
    "$HASH_COMMAND" "$1" | awk '{print $1}'
}

create_backup() {
    local checksum_new="" checksum_old="" archive_file="" archive_stamp

    archive_stamp=$(TZ="$TZ_NAME" date +"%Y%m%d_%H%M%S")
    TMP_BACKUP_FILE=$(mktemp "$BACKUP_DIR/.${DB_NAME}_backup.${archive_stamp}.XXXXXX.sql.gz")

    log_message "Starting full backup for database '$DB_NAME'..."

    if ! run_mysqldump 2>>"$ERROR_LOG_FILE" | gzip -n "-$GZIP_LEVEL" > "$TMP_BACKUP_FILE"; then
        die "mysqldump failed for database '$DB_NAME'."
    fi

    [[ -s "$TMP_BACKUP_FILE" ]] || die "Backup file is empty: $TMP_BACKUP_FILE"

    checksum_new=$(get_file_checksum "$TMP_BACKUP_FILE")

    if [[ -f "$LATEST_BACKUP_FILE" && -f "$LATEST_CHECKSUM_FILE" ]]; then
        checksum_old=$(<"$LATEST_CHECKSUM_FILE")
    fi

    if [[ -n "$checksum_old" && "$checksum_new" == "$checksum_old" ]]; then
        log_message "Backup content unchanged (checksum match). Keeping existing backup."
        rm -f -- "$TMP_BACKUP_FILE"
        TMP_BACKUP_FILE=""
        printf '%s\n' "$(timestamp)" > "$LAST_SUCCESSFUL_BACKUP_FILE"
        return 0
    fi

    mv -f -- "$TMP_BACKUP_FILE" "$LATEST_BACKUP_FILE"
    TMP_BACKUP_FILE=""

    printf '%s\n' "$checksum_new" > "$LATEST_CHECKSUM_FILE"
    printf '%s\n' "$(timestamp)" > "$LAST_SUCCESSFUL_BACKUP_FILE"

    archive_file="$ARCHIVE_DIR/${DB_NAME}_${archive_stamp}.sql.gz"
    cp -f -- "$LATEST_BACKUP_FILE" "$archive_file"
    chown www-data:www-data "$LATEST_BACKUP_FILE" "$archive_file" 2>/dev/null || true

    BACKUP_CHANGED=1
    log_message "Backup created successfully: $LATEST_BACKUP_FILE"
    log_message "Archive saved: $archive_file"
}

rotate_archives() {
    local -a archive_files=()
    shopt -s nullglob
    archive_files=("$ARCHIVE_DIR"/"${DB_NAME}"_*.sql.gz)
    shopt -u nullglob

    if (( ${#archive_files[@]} <= RETENTION_COUNT )); then
        return 0
    fi

    mapfile -t archive_files < <(printf '%s\n' "${archive_files[@]}" | sort -r)

    for file in "${archive_files[@]:RETENTION_COUNT}"; do
        rm -f -- "$file"
        log_message "Removed old archive: $file"
    done
}

send_backup_email() {
    [[ -n "$EMAIL" ]] || return 0

    if ! command -v mail >/dev/null 2>&1; then
        log_message "mail command not found. Skipping email."
        return 0
    fi

    if printf 'CRM Full DB Backup created on %s.\nFile: %s\n' "$(timestamp)" "$LATEST_BACKUP_FILE" \
        | mail -s "$MAIL_SUBJECT" -A "$LATEST_BACKUP_FILE" "$EMAIL" 2>>"$ERROR_LOG_FILE"; then
        log_message "Backup email sent to $EMAIL."
    else
        log_error "Backup email failed for recipient: $EMAIL"
    fi
}

# ============================================================
# Main
# ============================================================
main() {
    prepare_directories
    acquire_lock

    command -v mysqldump >/dev/null || die "mysqldump not found"
    command -v gzip >/dev/null || die "gzip not found"
    command -v mysql >/dev/null || die "mysql client not found"
    command -v awk >/dev/null || die "awk not found"
    command -v mktemp >/dev/null || die "mktemp not found"

    configure_hash_command

    # ===== SMART CHECK =====
    if ! should_run_backup; then
        log_message "Smart backup: Nothing to do."
        exit 0
    fi

    # Data has changed ? create backup
    create_backup
    rotate_archives

    if (( BACKUP_CHANGED == 1 )); then
        send_backup_email
    else
        log_message "No email sent because the backup content did not change."
    fi

    log_message "Backup job finished successfully."
}

main "$@"