<?php

// Function to check if the server is listening on a specific port
function isServerRunning($port) {
    exec("netstat -tulnp | grep :$port", $output, $return_var);
    return $return_var === 0;
}

// Define server details
$nodePath = '/home/fco1t1x9fsye/.nvm/versions/node/v21.7.1/bin/node';
$serverScript = '/home/fco1t1x9fsye/public_html/crm.signiixadvisors.com/server.js';
$logFilePath = '/home/fco1t1x9fsye/public_html/crm.signiixadvisors.com/cron_logs/logs.txt';

// Ensure log file exists
if (!file_exists($logFilePath)) {
    touch($logFilePath);
    chmod($logFilePath, 0666);
}

// Port where the server should be running (change as needed)
$serverPort = 3000;

if (isServerRunning($serverPort)) {
    echo "[" . date('h:i:s A, d-m-Y') . "] Server is running.\n";
} else {
    echo "[" . date('h:i:s A, d-m-Y') . "] Server is not running. Starting now...\n";
    exec("$nodePath $serverScript >> " . escapeshellarg($logFilePath) . " 2>&1 &");
}

?>