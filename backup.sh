#!/usr/bin/env bash

set -Eeuo pipefail
umask 077

# Configuration
DB_USER="${DB_USER:-spire}"
DB_NAME="${DB_NAME:-spire}"
DB_PASS="${DB_PASS:-}"
MYSQL_CREDENTIALS_FILE="${MYSQL_CREDENTIALS_FILE:-$HOME/.my.cnf}"
BACKUP_DIR="${BACKUP_DIR:-/home/fco1t1x9fsye/public_html/crm.signiixadvisors.com/backups}"
ARCHIVE_DIR="${ARCHIVE_DIR:-$BACKUP_DIR/archives}"
LATEST_BACKUP_FILE="${LATEST_BACKUP_FILE:-$BACKUP_DIR/full_backup.sql.gz}"
LATEST_CHECKSUM_FILE="${LATEST_CHECKSUM_FILE:-$BACKUP_DIR/latest_backup_checksum.txt}"
LAST_SUCCESSFUL_BACKUP_FILE="${LAST_SUCCESSFUL_BACKUP_FILE:-$BACKUP_DIR/last_successful_backup.txt}"
LOG_FILE="${LOG_FILE:-$BACKUP_DIR/backup_log.txt}"
ERROR_LOG_FILE="${ERROR_LOG_FILE:-$BACKUP_DIR/error_log.txt}"
LOCK_FILE="${LOCK_FILE:-$BACKUP_DIR/backup.lock}"
EMAIL="${EMAIL:-acharyakush2604@outlook.com}"
MAIL_SUBJECT="${MAIL_SUBJECT:-Full Spire DB Backup}"
RETENTION_COUNT="${RETENTION_COUNT:-7}"
TZ_NAME="${TZ_NAME:-Asia/Kolkata}"
GZIP_LEVEL="${GZIP_LEVEL:-6}"

BACKUP_CHANGED=0
TMP_BACKUP_FILE=""
HASH_COMMAND=""
MYSQL_AUTH_MODE=""
declare -a MYSQL_AUTH_ARGS=()

timestamp() {
	TZ="$TZ_NAME" date +"%Y-%m-%d %H:%M:%S"
}

log_message() {
	printf '[%s] %s\n' "$(timestamp)" "$1" >> "$LOG_FILE"
}

log_error() {
	printf '[%s] %s\n' "$(timestamp)" "$1" >> "$ERROR_LOG_FILE"
	log_message "$1"
}

