#!/usr/bin/env bash

set -Eeuo pipefail
IFS=$'\n\t'
umask 077

APP_NAME="${APP_NAME:-spire-crm}"
PROJECT_DIR="${PROJECT_DIR:-$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)}"
NEXT_ZIP_FILE="${NEXT_ZIP_FILE:-$PROJECT_DIR/.next.zip}"
LIVE_NEXT_DIR="${LIVE_NEXT_DIR:-$PROJECT_DIR/.next}"
LOCK_FILE="${LOCK_FILE:-$PROJECT_DIR/.unzip_and_restart.lock}"
LOG_FILE="${LOG_FILE:-$PROJECT_DIR/unzip_and_restart.log}"

STAGING_ROOT=""
STAGED_NEXT_DIR=""
BACKUP_NEXT_DIR=""
ROLLED_BACK=0

timestamp() {
	date +"%Y-%m-%d %H:%M:%S"
}

log_message() {
	printf '[%s] %s\n' "$(timestamp)" "$1" | tee -a "$LOG_FILE"
}

die() {
	log_message "ERROR: $1"
	exit 1
}

require_command() {
	command -v "$1" >/dev/null 2>&1 || die "Required command not found: $1"
}

prepare_logging() {
	mkdir -p "$PROJECT_DIR"
	: >> "$LOG_FILE"
}

acquire_lock() {
	exec 9>"$LOCK_FILE"

	if command -v flock >/dev/null 2>&1; then
		flock -n 9 || die "Another unzip_and_restart run is already in progress."
	fi
}

verify_project_dir() {
	[[ -d "$PROJECT_DIR" ]] || die "Project directory does not exist: $PROJECT_DIR"
	[[ -f "$PROJECT_DIR/package.json" ]] || die "package.json not found in project directory: $PROJECT_DIR"
}

verify_archive() {
	[[ -f "$NEXT_ZIP_FILE" ]] || die ".next.zip file not found: $NEXT_ZIP_FILE"
	[[ ! -L "$NEXT_ZIP_FILE" ]] || die "Refusing to extract from symlink archive: $NEXT_ZIP_FILE"
}

cleanup() {
	local rc=$?

	if (( rc != 0 )) && (( ROLLED_BACK == 0 )); then
		rollback_if_needed
	fi

	if [[ -n "$STAGING_ROOT" && -d "$STAGING_ROOT" ]]; then
		rm -rf -- "$STAGING_ROOT"
	fi

	if [[ -n "$BACKUP_NEXT_DIR" && -d "$BACKUP_NEXT_DIR" && $rc -eq 0 ]]; then
		rm -rf -- "$BACKUP_NEXT_DIR"
	fi
}

trap cleanup EXIT

extract_archive_to_staging() {
	STAGING_ROOT="$(mktemp -d "$PROJECT_DIR/.next.staging.XXXXXX")"
	log_message "Extracting archive into staging directory: $STAGING_ROOT"

	if ! unzip -oq "$NEXT_ZIP_FILE" -d "$STAGING_ROOT" >> "$LOG_FILE" 2>&1; then
		die "Failed to extract archive: $NEXT_ZIP_FILE"
	fi

	detect_staged_next_dir
	verify_staged_next_dir
	log_message "Archive extracted successfully into staging."
}

detect_staged_next_dir() {
	if [[ -d "$STAGING_ROOT/.next" ]]; then
		STAGED_NEXT_DIR="$STAGING_ROOT/.next"
		return 0
	fi

	if [[ -f "$STAGING_ROOT/BUILD_ID" ]]; then
		STAGED_NEXT_DIR="$STAGING_ROOT"
		return 0
	fi

	local candidate=""
	local -a top_level_dirs=()

	while IFS= read -r candidate; do
		top_level_dirs+=("$candidate")
	done < <(find "$STAGING_ROOT" -mindepth 1 -maxdepth 1 -type d)

	if (( ${#top_level_dirs[@]} == 1 )) && [[ -f "${top_level_dirs[0]}/BUILD_ID" ]]; then
		STAGED_NEXT_DIR="${top_level_dirs[0]}"
		return 0
	fi

	die "Could not locate extracted .next build inside staging directory."
}

verify_staged_next_dir() {
	[[ -d "$STAGED_NEXT_DIR" ]] || die "Staged .next directory does not exist: $STAGED_NEXT_DIR"
	[[ ! -L "$STAGED_NEXT_DIR" ]] || die "Refusing to deploy symlink directory: $STAGED_NEXT_DIR"
	[[ -f "$STAGED_NEXT_DIR/BUILD_ID" ]] || die "Staged .next build is missing BUILD_ID: $STAGED_NEXT_DIR"
}

swap_in_staged_build() {
	local backup_suffix=""

	[[ ! -L "$LIVE_NEXT_DIR" ]] || die "Refusing to replace symlink live directory: $LIVE_NEXT_DIR"

	if [[ -d "$LIVE_NEXT_DIR" ]]; then
		backup_suffix="$(date +"%Y%m%d_%H%M%S").$$"
		BACKUP_NEXT_DIR="$PROJECT_DIR/.next.backup.$backup_suffix"
		log_message "Moving current live build to backup: $BACKUP_NEXT_DIR"
		mv -- "$LIVE_NEXT_DIR" "$BACKUP_NEXT_DIR"
	fi

	log_message "Promoting staged build into place: $LIVE_NEXT_DIR"
	mv -- "$STAGED_NEXT_DIR" "$LIVE_NEXT_DIR"
	STAGED_NEXT_DIR=""
}

restart_pm2_process() {
	if ! pm2 describe "$APP_NAME" >/dev/null 2>&1; then
		die "PM2 process '$APP_NAME' was not found."
	fi

	log_message "Restarting PM2 process: $APP_NAME"

	if ! pm2 restart "$APP_NAME" >> "$LOG_FILE" 2>&1; then
		die "Failed to restart PM2 process: $APP_NAME"
	fi

	log_message "PM2 process restarted successfully: $APP_NAME"
}

rollback_if_needed() {
	if [[ -z "$BACKUP_NEXT_DIR" || ! -d "$BACKUP_NEXT_DIR" ]]; then
		return 0
	fi

	log_message "Attempting rollback to previous .next build."

	if [[ -d "$LIVE_NEXT_DIR" && ! -L "$LIVE_NEXT_DIR" ]]; then
		rm -rf -- "$LIVE_NEXT_DIR"
	fi

	mv -- "$BACKUP_NEXT_DIR" "$LIVE_NEXT_DIR"
	BACKUP_NEXT_DIR=""
	ROLLED_BACK=1

	if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
		if pm2 restart "$APP_NAME" >> "$LOG_FILE" 2>&1; then
			log_message "Rollback completed and PM2 restarted successfully."
		else
			log_message "Rollback restored the previous build, but PM2 restart failed."
		fi
	else
		log_message "Rollback restored the previous build, but PM2 process '$APP_NAME' was not found."
	fi
}

main() {
	prepare_logging
	acquire_lock
	require_command unzip
	require_command pm2
	require_command find
	verify_project_dir
	verify_archive
	extract_archive_to_staging
	swap_in_staged_build
	restart_pm2_process
	log_message "Atomic unzip and restart completed successfully."
}

main "$@"
