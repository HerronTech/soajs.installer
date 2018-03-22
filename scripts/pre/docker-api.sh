#!/bin/bash

#This script Deploys a local manager for docker and generates a token that can be used to interact with docker replacing the usage of certificates
#Compatible with Mac

SWARM_API_CONTAINER_NAME=manager-docker-api
SWARM_API_IMAGE=soajsorg
SWARM_TOKEN_LENGTH=512
SWARM_PORT_DATA=443
SWARM_PORT_MAINTENANCE=444
SWARM_API_TOKEN=""

function createContainer(){
	SWARM_API_TOKEN=$(openssl rand -hex $SWARM_TOKEN_LENGTH)
    echo "Deploying new manager container..."
    docker run -d --name $SWARM_API_CONTAINER_NAME --restart=always -e DOCKER_API_TOKEN=$SWARM_API_TOKEN -e NODE_TYPE=manager -e NODE_ENV=production -v /var/run/docker.sock:/var/run/docker.sock -p $SWARM_PORT_DATA:2376 -p $SWARM_PORT_MAINTENANCE:2377 -w /opt/soajs/deployer $SWARM_API_IMAGE/docker-api node . -T dockerapi

	if [ "$(docker ps -q -f name=$SWARM_API_CONTAINER_NAME)" ]; then
		return 1
	else
	    docker rm -f $SWARM_API_CONTAINER_NAME
		return 0
	fi
}

function deployDockerAPI(){
	echo "cleaning up old manager container"
	docker rm -f $SWARM_API_CONTAINER_NAME
	echo ""

	createContainer
    if [ $? == 1 ]; then
        echo ""
        echo "manager container deployed"
        echo ""
        echo "***************************************************************"
        echo "* Use the following Token to connect to your docker deployment:"
        echo "***************************************************************"
        echo "Token:"
        echo $SWARM_API_TOKEN
    else
        echo ""
		echo "unable to deploy manager container, check the error details in message above"
		echo ""
	fi
}

#Start here########
deployDockerAPI
###################