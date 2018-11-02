#!/bin/bash

#This script installs prerequisites that enable this machine to join a docker swarm
#Compatible with Ubuntu

function displayHeadline(){
	echo "###############################################################"
    echo "#"
    echo "#  DOCKER SWARM"
    echo "#"
    echo "###############################################################"
    echo ""
    echo ""
    echo "Downloading Docker for Ubuntu, do not stop the executing ..."
    echo ""
}

function installTools(){
    echo "Updating local repositories ..."
    apt-get update

    installOneTool "apt-transport-https"
    installOneTool "ca-certificates"
    installOneTool "curl"
    installOneTool "software-properties-common"
}

function installOneTool(){
    local TOOL=${1}
    apt-get install -y ${TOOL}
}

function installDocker(){
    # Add Docker’s official GPG key:
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -

    # Set up the stable repository:
    echo "deb [arch=amd64] https://download.docker.com/linux/ubuntu xenial stable" >> /etc/apt/sources.list

    apt-get update -y

    apt-get install -y docker-ce
    systemctl stop docker
    echo "----- DONE -----"
}

#Start here########
displayHeadline
installTools
installDocker
###################