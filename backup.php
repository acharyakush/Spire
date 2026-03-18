<?php
declare(strict_types=1);

const BACKUP_CHUNK_SIZE = 1048576;
const BACKUP_STDERR_LIMIT = 16384;

ignore_user_abort(true);
set_time_limit(0);

$databaseHost = getenv("BACKUP_DB_HOST") ?: "localhost";
$databaseUser = getenv("BACKUP_DB_USER") ?: "spire";
$databaseName = getenv("BACKUP_DB_NAME") ?: "spire";
$databasePassword = getenv("BACKUP_DB_PASS");
$defaultsFile = getenv("MYSQL_CREDENTIALS_FILE") ?: "";
$accessToken = getenv("BACKUP_ACCESS_TOKEN") ?: "";
$emailTo = getenv("BACKUP_EMAIL_TO") ?: "";
$emailFrom = getenv("BACKUP_EMAIL_FROM") ?: "";
$emailSubject = getenv("BACKUP_EMAIL_SUBJECT") ?: "Spire DB Backup";
$emailBody = getenv("BACKUP_EMAIL_BODY") ?: "Attached is the latest Spire database backup.";
$sendmailBinary = getenv("BACKUP_SENDMAIL_BIN") ?: "";
$archiveDirectory = getenv("BACKUP_ARCHIVE_DIR") ?: (__DIR__ . DIRECTORY_SEPARATOR . "backups");
$mysqldumpBinary = getenv("MYSQLDUMP_BIN") ?: "mysqldump";
$tempDirectory = getenv("BACKUP_TEMP_DIR") ?: sys_get_temp_dir();
$gzipLevel = (int) (getenv("BACKUP_GZIP_LEVEL") ?: "6");

