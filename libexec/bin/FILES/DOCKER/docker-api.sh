#!/bin/bash

#This script Deploys a local manager for docker and generates a token that can be used to interact with docker replacing the usage of certificates
#Compatible with Mac

SWARM_API_CONTAINER_NAME=manager-docker-api
SWARM_API_IMAGE=soajsorg
SWARM_TOKEN_LENGTH=512
SWARM_PORT_DATA=443
SWARM_PORT_MAINTENANCE=444
SWARM_API_TOKEN=""
SWARM_NETWORK_NAME="soajsnet"

function createContainer(){

	echo "Creating Network ${SWARM_NETWORK_NAME} ..."
    docker network create --driver overlay ${SWARM_NETWORK_NAME}

	echo "Joining swarm"
	docker swarm join 0.0.0.0:2376

	echo "Pulling soajsorg/docker-api ..."
	docker pull soajsorg/docker-api >> /dev/null
	echo "Docker Image Pulled, creating manager container ..."

	SWARM_API_TOKEN=$(openssl rand -hex $SWARM_TOKEN_LENGTH)
    docker run -d --name $SWARM_API_CONTAINER_NAME --restart=always -e DOCKER_API_TOKEN=$SWARM_API_TOKEN -e NODE_TYPE=manager -e NODE_ENV=production -e DOCKER_API_MAINTENANCE_MANAGER_PORT=$SWARM_PORT_DATA -e DOCKER_API_MAINTENANCE_WORKER_PORT=$SWARM_PORT_DATA -v /var/run/docker.sock:/var/run/docker.sock -p $SWARM_PORT_DATA:2376 -p $SWARM_PORT_MAINTENANCE:2377 -w /opt/soajs/deployer $SWARM_API_IMAGE/docker-api node . -T dockerapi >> /dev/null

    sleep 15

	echo ""
	if [ "$(docker ps -q -f name=$SWARM_API_CONTAINER_NAME)" ]; then
		echo "###############################################################"
		echo "#"
		echo "#  DOCKER SWARM"
		echo "#"
		echo "###############################################################"
		echo ""
		echo "Connect to Docker Swarm:"
		echo "------------------------"
        echo ""
		echo IP ADDRESS: $MACHINE_IP
        echo ""
        echo DOCKER PORTt: 443
        echo ""
		echo "DOCKER TOKEN: $SWARM_API_TOKEN"
		linuxNote
	else
        echo 'It Appears Docker Swarm is not installed or not running'
        echo ''
        echo "Install and/or start Docker Swarm first, then you can run this command to connect to it."
        echo ''
        echo "[Install] > soajs docker install"
        echo "[Start]   > soajs docker start"
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
		echo "###############################################################"
        echo "#"
        echo "#  DOCKER SWARM"
        echo "#"
        echo "###############################################################"
        echo ""
        echo "Connect to Docker Swarm:"
        echo "------------------------"
        echo ""
        echo IP ADDRESS: $MACHINE_IP
        echo ""
        echo DOCKER PORTt: 443
        echo ""
		SWARM_API_TOKEN=$(docker exec $SWARM_API_CONTAINER_NAME bash -c 'echo "$DOCKER_API_TOKEN"')
        echo "DOCKER TOKEN: $SWARM_API_TOKEN"
        linuxNote
    fi

}

function linuxNote(){
	# check the platform to determine which ip to use: linux | darwin
    unamestr=`uname`

    if [[ "$unamestr" == 'Linux' ]]; then
		echo ""
		echo "NOTE:"
		echo "Please use (sudo) when you want to interact with Docker Swarm via your terminal."
		echo "Ex: sudo docker ps"
    fi
}

#Start here########
deployDockerAPI
###################
