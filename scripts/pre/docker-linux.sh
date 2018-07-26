#!/bin/bash

#This script installs prerequisites that enable this machine to join a docker swarm
#Compatible with Ubuntu

mkdir -p ${HOME}/certs
CERTS_PATH=${HOME}/certs

#Need machine IP address or domain name pointing to it in order to generate certificates properly
INIT_SWARM="false"
DOMAIN_NAME=""
CERTS_PASSWORD=""
SWARM_ADVERTISE_ADDR=""
SWARM_INTERNAL_PORT="2377"
SWARM_NETWORK_NAME="soajsnet"
SWARM_API_TOKEN=""

#specific variables for docker api
SWARM_API_CONTAINER_NAME=manager-docker-api
SWARM_API_IMAGE=soajsorg
SWARM_TOKEN_LENGTH=512
SWARM_PORT_DATA=443
SWARM_PORT_MAINTENANCE=444
SWARM_API_TOKEN=""

#Need to be run as root in order to install Docker
if [ $(whoami) != 'root' ]; then
    echo "Please run this script as root, exiting ..."
    exit 1
fi

function generatePass(){
    if [ -z ${CERTS_PASSWORD} ]; then
        CERTS_PASSWORD=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
        echo "Generated certs password: ${CERTS_PASSWORD}"
    fi
}

function checkRequiredFields(){
    if [ -z ${DOMAIN_NAME} ]; then
        echo "You need to specify the machine domain name in order to generate certificates properly"
        echo " "
        echo "Ex: sudo ./soajs.installer/scripts/pre/docker-linux.sh -d %my_domain%"
        echo " "
        echo "Using flag: -d mydomain.com     Exiting ..."
        exit 1
    fi

    if [ -z ${SWARM_ADVERTISE_ADDR} ]; then
        echo "You need to specify the swarm node advertise IP address or interface to use using flag: -a"
        echo " "
        echo "Ex: sudo ./soajs.installer/scripts/pre/docker-linux.sh -d mydomain.com -a %ip_address%"
        echo " "
        echo "Exiting ..."
        exit 1
    fi
}

function printHelp(){
    echo
    echo "Usage:"
    echo " > -h  Print help"
    echo " > -a  [required] Set the node advertise IP address"
    echo " > -d  [required] Set the domain name of the machine in order to generate certificates"
    echo " > -p  [optional] Set a password for the certificates. Default: auto-generated"
    echo " > -n  [optional] Set the name of the swarm overlay network. Default: soajsnet"
    echo " > -i  [optional] Set a custom cluster management communications port. More information at: https://docs.docker.com/engine/swarm/swarm-tutorial/#open-protocols-and-ports-between-the-hosts"
    echo " > -s  [optional] Initialize a new swarm on the node. Only use when preparing the first master node. Default: false"
    echo

    exit
}

function printConfig(){
    echo
    echo "Your configuration:"
    echo " > Initialize a new swarm: ${INIT_SWARM}"
    echo " > Domain name: ${DOMAIN_NAME}"
    echo " > Node advertise address: ${SWARM_ADVERTISE_ADDR}"
    echo " > Node internal port: ${SWARM_INTERNAL_PORT}"
    echo " > Swarm overlay network name: ${SWARM_NETWORK_NAME}"
    echo " > Certificates password: ${CERTS_PASSWORD}"
    echo
}

function installDocker(){
    local IS_DOCKER_INSTALLED=$(command -v docker)
    if [ -z ${IS_DOCKER_INSTALLED} ]; then
        # Add Docker’s official GPG key:
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -

        # Set up the stable repository:
        add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu xenial stable"

        apt-get update

        apt-get install -y docker-ce
    else
        echo "Docker is installed at "${IS_DOCKER_INSTALLED}", skipping ..."
    fi
}

function installTools(){
    echo "Updating local repositories ..."
    apt-get update

    installOneTool "ca-certificates"
    installOneTool "curl"
    installOneTool "openssl"
    installOneTool "apt-transport-https"
    installOneTool "software-properties-common"
}

function installOneTool(){
    local TOOL=${1}
    apt-get install -y ${TOOL}
}

function checkCertificates(){
    local FOUND
    local CERTS=("ca.pem" "cert.pem" "key.pem" "ca-key.pem" "server-cert.pem" "server-key.pem")
    for cert in ${CERTS[@]}; do
        checkIfExists $cert
        if [ $? == 0 ]; then
            echo "Certificates were not found, generating ..."
            generateCertificates
            break
        fi
    done
}

function checkIfExists() {
    local CERT_NAME=${1}
    local CERT=${CERTS_PATH}/${CERT_NAME}

    if [ -e ${CERT} ]; then
        return 1
    else
        return 0
    fi
}