if ($defaultsFile === "") {
	$homeDirectory = getenv("HOME") ?: ($_SERVER["HOME"] ?? "");
	$defaultMyCnf = $homeDirectory !== "" ? rtrim($homeDirectory, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . ".my.cnf" : "";

	if ($defaultMyCnf !== "" && is_readable($defaultMyCnf)) {
		$defaultsFile = $defaultMyCnf;
	}
}

if ((!is_string($databasePassword) || $databasePassword === "") && $defaultsFile === "") {
	$databasePassword = "SpireCrmBySigniixAdvisors#2024";
}

$cleanupFiles = [];

register_shutdown_function(static function () use (&$cleanupFiles) {
	foreach ($cleanupFiles as $file) {
		if (is_string($file) && $file !== "" && is_file($file)) {
			@unlink($file);
		}
	}
});

validateConfiguration($defaultsFile, $databasePassword, $tempDirectory, $gzipLevel);
enforceAccessToken($accessToken);

$backupFile = createTempFile($tempDirectory, ".sql.gz");
$stderrFile = createTempFile($tempDirectory, ".err");
$fallbackSqlFile = createTempFile($tempDirectory, ".sql");
$cleanupFiles = [$backupFile, $stderrFile, $fallbackSqlFile];

$command = buildDumpCommand($mysqldumpBinary, $databaseHost, $databaseUser, $databaseName, $defaultsFile);

if (functionAvailable("proc_open")) {
	runDumpWithProcOpen($command, $databasePassword, $backupFile, $stderrFile, $gzipLevel);
} elseif (functionAvailable("exec")) {
	runDumpWithExecFallback($command, $databasePassword, $backupFile, $fallbackSqlFile, $stderrFile, $gzipLevel);
} else {
	fail(500, "Backup generation is unavailable on this server.", "Neither proc_open nor exec is available.");
}

if (!is_file($backupFile) || filesize($backupFile) === 0) {
	fail(500, "Backup generation failed.", readDiagnosticOutput($stderrFile));
}

$downloadName = sprintf("%s_%s.sql.gz", $databaseName, date("Y-m-d_H-i-s"));
$archivedBackupFile = archiveBackupFile($backupFile, $archiveDirectory, $downloadName);
$cleanupFiles = [$stderrFile, $fallbackSqlFile];

if (PHP_SAPI === "cli") {
	sendBackupEmail($archivedBackupFile, $downloadName, $emailTo, $emailFrom, $emailSubject, $emailBody, $sendmailBinary);
	writeCliMessage("Backup emailed successfully to {$emailTo} and saved to {$archivedBackupFile}.");
	exit(0);
}

streamBackupDownload($archivedBackupFile, $downloadName);

exit;

function validateConfiguration($defaultsFile, $databasePassword, $tempDirectory, $gzipLevel)
{
	if (!is_dir($tempDirectory) || !is_writable($tempDirectory)) {
		fail(500, "Backup storage is unavailable.", "Temporary directory is not writable: {$tempDirectory}");
	}

	if ($gzipLevel < 1 || $gzipLevel > 9) {
		fail(500, "Backup configuration is invalid.", "BACKUP_GZIP_LEVEL must be between 1 and 9.");
	}

	if (!functionAvailable("gzopen")) {
		fail(500, "Backup compression is unavailable on this server.", "The zlib extension is required.");
	}

	if ($defaultsFile !== "") {
		if (!is_readable($defaultsFile)) {
			fail(500, "Backup configuration is invalid.", "MYSQL_CREDENTIALS_FILE is not readable: {$defaultsFile}");
		}

		return;
	}

	if (!is_string($databasePassword) || $databasePassword === "") {
		fail(500, "Backup configuration is incomplete.", "Configure MYSQL_CREDENTIALS_FILE or BACKUP_DB_PASS.");
	}
}

function enforceAccessToken($expectedToken)
{
	if (PHP_SAPI === "cli") {
		return;
	}

	if ($expectedToken === "") {
		return;
	}

	$providedToken = $_SERVER["HTTP_X_BACKUP_TOKEN"] ?? $_GET["token"] ?? "";

	if (!is_string($providedToken) || $providedToken === "" || !hash_equals($expectedToken, $providedToken)) {
		fail(403, "Forbidden.", "Invalid backup access token.");
	}
}

function buildDumpCommand($mysqldumpBinary, $databaseHost, $databaseUser, $databaseName, $defaultsFile)
{
	$parts = [escapeshellarg($mysqldumpBinary)];

	if ($defaultsFile !== "") {
		$parts[] = escapeshellarg("--defaults-extra-file={$defaultsFile}");
	}

	$parts[] = escapeshellarg("--host={$databaseHost}");
	$parts[] = escapeshellarg("--user={$databaseUser}");
	$parts[] = "--single-transaction";
	$parts[] = "--quick";
	$parts[] = "--triggers";
	$parts[] = "--routines";
	$parts[] = "--events";
	$parts[] = "--hex-blob";
	$parts[] = "--skip-comments";
	$parts[] = "--skip-dump-date";
	$parts[] = "--no-tablespaces";
	$parts[] = "--databases";
	$parts[] = escapeshellarg($databaseName);

	return implode(" ", $parts);
}

function createTempFile($directory, $suffix)
{
	$basePath = tempnam($directory, "spire_backup_");

	if ($basePath === false) {
		fail(500, "Backup storage is unavailable.", "tempnam failed for directory: {$directory}");
	}

	$targetPath = $basePath . $suffix;

	if (!@rename($basePath, $targetPath)) {
		@unlink($basePath);
		fail(500, "Backup storage is unavailable.", "Failed to prepare temporary file: {$targetPath}");
	}

	return $targetPath;
}

function runDumpWithProcOpen($command, $databasePassword, $backupFile, $stderrFile, $gzipLevel)
{
	$descriptorSpec = [
		0 => ["pipe", "r"],
		1 => ["pipe", "w"],
		2 => ["file", $stderrFile, "a"],
	];

	$environment = null;

	if (is_string($databasePassword) && $databasePassword !== "") {
		$environment = array_merge($_ENV, ["MYSQL_PWD" => $databasePassword]);
	}

	$process = @proc_open($command, $descriptorSpec, $pipes, null, $environment);

	if (!is_resource($process)) {
		fail(500, "Backup generation failed.", "proc_open could not start mysqldump.");
	}

	fclose($pipes[0]);

	$gzipHandle = @gzopen($backupFile, "wb{$gzipLevel}");

	if ($gzipHandle === false) {
		fclose($pipes[1]);
		proc_terminate($process);
		proc_close($process);
		fail(500, "Backup storage is unavailable.", "Unable to open compressed backup file: {$backupFile}");
	}

	while (!feof($pipes[1])) {
		$chunk = fread($pipes[1], BACKUP_CHUNK_SIZE);

		if ($chunk === false) {
			fclose($pipes[1]);
			gzclose($gzipHandle);
			proc_terminate($process);
			proc_close($process);
			fail(500, "Backup generation failed.", "Failed to read mysqldump output.");
		}

		if ($chunk === "") {
			continue;
		}

		$bytesWritten = gzwrite($gzipHandle, $chunk);

		if ($bytesWritten === false || $bytesWritten !== strlen($chunk)) {
			fclose($pipes[1]);
			gzclose($gzipHandle);
			proc_terminate($process);
			proc_close($process);
			fail(500, "Backup storage is unavailable.", "Failed to write compressed backup output.");
		}
	}

	fclose($pipes[1]);
	gzclose($gzipHandle);

	$exitCode = proc_close($process);

	if ($exitCode !== 0) {
		fail(500, "Backup generation failed.", readDiagnosticOutput($stderrFile));
	}
}

function runDumpWithExecFallback($command, $databasePassword, $backupFile, $fallbackSqlFile, $stderrFile, $gzipLevel)
{
	$fullCommand = $command . " > " . escapeshellarg($fallbackSqlFile) . " 2> " . escapeshellarg($stderrFile);
	$previousPassword = getenv("MYSQL_PWD");

	if (is_string($databasePassword) && $databasePassword !== "") {
		putenv("MYSQL_PWD={$databasePassword}");
	}

	$exitCode = 0;
	exec($fullCommand, $output, $exitCode);

	if ($previousPassword === false) {
		putenv("MYSQL_PWD");
	} else {
		putenv("MYSQL_PWD={$previousPassword}");
	}

	unset($output);

	if ($exitCode !== 0) {
		fail(500, "Backup generation failed.", readDiagnosticOutput($stderrFile));
	}

	compressSqlBackup($fallbackSqlFile, $backupFile, $gzipLevel);
}

function compressSqlBackup($sourceFile, $targetFile, $gzipLevel)
{
	$sourceHandle = @fopen($sourceFile, "rb");

	if ($sourceHandle === false) {
		fail(500, "Backup generation failed.", "Unable to open SQL dump for compression: {$sourceFile}");
	}

	$gzipHandle = @gzopen($targetFile, "wb{$gzipLevel}");

	if ($gzipHandle === false) {
		fclose($sourceHandle);
		fail(500, "Backup storage is unavailable.", "Unable to open compressed backup file: {$targetFile}");
	}

	while (!feof($sourceHandle)) {
		$chunk = fread($sourceHandle, BACKUP_CHUNK_SIZE);

		if ($chunk === false) {
			fclose($sourceHandle);
			gzclose($gzipHandle);
			fail(500, "Backup generation failed.", "Failed to read SQL dump during compression.");
		}

		if ($chunk === "") {
			continue;
		}

		$bytesWritten = gzwrite($gzipHandle, $chunk);

		if ($bytesWritten === false || $bytesWritten !== strlen($chunk)) {
			fclose($sourceHandle);
			gzclose($gzipHandle);
			fail(500, "Backup storage is unavailable.", "Failed to write compressed SQL backup.");
		}
	}

	fclose($sourceHandle);
	gzclose($gzipHandle);
}

function streamBackupDownload($backupFile, $downloadName)
{
	if (headers_sent()) {
		fail(500, "Backup download failed.", "Headers were already sent before the backup response.");
	}

	while (ob_get_level() > 0) {
		ob_end_clean();
	}

	$size = filesize($backupFile);

	if ($size === false || $size === 0) {
		fail(500, "Backup download failed.", "Compressed backup file is missing or empty.");
	}

	header("Content-Description: File Transfer");
	header("Content-Type: application/gzip");
	header('Content-Disposition: attachment; filename="' . basename($downloadName) . '"');
	header("Content-Transfer-Encoding: binary");
	header("Content-Length: " . $size);
	header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
	header("Pragma: public");
	header("Expires: 0");
	header("X-Content-Type-Options: nosniff");

	$handle = fopen($backupFile, "rb");

	if ($handle === false) {
		fail(500, "Backup download failed.", "Unable to open compressed backup file for download.");
	}

	while (!feof($handle)) {
		$chunk = fread($handle, BACKUP_CHUNK_SIZE);

		if ($chunk === false) {
			fclose($handle);
			fail(500, "Backup download failed.", "Failed while streaming the compressed backup.");
		}

		if ($chunk === "") {
			continue;
		}

		echo $chunk;
		flush();
	}

	fclose($handle);
}

function archiveBackupFile($sourceFile, $archiveDirectory, $fileName)
{
	if (!is_dir($archiveDirectory) && !@mkdir($archiveDirectory, 0700, true)) {
		fail(500, "Backup archive storage is unavailable.", "Unable to create archive directory: {$archiveDirectory}");
	}

	if (!is_writable($archiveDirectory)) {
		fail(500, "Backup archive storage is unavailable.", "Archive directory is not writable: {$archiveDirectory}");
	}

	$targetPath = buildUniqueArchivePath($archiveDirectory, $fileName);

	if (!@rename($sourceFile, $targetPath)) {
		if (!@copy($sourceFile, $targetPath)) {
			fail(500, "Backup archive storage is unavailable.", "Failed to store backup archive: {$targetPath}");
		}

		@unlink($sourceFile);
	}

	if (!is_file($targetPath) || filesize($targetPath) === 0) {
		fail(500, "Backup archive storage is unavailable.", "Archived backup file is missing or empty: {$targetPath}");
	}

	@chmod($targetPath, 0600);

	return $targetPath;
}

function buildUniqueArchivePath($archiveDirectory, $fileName)
{
	$archiveDirectory = rtrim($archiveDirectory, DIRECTORY_SEPARATOR);
	$baseName = basename($fileName);
	$extension = pathinfo($baseName, PATHINFO_EXTENSION);
	$nameWithoutExtension = $extension !== "" ? substr($baseName, 0, -1 * (strlen($extension) + 1)) : $baseName;
	$candidate = $archiveDirectory . DIRECTORY_SEPARATOR . $baseName;
	$counter = 1;

	while (file_exists($candidate)) {
		$suffix = "_" . str_pad((string) $counter, 3, "0", STR_PAD_LEFT);
		$candidate = $archiveDirectory . DIRECTORY_SEPARATOR . $nameWithoutExtension . $suffix . ($extension !== "" ? "." . $extension : "");
		$counter++;
	}

	return $candidate;
}

function sendBackupEmail($backupFile, $attachmentName, $emailTo, $emailFrom, $emailSubject, $emailBody, $sendmailBinary)
{
	if (!is_string($emailTo) || trim($emailTo) === "") {
		fail(500, "Backup email is not configured.", "BACKUP_EMAIL_TO is required for CLI execution.");
	}

	$emailTo = trim($emailTo);
	$emailFrom = normalizeEmailAddress($emailFrom !== "" ? $emailFrom : $emailTo);

	if ($emailFrom === "") {
		fail(500, "Backup email configuration is invalid.", "BACKUP_EMAIL_FROM or BACKUP_EMAIL_TO must contain a valid email address.");
	}

	$resolvedSendmail = resolveSendmailBinary($sendmailBinary);

	if ($resolvedSendmail === "") {
		fail(500, "Backup email delivery is unavailable.", "A sendmail-compatible binary was not found. Configure BACKUP_SENDMAIL_BIN.");
	}

	$boundary = "spire-backup-" . bin2hex(random_bytes(12));
	$command = escapeshellarg($resolvedSendmail) . " -t -i";
	$descriptorSpec = [
		0 => ["pipe", "w"],
		1 => ["pipe", "w"],
		2 => ["pipe", "w"],
	];

	$process = @proc_open($command, $descriptorSpec, $pipes);

	if (!is_resource($process)) {
		fail(500, "Backup email delivery failed.", "Unable to start sendmail process.");
	}

	fwrite($pipes[0], "To: {$emailTo}\r\n");
	fwrite($pipes[0], "From: {$emailFrom}\r\n");
	fwrite($pipes[0], "Subject: {$emailSubject}\r\n");
	fwrite($pipes[0], "MIME-Version: 1.0\r\n");
	fwrite($pipes[0], "Content-Type: multipart/mixed; boundary=\"{$boundary}\"\r\n");
	fwrite($pipes[0], "\r\n");
	fwrite($pipes[0], "--{$boundary}\r\n");
	fwrite($pipes[0], "Content-Type: text/plain; charset=UTF-8\r\n");
	fwrite($pipes[0], "Content-Transfer-Encoding: 8bit\r\n");
	fwrite($pipes[0], "\r\n");
	fwrite($pipes[0], normalizeEmailBody($emailBody) . "\r\n\r\n");
	fwrite($pipes[0], "--{$boundary}\r\n");
	fwrite($pipes[0], "Content-Type: application/gzip; name=\"" . addcslashes($attachmentName, "\"\\") . "\"\r\n");
	fwrite($pipes[0], "Content-Transfer-Encoding: base64\r\n");
	fwrite($pipes[0], "Content-Disposition: attachment; filename=\"" . addcslashes($attachmentName, "\"\\") . "\"\r\n");
	fwrite($pipes[0], "\r\n");

	streamBase64Attachment($pipes[0], $backupFile);

	fwrite($pipes[0], "\r\n--{$boundary}--\r\n");
	fclose($pipes[0]);

	$stdout = stream_get_contents($pipes[1]);
	$stderr = stream_get_contents($pipes[2]);
	fclose($pipes[1]);
	fclose($pipes[2]);

	$exitCode = proc_close($process);

	if ($exitCode !== 0) {
		$diagnostic = trim($stderr !== "" ? $stderr : $stdout);
		fail(500, "Backup email delivery failed.", $diagnostic !== "" ? $diagnostic : "sendmail exited with a non-zero status.");
	}
}

function streamBase64Attachment($outputHandle, $filePath)
{
	$inputHandle = fopen($filePath, "rb");

	if ($inputHandle === false) {
		fail(500, "Backup email delivery failed.", "Unable to open backup file for email attachment.");
	}

	while (!feof($inputHandle)) {
		$chunk = fread($inputHandle, 57);

		if ($chunk === false) {
			fclose($inputHandle);
			fail(500, "Backup email delivery failed.", "Failed while reading backup file for email attachment.");
		}

		if ($chunk === "") {
			continue;
		}

		fwrite($outputHandle, base64_encode($chunk) . "\r\n");
	}

	fclose($inputHandle);
}

function resolveSendmailBinary($configuredBinary)
{
	if (is_string($configuredBinary) && $configuredBinary !== "") {
		return $configuredBinary;
	}

	$iniSendmail = trim((string) ini_get("sendmail_path"));

	if ($iniSendmail !== "") {
		$parts = preg_split('/\s+/', $iniSendmail);

		if (is_array($parts) && isset($parts[0]) && $parts[0] !== "") {
			return $parts[0];
		}
	}

	$candidates = ["/usr/sbin/sendmail", "/usr/lib/sendmail"];

	foreach ($candidates as $candidate) {
		if (is_executable($candidate)) {
			return $candidate;
		}
	}

	return "";
}

function normalizeEmailAddress($email)
{
	$email = trim((string) $email);

	return filter_var($email, FILTER_VALIDATE_EMAIL) ? $email : "";
}

function normalizeEmailBody($body)
{
	$body = str_replace(["\r\n", "\r"], "\n", (string) $body);

	return str_replace("\n", "\r\n", $body);
}

function writeCliMessage($message)
{
	if (defined("STDOUT")) {
		fwrite(STDOUT, $message . PHP_EOL);
	}
}

function readDiagnosticOutput($stderrFile)
{
	if (!is_file($stderrFile)) {
		return "No diagnostic output was captured.";
	}

	$diagnostic = file_get_contents($stderrFile, false, null, 0, BACKUP_STDERR_LIMIT);

	if ($diagnostic === false) {
		return "Diagnostic output could not be read.";
	}

	$diagnostic = trim($diagnostic);

	return $diagnostic !== "" ? $diagnostic : "mysqldump exited without diagnostic output.";
}

function functionAvailable($name)
{
	if (!function_exists($name)) {
		return false;
	}

	$disabledFunctions = array_map("trim", explode(",", (string) ini_get("disable_functions")));

	return !in_array($name, $disabledFunctions, true);
}

function fail($statusCode, $publicMessage, $diagnosticMessage = "")
{
	if ($diagnosticMessage !== "") {
		error_log("[backup.php] {$diagnosticMessage}");
	}

	http_response_code($statusCode);

	if (!headers_sent()) {
		header("Content-Type: text/plain; charset=UTF-8");
		header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
		header("Pragma: no-cache");
	}

	exit($publicMessage);
}
