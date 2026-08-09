<?php
declare(strict_types=1);

const BACKUP_CHUNK_SIZE = 1048576;
const BACKUP_STDERR_LIMIT = 16384;

ignore_user_abort(true);
set_time_limit(0);

// ============================================================
// Load configuration from backup.env
// ============================================================
$envFile = __DIR__ . '/backup.env';
if (is_readable($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) {
            continue;
        }
        if (str_starts_with($line, 'export ')) {
            $line = substr($line, 7);
        }
        if (strpos($line, '=') !== false) {
            [$key, $value] = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value, " \t\"'");
            putenv("$key=$value");
            $_ENV[$key] = $value;
        }
    }
}

$databaseHost     = getenv('BACKUP_DB_HOST') ?: 'localhost';
$databaseUser     = getenv('BACKUP_DB_USER') ?: 'spire';
$databaseName     = getenv('BACKUP_DB_NAME') ?: 'spire';
$databasePassword = getenv('BACKUP_DB_PASS') ?: '';
$accessToken      = getenv('BACKUP_ACCESS_TOKEN') ?: 'ChangeThisToALongSecretToken123!';
$archiveDirectory = __DIR__ . '/backups';
$mysqldumpBinary  = 'mysqldump';
$tempDirectory    = sys_get_temp_dir();
$gzipLevel        = 6;

$cleanupFiles = [];

register_shutdown_function(static function () use (&$cleanupFiles) {
    foreach ($cleanupFiles as $file) {
        if (is_string($file) && $file !== '' && is_file($file)) {
            @unlink($file);
        }
    }
});

validateConfiguration($databasePassword, $tempDirectory, $gzipLevel);
enforceAccessToken($accessToken);

$backupFile      = createTempFile($tempDirectory, '.sql.gz');
$stderrFile      = createTempFile($tempDirectory, '.err');
$cleanupFiles    = [$backupFile, $stderrFile];

$command = buildDumpCommand($mysqldumpBinary, $databaseHost, $databaseUser, $databaseName);

if (functionAvailable('proc_open')) {
    runDumpWithProcOpen($command, $databasePassword, $backupFile, $stderrFile, $gzipLevel);
} else {
    fail(500, 'Backup generation is unavailable on this server.', 'proc_open is not available.');
}

if (!is_file($backupFile) || filesize($backupFile) === 0) {
    fail(500, 'Backup generation failed.', readDiagnosticOutput($stderrFile));
}

$downloadName = sprintf('%s_%s.sql.gz', $databaseName, date('Y-m-d_H-i-s'));

// Also save a copy in the archive folder
$archivedBackupFile = archiveBackupFile($backupFile, $archiveDirectory, $downloadName);
$cleanupFiles = [$stderrFile]; // keep the archived file

streamBackupDownload($archivedBackupFile, $downloadName);
exit;

// ============================================================
// Functions
// ============================================================

function validateConfiguration(string $databasePassword, string $tempDirectory, int $gzipLevel): void
{
    if (!is_dir($tempDirectory) || !is_writable($tempDirectory)) {
        fail(500, 'Backup storage is unavailable.', "Temporary directory is not writable: {$tempDirectory}");
    }
    if ($gzipLevel < 1 || $gzipLevel > 9) {
        fail(500, 'Backup configuration is invalid.', 'BACKUP_GZIP_LEVEL must be between 1 and 9.');
    }
    if (!functionAvailable('gzopen')) {
        fail(500, 'Backup compression is unavailable.', 'The zlib extension is required.');
    }
    if ($databasePassword === '') {
        fail(500, 'Backup configuration is incomplete.', 'BACKUP_DB_PASS is missing.');
    }
}

function enforceAccessToken(string $expectedToken): void
{
    if (PHP_SAPI === 'cli') {
        return;
    }
    if ($expectedToken === '') {
        return;
    }
    $providedToken = $_SERVER['HTTP_X_BACKUP_TOKEN'] ?? $_GET['token'] ?? '';
    if (!is_string($providedToken) || $providedToken === '' || !hash_equals($expectedToken, $providedToken)) {
        fail(403, 'Forbidden.', 'Invalid backup access token.');
    }
}

function buildDumpCommand(string $mysqldumpBinary, string $databaseHost, string $databaseUser, string $databaseName): string
{
    $parts = [
        escapeshellarg($mysqldumpBinary),
        escapeshellarg("--host={$databaseHost}"),
        escapeshellarg("--user={$databaseUser}"),
        '--single-transaction',
        '--quick',
        '--triggers',
        '--routines',
        '--events',
        '--hex-blob',
        '--skip-comments',
        '--skip-dump-date',
        '--no-tablespaces',
        '--databases',
        escapeshellarg($databaseName),
    ];
    return implode(' ', $parts);
}

function createTempFile(string $directory, string $suffix): string
{
    $basePath = tempnam($directory, 'spire_backup_');
    if ($basePath === false) {
        fail(500, 'Backup storage is unavailable.', "tempnam failed for directory: {$directory}");
    }
    $targetPath = $basePath . $suffix;
    if (!@rename($basePath, $targetPath)) {
        @unlink($basePath);
        fail(500, 'Backup storage is unavailable.', "Failed to prepare temporary file: {$targetPath}");
    }
    return $targetPath;
}

