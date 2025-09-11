#!/bin/bash

# Test nginx configuration
echo "Testing nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "Configuration test passed. Reloading nginx..."
    sudo systemctl reload nginx
    echo "Nginx reloaded successfully."
else
    echo "Configuration test failed. Not reloading nginx."
    exit 1
fi
