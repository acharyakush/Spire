#!/bin/bash

# Find all PIDs of processes running "node /home/fco1t1x9fsye/public_html/test.signiixadvisors.com/uat-server.js"
# -f option in pgrep allows searching the entire command line
PIDS=$(pgrep -f "node /home/fco1t1x9fsye/public_html/test.signiixadvisors.com/uat-server.js")

# Check if any PIDs were found
if [ -n "$PIDS" ]; then
    # Loop through each PID (in case there are multiple instances running)
    for PID in $PIDS; do
        echo "Killing PID: $PID"
        
        # Attempt to terminate the process gracefully
        kill "$PID"

        # Sleep for 2 seconds to give the process time to shut down gracefully
        sleep 2

        # Check if the process is still running
        if ps -p "$PID" > /dev/null; then
            echo "Force killing PID: $PID"
            
            # Forcefully terminate the process if it did not shut down
            kill -9 "$PID"
        else
            echo "PID $PID terminated successfully."
        fi
    done
else
    # If no processes were found, output this message
    echo "No Node.js process found."
fi