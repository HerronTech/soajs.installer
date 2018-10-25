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
    docker run -d --name $SWARM_API_CONTAINER_NAME --restart=always -e DOCKER_API_TOKEN=$SWARM_API_TOKEN -e NODE_TYPE=manager -e NODE_ENV=production -e DOCKER_API_MAINTENANCE_MANAGER_PORT=$SWARM_PORT_DATA -e DOCKER_API_MAINTENANCE_WORKER_PORT=$SWARM_PORT_DATA -v /var/run/docker.sock:/var/run/docker.sock -p $SWARM_PORT_DATA:2376 -p $SWARM_PORT_MAINTENANCE:2377 -w /opt/soajs/deployer $SWARM_API_IMAGE/docker-api node . -T dockerapi >> /dev/null
	echo ""
	if [ "$(docker ps -q -f name=$SWARM_API_CONTAINER_NAME)" ]; then
		echo You can connect to Docker Swarm using the following information:
		echo "###############################################################"
		echo ""
		echo ""
		echo Docker Ip: 127.0.0.1
        echo ""
        echo Docker Port: 443
        echo ""
		echo Token:
		echo $SWARM_API_TOKEN
	else
        echo "unable to deploy manager container"
	fi
}

function deployDockerAPI(){

	if [ ! "$(docker ps -q -f name=$SWARM_API_CONTAINER_NAME)" ]; then
        if [ "$(docker ps -aq -f status=exited -f name=$SWARM_API_CONTAINER_NAME)" ]; then
            # cleanup
            docker rm -f $SWARM_API_CONTAINER_NAME
        fi
        createContainer
	else
		echo You can connect to Docker Swarm using the following information:
		echo "###############################################################"
		echo ""
		echo ""
		echo Docker Ip: 127.0.0.1
		echo ""
		echo Docker Port: 443
		echo ""
		echo Docker Token:
		docker exec $SWARM_API_CONTAINER_NAME bash -c 'echo "$DOCKER_API_TOKEN"'


    fi

}

#Start here########
deployDockerAPI
###################
