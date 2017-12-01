#!/bin/bash

sudo apt install libx11-dev libxtst-dev libxt-dev libx11-xcb-dev libnotify-bin sox libsox-fmt-all libasound2-dev

touch /var/log/assistant.log
sudo chmod 666 /var/log/assistant.log

echo ""
echo ""
echo 'You should be good to go. Edit run.sh to reflect where this actually lives and "./run.sh" or "forever -l /var/log/assistant.log --append start /path/to/here/index.js'
