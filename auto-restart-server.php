<?php

date_default_timezone_set('Asia/Kolkata');

// Function to get formatted timestamp
function getFormattedTimestamp() {
    return date('h:i:s A, d-m-Y');
}

// Path to the log file
$logFilePath = '/home/fco1t1x9fsye/public_html/crm.signiixadvisors.com/cron_logs/logs.txt';

// Check if the log file exists, if not create it
if (!file_exists($logFilePath)) {
    touch($logFilePath); // Create the file
    chmod($logFilePath, 0666); // Optional: Set permissions
}

// Check if the UAT server is running
exec("pgrep -f 'server.js'", $output, $return_var);

if ($return_var === 0) {
    echo "[" . getFormattedTimestamp() . "] Server is running.\n";
} else {
    echo "[" . getFormattedTimestamp() . "] Server is not running. Starting now ...\n";

    // Start the server.js using Node.js and append output to the log file
    exec('/home/fco1t1x9fsye/.nvm/versions/node/v21.7.1/bin/node /home/fco1t1x9fsye/public_html/crm.signiixadvisors.com/server.js >> ' . escapeshellarg($logFilePath) . ' 2>&1 &');
}
?>
