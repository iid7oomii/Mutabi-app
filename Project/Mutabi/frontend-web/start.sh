#!/bin/sh
PORT=${PORT:-80}
API_URL=${API_URL:-https://api.mutabi.app}
envsubst '${PORT} ${API_URL}' < /etc/nginx/conf.d/nginx.conf.template > /etc/nginx/conf.d/default.conf
exec nginx -g 'daemon off;'
