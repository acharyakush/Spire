#!/bin/bash

# Find the PID of the Node.js process running uat-server.js
PID=$(ps aux | grep '[n]ode /home/fco1t1x9fsye/public_html/test.signiixadvisors.com/uat-server.js' | awk '{print $2}')

if [ -n "$PID" ]; then
    echo "Found Node.js process with PID: $PID"
    
    # Attempt to kill the process gracefully
    kill $PID
    
    # Wait a moment for the process to terminate
    sleep 2
    
    # Check if the process is still running
    if ps -p $PID > /dev/null; then
        echo "Process did not terminate, force killing PID: $PID"
        kill -9 $PID
    else
        echo "Process terminated successfully."
    fi
else
    echo "No Node.js process found."
fi
