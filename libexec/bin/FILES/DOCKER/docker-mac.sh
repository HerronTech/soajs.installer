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

CURL=$(command -v curl)
$CURL -Lo Docker.dmg  https://download.docker.com/mac/stable/Docker.dmg

#open docker wizard
open Docker.dmg