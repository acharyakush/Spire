#!/usr/bin/env bash

set -Eeuo pipefail
IFS=$'\n\t'
umask 077

APP_NAME="${APP_NAME:-spire-crm}"
PROJECT_DIR="${PROJECT_DIR:-$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)}"
NEXT_ZIP_FILE="${NEXT_ZIP_FILE:-$PROJECT_DIR/.next.zip}"
LOCK_FILE="${LOCK_FILE:-$PROJECT_DIR/.stop_and_cleanup.lock}"
LOG_FILE="${LOG_FILE:-$PROJECT_DIR/stop_and_cleanup.log}"

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
		flock -n 9 || die "Another stop_and_cleanup run is already in progress."
	fi
}

verify_project_dir() {
	[[ -d "$PROJECT_DIR" ]] || die "Project directory does not exist: $PROJECT_DIR"
	[[ -f "$PROJECT_DIR/package.json" ]] || die "package.json not found in project directory: $PROJECT_DIR"
}

stop_pm2_process() {
	if ! pm2 describe "$APP_NAME" >/dev/null 2>&1; then
		log_message "PM2 process '$APP_NAME' was not found. Skipping stop."
		return 0
	fi

	log_message "Stopping PM2 process: $APP_NAME"

	if ! pm2 stop "$APP_NAME" >> "$LOG_FILE" 2>&1; then
		die "Failed to stop PM2 process: $APP_NAME"
	fi

	log_message "PM2 process stopped successfully: $APP_NAME"
}

remove_file_if_present() {
	local target="$1"
	local label="$2"

	if [[ -L "$target" ]]; then
		die "Refusing to remove symlink for $label: $target"
	fi

	if [[ -f "$target" ]]; then
		log_message "Deleting $label: $target"
		rm -f -- "$target"
	else
		log_message "$label not found: $target"
	fi
}

main() {
	prepare_logging
	acquire_lock
	require_command pm2
	verify_project_dir
	stop_pm2_process
	remove_file_if_present "$NEXT_ZIP_FILE" ".next.zip file"
	log_message "Preserving live .next directory for atomic swap deployment."
	log_message "Stop and cleanup completed successfully."
}

main "$@"
