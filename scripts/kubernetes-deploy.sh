#!/bin/bash

export SOAJS_GIT_DASHBOARD_BRANCH=develop
export SOAJS_GIT_BRANCH=develop
export SOAJS_PROFILE=/opt/soajs/node_modules/soajs.installer/data/startup/profile.js
export NODE_PATH=/usr/local/bin/node
export API_PREFIX=dashboard-api
export SITE_PREFIX=dashboard
export MASTER_DOMAIN=soajs.org
export MONGO_EXT=false
export SOAJS_DATA_FOLDER=/opt/soajs/node_modules/soajs.installer/data/startup/
export SOAJS_IMAGE_PREFIX=soajsorg
export NGINX_HTTP_PORT=80
export NGINX_HTTPS_PORT=443
export CONTAINER_HOST=192.168.99.100
export CONTAINER_PORT=8443
export SOAJS_DOCKER_REPLICA=1
export SOAJS_DOCKER_CERTS_PATH=/Users/Nicolas/.minikube
sudo killall mongo

/usr/local/bin/node /opt/soajs/node_modules/soajs.installer/scripts/kubernetes.js