function runDumpWithProcOpen(string $command, string $databasePassword, string $backupFile, string $stderrFile, int $gzipLevel): void
{
    $descriptorSpec = [
        0 => ['pipe', 'r'],
        1 => ['pipe', 'w'],
        2 => ['file', $stderrFile, 'a'],
    ];

    $environment = array_merge($_ENV, ['MYSQL_PWD' => $databasePassword]);
    $process = @proc_open($command, $descriptorSpec, $pipes, null, $environment);

    if (!is_resource($process)) {
        fail(500, 'Backup generation failed.', 'proc_open could not start mysqldump.');
    }

    fclose($pipes[0]);

    $gzipHandle = @gzopen($backupFile, "wb{$gzipLevel}");
    if ($gzipHandle === false) {
        fclose($pipes[1]);
        proc_terminate($process);
        proc_close($process);
        fail(500, 'Backup storage is unavailable.', "Unable to open compressed backup file: {$backupFile}");
    }

    while (!feof($pipes[1])) {
        $chunk = fread($pipes[1], BACKUP_CHUNK_SIZE);
        if ($chunk === false) {
            fclose($pipes[1]);
            gzclose($gzipHandle);
            proc_terminate($process);
            proc_close($process);
            fail(500, 'Backup generation failed.', 'Failed to read mysqldump output.');
        }
        if ($chunk === '') continue;

        $bytesWritten = gzwrite($gzipHandle, $chunk);
        if ($bytesWritten === false || $bytesWritten !== strlen($chunk)) {
            fclose($pipes[1]);
            gzclose($gzipHandle);
            proc_terminate($process);
            proc_close($process);
            fail(500, 'Backup storage is unavailable.', 'Failed to write compressed backup output.');
        }
    }

    fclose($pipes[1]);
    gzclose($gzipHandle);

    $exitCode = proc_close($process);
    if ($exitCode !== 0) {
        fail(500, 'Backup generation failed.', readDiagnosticOutput($stderrFile));
    }
}

function streamBackupDownload(string $backupFile, string $downloadName): void
{
    if (headers_sent()) {
        fail(500, 'Backup download failed.', 'Headers were already sent.');
    }

    while (ob_get_level() > 0) {
        ob_end_clean();
    }

    $size = filesize($backupFile);
    if ($size === false || $size === 0) {
        fail(500, 'Backup download failed.', 'Compressed backup file is missing or empty.');
    }

    header('Content-Description: File Transfer');
    header('Content-Type: application/gzip');
    header('Content-Disposition: attachment; filename="' . basename($downloadName) . '"');
    header('Content-Transfer-Encoding: binary');
    header('Content-Length: ' . $size);
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: public');
    header('Expires: 0');
    header('X-Content-Type-Options: nosniff');

    $handle = fopen($backupFile, 'rb');
    if ($handle === false) {
        fail(500, 'Backup download failed.', 'Unable to open compressed backup file for download.');
    }

    while (!feof($handle)) {
        $chunk = fread($handle, BACKUP_CHUNK_SIZE);
        if ($chunk === false) {
            fclose($handle);
            fail(500, 'Backup download failed.', 'Failed while streaming the compressed backup.');
        }
        if ($chunk === '') continue;
        echo $chunk;
        flush();
    }
    fclose($handle);
}

function archiveBackupFile(string $sourceFile, string $archiveDirectory, string $fileName): string
{
    if (!is_dir($archiveDirectory) && !@mkdir($archiveDirectory, 0750, true)) {
        fail(500, 'Backup archive storage is unavailable.', "Unable to create archive directory: {$archiveDirectory}");
    }

    $targetPath = rtrim($archiveDirectory, '/') . '/' . $fileName;

    if (!@rename($sourceFile, $targetPath)) {
        if (!@copy($sourceFile, $targetPath)) {
            fail(500, 'Backup archive storage is unavailable.', "Failed to store backup archive: {$targetPath}");
        }
        @unlink($sourceFile);
    }

    @chmod($targetPath, 0640);
    return $targetPath;
}

function readDiagnosticOutput(string $stderrFile): string
{
    if (!is_file($stderrFile)) {
        return 'No diagnostic output was captured.';
    }
    $diagnostic = file_get_contents($stderrFile, false, null, 0, BACKUP_STDERR_LIMIT);
    if ($diagnostic === false) {
        return 'Diagnostic output could not be read.';
    }
    $diagnostic = trim($diagnostic);
    return $diagnostic !== '' ? $diagnostic : 'mysqldump exited without diagnostic output.';
}

function functionAvailable(string $name): bool
{
    if (!function_exists($name)) {
        return false;
    }
    $disabled = array_map('trim', explode(',', (string) ini_get('disable_functions')));
    return !in_array($name, $disabled, true);
}

function fail(int $statusCode, string $publicMessage, string $diagnosticMessage = ''): void
{
    if ($diagnosticMessage !== '') {
        error_log("[backup.php] {$diagnosticMessage}");
    }
    http_response_code($statusCode);
    if (!headers_sent()) {
        header('Content-Type: text/plain; charset=UTF-8');
        header('Cache-Control: no-store');
    }
    exit($publicMessage);
}