cleanup() {
	local rc=$?

	if [[ -n "$TMP_BACKUP_FILE" && -f "$TMP_BACKUP_FILE" ]]; then
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

require_command() {
	command -v "$1" >/dev/null 2>&1 || die "Required command not found: $1"
}

validate_number() {
	local value="$1"
	local label="$2"

	[[ "$value" =~ ^[0-9]+$ ]] || die "$label must be a non-negative integer."
}

validate_gzip_level() {
	[[ "$GZIP_LEVEL" =~ ^[1-9]$ ]] || die "GZIP_LEVEL must be a value from 1 to 9."
}

prepare_directories() {
	mkdir -p "$BACKUP_DIR" "$ARCHIVE_DIR" "$(dirname "$LOG_FILE")" "$(dirname "$ERROR_LOG_FILE")"
	: >> "$LOG_FILE"
	: >> "$ERROR_LOG_FILE"
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

configure_mysql_auth() {
	if [[ -n "$MYSQL_CREDENTIALS_FILE" && -f "$MYSQL_CREDENTIALS_FILE" ]]; then
		[[ -r "$MYSQL_CREDENTIALS_FILE" ]] || die "MYSQL_CREDENTIALS_FILE is not readable: $MYSQL_CREDENTIALS_FILE"
		MYSQL_AUTH_MODE="defaults-file"
		MYSQL_AUTH_ARGS=(--defaults-extra-file="$MYSQL_CREDENTIALS_FILE" -u "$DB_USER")
	elif [[ -n "$DB_PASS" ]]; then
		MYSQL_AUTH_MODE="env-password"
		MYSQL_AUTH_ARGS=(-u "$DB_USER")
	else
		die "Configure a readable MYSQL_CREDENTIALS_FILE or DB_PASS before running this backup."
	fi
}

run_mysqldump() {
	local -a dump_args=(
		--single-transaction
		--quick
		--triggers
		--routines
		--events
		--hex-blob
		--skip-comments
		--skip-dump-date
		--no-tablespaces
		--databases
		"$DB_NAME"
	)

	if [[ "$MYSQL_AUTH_MODE" == "defaults-file" ]]; then
		mysqldump "${MYSQL_AUTH_ARGS[@]}" "${dump_args[@]}"
	else
		MYSQL_PWD="$DB_PASS" mysqldump "${MYSQL_AUTH_ARGS[@]}" "${dump_args[@]}"
	fi
}

get_file_checksum() {
	"$HASH_COMMAND" "$1" | awk '{print $1}'
}

create_backup() {
	local checksum_new=""
	local checksum_old=""
	local archive_file=""
	local archive_stamp

	archive_stamp=$(TZ="$TZ_NAME" date +"%Y%m%d_%H%M%S")
	TMP_BACKUP_FILE=$(mktemp "$BACKUP_DIR/.${DB_NAME}_backup.${archive_stamp}.XXXXXX.sql.gz")

	log_message "Starting backup for database '$DB_NAME'."

	if ! run_mysqldump 2>>"$ERROR_LOG_FILE" | gzip -n "-$GZIP_LEVEL" > "$TMP_BACKUP_FILE"; then
		die "mysqldump failed for database '$DB_NAME'."
	fi

	[[ -s "$TMP_BACKUP_FILE" ]] || die "Backup file is empty: $TMP_BACKUP_FILE"

	checksum_new=$(get_file_checksum "$TMP_BACKUP_FILE")

	if [[ -f "$LATEST_BACKUP_FILE" && -f "$LATEST_CHECKSUM_FILE" ]]; then
		checksum_old=$(<"$LATEST_CHECKSUM_FILE")
	fi

	if [[ -n "$checksum_old" && "$checksum_new" == "$checksum_old" ]]; then
		printf '%s\n' "$(timestamp)" > "$LAST_SUCCESSFUL_BACKUP_FILE"
		log_message "Backup content unchanged. Existing backup retained."
		rm -f -- "$TMP_BACKUP_FILE"
		TMP_BACKUP_FILE=""
		return 0
	fi

	mv -f -- "$TMP_BACKUP_FILE" "$LATEST_BACKUP_FILE"
	TMP_BACKUP_FILE=""

	printf '%s\n' "$checksum_new" > "$LATEST_CHECKSUM_FILE"
	printf '%s\n' "$(timestamp)" > "$LAST_SUCCESSFUL_BACKUP_FILE"

	archive_file="$ARCHIVE_DIR/${DB_NAME}_${archive_stamp}.sql.gz"
	cp -f -- "$LATEST_BACKUP_FILE" "$archive_file"

	BACKUP_CHANGED=1
	log_message "Backup created successfully: $LATEST_BACKUP_FILE"
}

rotate_archives() {
	local -a archive_files=()
	local file=""

	shopt -s nullglob
	archive_files=("$ARCHIVE_DIR"/"${DB_NAME}"_*.sql.gz)
	shopt -u nullglob

	if (( ${#archive_files[@]} <= RETENTION_COUNT )); then
		return 0
	fi

	mapfile -t archive_files < <(printf '%s\n' "${archive_files[@]}" | sort -r)

	for file in "${archive_files[@]:RETENTION_COUNT}"; do
		rm -f -- "$file"
	done
}

send_backup_email() {
	[[ -n "$EMAIL" ]] || {
		log_message "EMAIL is empty. Skipping backup email."
		return 0
	}

	if ! command -v mail >/dev/null 2>&1; then
		die "mail command not found; backup email could not be sent."
	fi

	if ! printf 'CRM Full DB Backup created on %s.\n' "$(timestamp)" | mail -s "$MAIL_SUBJECT" -a "$LATEST_BACKUP_FILE" "$EMAIL" 2>>"$ERROR_LOG_FILE"; then
		die "Backup email failed for recipient: $EMAIL"
	fi

	log_message "Backup email sent to $EMAIL."
}

main() {
	prepare_directories
	validate_number "$RETENTION_COUNT" "RETENTION_COUNT"
	validate_gzip_level
	acquire_lock
	require_command mysqldump
	require_command gzip
	require_command awk
	require_command date
	require_command mktemp
	configure_hash_command
	configure_mysql_auth
	create_backup
	rotate_archives

	if (( BACKUP_CHANGED == 1 )); then
		send_backup_email
	else
		log_message "No email sent because the backup content did not change."
	fi
}

main "$@"
