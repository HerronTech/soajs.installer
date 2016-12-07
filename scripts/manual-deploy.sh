#!/bin/bash

export NODE_PATH=/usr/local/bin/node
export NPM_PATH=/usr/local/bin/npm
export DEPLOY_FROM=NPM
export SOAJS_GIT_DASHBOARD_BRANCH=master
export SOAJS_GIT_BRANCH=master
export SOAJS_DATA_FOLDER=/opt/soajs/node_modules/soajs.installer/data/startup/
export SOAJS_PROFILE=/opt/soajs/node_modules/soajs.installer/data/startup/profile.js
export INSTALLER_DIR=/opt/soajs/node_modules/soajs.installer/scripts/
export SOAJS_DEPLOY_DIR=/mnt
export API_PREFIX=dashboard-api
export SITE_PREFIX=dashboard
export MASTER_DOMAIN=soajs.org

#Run Deployment Script ...
/usr/local/bin/node /opt/soajs/node_modules/soajs.installer/scripts/manual.js

#Start Nginx ...
brew services start nginx

ps aux | grep node
