#!/bin/bash

# Stop the PM2 process
echo "Stopping PM2 process: spire-crm"
pm2 stop spire-crm

# Delete the .next.zip file
if [ -f ".next.zip" ]; then
    echo "Deleting .next.zip file"
    rm .next.zip
else
    echo ".next.zip not found"
fi

# Delete the .next folder
if [ -d ".next" ]; then
    echo "Deleting .next directory"
    rm -rf .next
else
    echo ".next directory not found"
fi