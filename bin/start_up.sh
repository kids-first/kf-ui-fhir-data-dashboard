#!/bin/bash
set -e
/bin/bash -c /usr/share/nginx/html/dashboard/env.sh
cat /usr/share/nginx/html/dashboard/env-config.js
nginx
