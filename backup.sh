#!/bin/bash

# Configuration
DB_USER="spire"
DB_PASS="SpireCrmBySigniixAdvisors#2024"
DB_NAME="spire"
BACKUP_DIR="/home/fco1t1x9fsye/public_html/crm.signiixadvisors.com/backups"
FULL_BACKUP_FILE="$BACKUP_DIR/full_backup.sql"
LAST_BACKUP_CHECKSUM="$BACKUP_DIR/last_backup_checksum.txt"
LOG_FILE="$BACKUP_DIR/backup_log.txt"
CURRENT_TIME=$(TZ="Asia/Kolkata" date +"%Y-%m-%d %H:%M:%S")

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Function to log messages
log_message() {
    echo "[$CURRENT_TIME] $1" >> "$LOG_FILE"
}

# Function to take a full backup
take_full_backup() {
    echo "Taking full backup..."
    /bin/mysqldump -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" > "$FULL_BACKUP_FILE"
    
    if [ $? -eq 0 ]; then
        NEW_CHECKSUM=$(md5sum "$FULL_BACKUP_FILE" | awk '{print $1}')
        echo "$NEW_CHECKSUM" > "$LAST_BACKUP_CHECKSUM"
        log_message "Full backup created successfully."
    else
        log_message "Failed to create full backup."
        exit 1
    fi
}

# Function to check if any table has been updated
has_database_changed() {
    LATEST_UPDATE=$(mysql -u "$DB_USER" -p"$DB_PASS" -N -e "SELECT MAX(UPDATE_TIME) FROM information_schema.tables WHERE TABLE_SCHEMA='$DB_NAME';")
    if [[ -z $LATEST_UPDATE ]]; then
        # If there's no update time, assume changes exist
        return 0
    fi
    LAST_UPDATE_TIME=$(cat "$BACKUP_DIR/last_backup_time.txt" 2>/dev/null || echo "")

    if [[ "$LATEST_UPDATE" > "$LAST_UPDATE_TIME" ]]; then
        echo "$LATEST_UPDATE" > "$BACKUP_DIR/last_backup_time.txt"
        return 0
    else
        return 1
    fi
}

# Check if a full backup is needed
if [ ! -f "$FULL_BACKUP_FILE" ] || [ ! -f "$LAST_BACKUP_CHECKSUM" ]; then
    log_message "No previous backup found. Taking full backup."
    take_full_backup
elif has_database_changed; then
    log_message "Database changes detected since the last backup. Taking full backup."
    take_full_backup
else
    log_message "Backup not needed. No changes since the last backup."
fi
