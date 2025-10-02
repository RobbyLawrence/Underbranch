#!/bin/bash

# Test nginx configuration
echo "Testing nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "Configuration test passed. Reloading nginx..."
    if sudo systemctl reload nginx; then
        echo "Nginx reloaded successfully."
    else
        echo "Nginx is not running. Starting now..."
        if sudo systemctl start nginx; then
            echo "Nginx started successfully."
        else
            echo "Failed to start nginx. Check the logs for errors."
            exit 1
        fi
    fi
else
    echo "Configuration test failed. Not reloading nginx."
    exit 1
fi
