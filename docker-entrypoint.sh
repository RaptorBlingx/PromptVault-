#!/bin/sh

# Generate env-config.js
echo "window.env = {" > /usr/share/nginx/html/env-config.js
echo "  API_KEY: \"${API_KEY}\"" >> /usr/share/nginx/html/env-config.js
echo "};" >> /usr/share/nginx/html/env-config.js

# Execute the CMD
exec "$@"
