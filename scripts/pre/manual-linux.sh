#!/bin/bash

# install MongoDB & Nginx
sudo apt-get update && sudo apt-get install -y mongodb nginx
sudo service mongodb start
sudo service nginx stop

ps aux | grep mongo
ps aux | grep nginx