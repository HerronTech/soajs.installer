#!/bin/bash

#This script installs prerequisites that enable this machine to join a docker swarm
#Compatible with Ubuntu

mkdir -p ${HOME}/certs
CERTS_PATH=${HOME}/certs

#Need machine IP address or domain name pointing to it in order to generate certificates properly
DOMAIN_NAME=${1}
if [ -z ${DOMAIN_NAME} ]; then
    echo "You need to specify the domain name as first argument, example: ./init.sh soajs.org"
    echo "Exiting ..."
    exit 1
fi

#Need to be run as root in order to install Docker
if [ $(whoami) != 'root' ]; then
    echo "Please run this script as root, exiting ..."
    exit 1
fi

function installDocker(){
    local IS_DOCKER_INSTALLED=$(command -v docker)
    if [ -z ${IS_DOCKER_INSTALLED} ]; then
        # Add Docker’s official GPG key:
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -

        # Set up the stable repository:
        add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

        apt-get update

        apt-get install docker-ce
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
    local PASSWORD='r7YxGGBhCfY6XYTdd4XGU2qv'
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
    dockerd --tlsverify --tlscacert=${CA_PATH} --tlscert=${SERVER_CERT_PATH} --tlskey=${SERVER_KEY_PATH} -H unix:///var/run/docker.sock -H=0.0.0.0:2376
}

#Start here########
installTools
installDocker
checkCertificates
enableCLIAccess
reloadDocker
###################
