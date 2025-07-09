#!/bin/bash

# Unzip the .next.zip file
if [ -f ".next.zip" ]; then
    echo "Unzipping .next.zip"
    unzip .next.zip
else
    echo ".next.zip file not found"
    exit 1
fi

# Restart the PM2 process
echo "Restarting PM2 process: spire-crm"
pm2 restart spire-crm