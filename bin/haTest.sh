#!/usr/bin/env bash

docker-machine rm manager agent1 agent2

docker-machine create -d virtualbox manager
docker-machine create -d virtualbox agent1
docker-machine create -d virtualbox agent2

eval $(docker-machine env manager)
docker run --rm swarm create
docker-machine ls

docker ps -a
docker run -d -p 3376:3376 -t -v /var/lib/boot2docker:/certs:ro swarm manage -H 0.0.0.0:3376 --tlsverify --tlscacert=/certs/ca.pem --tlscert=/certs/server.pem --tlskey=/certs/server-key.pem token://0ac50ef75c9739f5bfeeaf00503d4e6e

eval $(docker-machine env agent1)
docker run -d swarm join --addr=$(docker-machine ip agent1):2376 token://0ac50ef75c9739f5bfeeaf00503d4e6e
docker ps -a

eval $(docker-machine env agent2)
docker run -d swarm join --addr=$(docker-machine ip agent2):2376 token://0ac50ef75c9739f5bfeeaf00503d4e6e
docker ps -a

eval $(docker-machine env manager)
docker ps



