#!/bin/bash

KUBERNETES_VERSION="v1.7.5"

MINIKUBE_VERSION="v0.22.2"
MINKUBE_URL="https://storage.googleapis.com/minikube/releases/${MINIKUBE_VERSION}/minikube-darwin-amd64"

VIRTUALBOX_VERSION="5.2.20"
VIRTUALBOX_BUILD="${VIRTUALBOX_VERSION}-125813-OSX"
VIRUTALBOX_URL="http://download.virtualbox.org/virtualbox/${VIRTUALBOX_VERSION}/VirtualBox-${VIRTUALBOX_BUILD}.dmg"

KUBECTL_VERSION="v1.7.10"
KUBECTL_URL="https://storage.googleapis.com/kubernetes-release/release/${KUBECTL_VERSION}/bin/darwin/amd64/kubectl"

MINIKUBE_CPUS="2"
MINIKUBE_MEMORY="4096"
MINIKUBE_DRIVER="virtualbox"

CURL=$(command -v curl)
BINARIES_PATH="/usr/local/bin"

function printHeadline() {
	echo "###############################################################"
    echo "#"
    echo "# KUBERNETES"
    echo "#"
    echo "###############################################################"
    echo ""
    echo "Downloading and install Kubernetes, do not stop the execution ..."
    echo "------------------------"
    echo ""
}

function installVirtualbox(){
    echo 'Installing virtualbox ...'

	if [ -e virtualbox.dmg ]
    then
        echo 'virtualbox already downloaded ...'
    else
        $CURL -Lo virtualbox.dmg ${VIRUTALBOX_URL}
    fi

    local MOUNT_POINT=$(hdiutil attach virtualbox.dmg | grep /Volumes/VirtualBox | cut -f 1)
    installer -pkg /Volumes/VirtualBox/VirtualBox.pkg -target /Volumes/Macintosh\ HD
    hdiutil detach $MOUNT_POINT
}

function installKubectl(){
    echo 'Installing kubectl ...'

	if [ -e kubectl ]
    then
        echo "Kubectl already downloaded ..."
    else
		$CURL -LO ${KUBECTL_URL}
    fi

    chmod +x ./kubectl
    cp ./kubectl ${BINARIES_PATH}/kubectl

}

function installMinikube(){
    echo 'Installing minikube ...'

	if [ -e minikube ]
    then
        echo 'minikube already downloaded ...'
    else
        $CURL -Lo minikube ${MINKUBE_URL}
    fi

    chmod +x minikube
    cp minikube ${BINARIES_PATH}/

}

function runMinikube(){
    echo 'Starting minikube instance ...'
    ${BINARIES_PATH}/minikube start \
                            --vm-driver ${MINIKUBE_DRIVER} \
                            --kubernetes-version ${KUBERNETES_VERSION} \
                            --cpus ${MINIKUBE_CPUS} \
                            --memory ${MINIKUBE_MEMORY}
}

function run(){
	printHeadline
    installVirtualbox
    installKubectl
    installMinikube
    runMinikube
}

run