function generateCertificates(){
    #Reference: https://docs.docker.com/engine/security/https/
    local PASSWORD=${CERTS_PASSWORD}
    local HOST_NAME=${DOMAIN_NAME}

    echo "Generating Docker TLS Certificates ..."
    pushd ${CERTS_PATH}

    #Generate CA private key
    openssl genrsa -aes256 -passout pass:${PASSWORD} -out ca-key.pem 4096
    #Generate CA public key
    openssl req -new -x509 -days 365 -key ca-key.pem -sha256 -out ca.pem -passin pass:${PASSWORD} -subj "/CN=${HOST_NAME}"

    #Generate a server key
    openssl genrsa -out server-key.pem 4096
    #Generate Certificate Signing Request [CSR]
    openssl req -subj "/CN=${HOST_NAME}" -sha256 -new -key server-key.pem -out server.csr

    #Sign public key with CA
    echo 'subjectAltName = DNS:*.'${DOMAIN_NAME}',IP:127.0.0.1' > extfile.cnf
    openssl x509 -req -days 365 -sha256 -in server.csr -CA ca.pem -passin pass:${PASSWORD} -CAkey ca-key.pem -CAcreateserial -out server-cert.pem -extfile extfile.cnf

    #Generate a client key
    openssl genrsa -out key.pem 4096
    #Generate Certificate Signing Request [CSR]
    openssl req -subj '/CN=client' -new -key key.pem -out client.csr

    #Sign public key with CA
    echo 'extendedKeyUsage = clientAuth' > extfile.cnf
    openssl x509 -req -days 365 -sha256 -in client.csr -CA ca.pem -passin pass:${PASSWORD} -CAkey ca-key.pem -CAcreateserial -out cert.pem -extfile extfile.cnf

    #Delete signing requests
    rm -v client.csr server.csr

    #Remove write permissions for keys
    chmod -v 0400 ca-key.pem key.pem server-key.pem

    chown ${SUDO_USER}:${SUDO_USER} ${CERTS_PATH}/*
    popd

    echo "----- DONE -----"
}

function enableCLIAccess(){
    echo "Enabling secure connection by default while using Docker CLI ..."
    local DOCKER_PATH=${HOME}'/.docker'
    local BASH_PROFILE_PATH=${HOME}'/.bashrc'

    pushd ${CERTS_PATH}

    mkdir -p ${DOCKER_PATH}
    cp {ca,cert,key}.pem  ${DOCKER_PATH}
    chown ${SUDO_USER}:${SUDO_USER} ${DOCKER_PATH}/{ca,cert,key}.pem
    echo 'export DOCKER_HOST=tcp://127.0.0.1:2376' >> ${BASH_PROFILE_PATH}
    echo 'export DOCKER_TLS_VERIFY=1' >> ${BASH_PROFILE_PATH}
    popd
    echo "----- DONE -----"
}

function reloadDocker(){
    echo "Reloading Docker Daemon ..."
    local CA_PATH=${CERTS_PATH}'/ca.pem'
    local SERVER_CERT_PATH=${CERTS_PATH}'/server-cert.pem'
    local SERVER_KEY_PATH=${CERTS_PATH}'/server-key.pem'

    #Stopping docker daemon
    service docker stop

    echo "Daemon Logs:"
    #Starting docker daemon with TLS enabled and exposed port 2376
    #Another way to start the daemon is by using 'service docker start' and exporting the tls params in DOCKER_OPTS env variable
    #Example: DOCKER_OPTS="-D --tls=true --tlscert=/var/docker/server.pem --tlskey=/var/docker/serverkey.pem -H tcp://192.168.59.3:2376"
    dockerd --tlsverify --tlscacert=${CA_PATH} --tlscert=${SERVER_CERT_PATH} --tlskey=${SERVER_KEY_PATH} -H unix:///var/run/docker.sock -H=0.0.0.0:2376 &
}

function initSwarm(){
    if [ ${INIT_SWARM} == "true" ]; then
        echo "Initializing swarm ..."

        sleep 5
        docker swarm init --advertise-addr ${SWARM_ADVERTISE_ADDR}":"${SWARM_INTERNAL_PORT}

        #Verify that docker is in swarm mode
        while [ -z $(docker info --format {{.Swarm.NodeID}}) ]; do
            echo "Waiting for swarm mode to become active ..."
            sleep 1;
        done

        docker network create --driver overlay ${SWARM_NETWORK_NAME}
    fi
}

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

while getopts :hp:n:i:a:d:s OPT; do
    case $OPT in
        h)
            printHelp ;;
        p)
            CERTS_PASSWORD=$OPTARG ;;
        n)
            SWARM_NETWORK_NAME=$OPTARG ;;
        i)
            SWARM_INTERNAL_PORT=$OPTARG ;;
        a)
            SWARM_ADVERTISE_ADDR=${OPTARG} ;;
        d)
            DOMAIN_NAME=${OPTARG} ;;
        s)
            INIT_SWARM="true" ;;
        \?)
            echo "Wrong input!"
            printHelp ;;
    esac
done

#Start here########
checkRequiredFields
generatePass
printConfig
installTools
installDocker
checkCertificates
enableCLIAccess
reloadDocker
initSwarm
deployDockerAPI
###################
