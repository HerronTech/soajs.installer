#!/bin/bash

#download docker
echo "###############################################################"
echo "#"
echo "#  DOCKER SWARM"
echo "#"
echo "###############################################################"
echo ""
echo ""

if [ -e Docker.dmg ]
then
	echo "Docker already downloaded ..."
else
	echo "Downloading Docker for OSX, do not stop the executing ..."
    echo ""
	CURL=$(command -v curl)
    $CURL -Lo Docker.dmg  https://download.docker.com/mac/stable/Docker.dmg
fi

#open docker wizard
open Docker.dmg