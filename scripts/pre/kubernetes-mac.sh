#!/bin/bash

KUBERNETES_VERSION="v1.7.5"

MINIKUBE_VERSION="v0.22.2"
MINKUBE_URL="https://storage.googleapis.com/minikube/releases/${MINIKUBE_VERSION}/minikube-darwin-amd64"

VIRTUALBOX_VERSION="5.2.2"
VIRTUALBOX_BUILD="${VIRTUALBOX_VERSION}-119230-OSX"
VIRUTALBOX_URL="http://download.virtualbox.org/virtualbox/${VIRTUALBOX_VERSION}/VirtualBox-${VIRTUALBOX_BUILD}.dmg"

KUBECTL_VERSION="v1.7.10"
KUBECTL_URL="https://storage.googleapis.com/kubernetes-release/release/${KUBECTL_VERSION}/bin/darwin/amd64/kubectl"

MINIKUBE_CPUS="2"
MINIKUBE_MEMORY="4096"
MINIKUBE_DRIVER="virtualbox"

CURL=$(command -v curl)
BINARIES_PATH="/usr/local/bin"

if [ $(whoami) != 'root' ]; then
    echo "Please run this script as root, exiting ..."
    exit 1
fi

function installVirtualbox(){
    echo 'Installing virtualbox ...'

    $CURL -Lo virtualbox.dmg ${VIRUTALBOX_URL}
    local MOUNT_POINT=$(hdiutil attach virtualbox.dmg | grep /Volumes/VirtualBox | cut -f 1)
    installer -pkg /Volumes/VirtualBox/VirtualBox.pkg -target /Volumes/Macintosh\ HD
    hdiutil detach $MOUNT_POINT
    rm virtualbox.dmg
}

function installKubectl(){
    echo 'Installing kubectl ...'

    $CURL -LO ${KUBECTL_URL}
    chmod +x ./kubectl
    mv ./kubectl ${BINARIES_PATH}/kubectl
}

function installMinikube(){
    echo 'Installing minikube ...'

    $CURL -Lo minikube ${MINKUBE_URL}
    chmod +x minikube
    mv minikube ${BINARIES_PATH}/
}

function runMinikube(){
    echo 'Starting minikube instance ...'

    ${BINARIES_PATH}/minikube start \
                            --vm-driver ${MINIKUBE_DRIVER} \
                            --kubernetes-version ${KUBERNETES_VERSION} \
                            --cpus ${MINIKUBE_CPUS} \
                            --memory ${MINIKUBE_MEMORY}
}

function printInfo(){
    sleep 2
    echo
    echo '> Done'
    echo 'Minikube machine IP address: '$(${BINARIES_PATH}/minikube ip)
    echo 'Kubernetes API access token: '$(${BINARIES_PATH}/kubectl describe secret | grep token: | cut -f 3)
    echo
}

function run(){
    installVirtualbox
    installKubectl
    installMinikube
    runMinikube
    printInfo
}

run
