#!/bin/bash
cd "$(dirname "$0")"
/usr/local/bin/node cron.js >> cron.log 2>&1 