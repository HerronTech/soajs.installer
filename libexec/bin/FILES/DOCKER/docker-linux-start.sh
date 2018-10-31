#!/bin/bash

CERTS_PATH=${HOME}/certs
SWARM_ADVERTISE_ADDR="127.0.0.1"
SWARM_INTERNAL_PORT="2377"
SWARM_NETWORK_NAME="soajsnet"

function reloadDocker(){
    echo "Stopping Previous Docker Daemon ..."
    local CA_PATH=${CERTS_PATH}'/ca.pem'
    local SERVER_CERT_PATH=${CERTS_PATH}'/server-cert.pem'
    local SERVER_KEY_PATH=${CERTS_PATH}'/server-key.pem'

    #Stopping docker daemon
    kill -9 $(pidof dockerd)
	sleep 5

    #Starting docker daemon with TLS enabled and exposed port 2376
    #Another way to start the daemon is by using 'service docker start' and exporting the tls params in DOCKER_OPTS env variable
    #Example: DOCKER_OPTS="-D --tls=true --tlscert=/var/docker/server.pem --tlskey=/var/docker/serverkey.pem -H tcp://${SWARM_ADVERTISE_ADDR}:2376"

    echo "Starting New Daemon:"
    dockerd --tlsverify --tlscacert=${CA_PATH} --tlscert=${SERVER_CERT_PATH} --tlskey=${SERVER_KEY_PATH} -H unix:///var/run/docker.sock -H=0.0.0.0:2376 >> /dev/null &
    sleep 5

    echo "Initializing Docker Swarm ..."
    docker swarm init --advertise-addr ${SWARM_ADVERTISE_ADDR}":"${SWARM_INTERNAL_PORT}

    #Verify that docker is in swarm mode
    while [ -z $(docker info --format {{.Swarm.NodeID}}) ]; do
        echo "Waiting for swarm mode to become active ..."
        sleep 1;
    done

    echo "Creating Network ${SWARM_NETWORK_NAME} ..."
    docker network create --driver overlay ${SWARM_NETWORK_NAME}

    # when this is printed, the script will know that start command is done
    echo "----- DONE -----"
}

reloadDocker