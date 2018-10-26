#!/bin/bash

#check if docker.dmg exists and delete it if found
rm -f Docker.dmg

#download docker
echo "###############################################################"
echo "#"
echo "#  DOCKER SWARM"
echo "#"
echo "###############################################################"
echo ""
echo ""
echo "Downloading Docker for OSX, do not stop the executing ..."
echo ""
echo "You can follow the download log details @ $PWD/soajs.docker.install.log"

wget https://download.docker.com/mac/stable/Docker.dmg -o soajs.docker.install.log

#open docker wizard
open Docker.dmg