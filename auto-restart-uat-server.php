<?php

date_default_timezone_set('Asia/Kolkata');

// Function to get formatted timestamp
function getFormattedTimestamp() {
    return date('h:i:s A, d-m-Y');
}

// Check if the UAT server is running
exec("ps aux | grep 'uat-server.js' | grep 'uat.signiixadvisors.com' | grep -v grep", $output, $return_var);

if ($return_var === 0) {
    echo "[" . getFormattedTimestamp() . "] UAT Server is running.\n";
} else {
    echo "[" . getFormattedTimestamp() . "] UAT Server is not running.\n";
    
    // Start the server.js using Node.js
    exec('/home/fco1t1x9fsye/.nvm/versions/node/v21.7.1/bin/node /home/fco1t1x9fsye/public_html/uat.signiixadvisors.com/uat-server.js > /dev/null &');
}
?>