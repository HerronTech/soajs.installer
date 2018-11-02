#!/bin/bash

SWARM_ADVERTISE_ADDR="127.0.0.1"
SWARM_INTERNAL_PORT="2377"

echo "Starting new Docker Daemon ..."
systemctl start docker && systemctl enable docker
sleep 5

echo "Initializing Docker Swarm ..."
docker swarm init --advertise-addr ${SWARM_ADVERTISE_ADDR}:${SWARM_INTERNAL_PORT}

#Verify that docker is in swarm mode
while [ -z $(docker info --format {{.Swarm.NodeID}}) ]; do
   echo "Waiting for swarm mode to become active ..."
   sleep 1;
done

# when this is printed, the script will know that start command is done
echo "----- DONE -----"