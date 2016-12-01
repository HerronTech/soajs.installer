#!/bin/bash

#This script installs prerequisites that enable this machine to join a docker swarm
#Compatible with Ubuntu

#Need to run as root in order to install Docker
if [ $(whoami) != 'root' ]; then
    echo "Please run this script as root, exiting ..."
    exit 1
fi

function installTools(){
    installOneTool "curl"
    installOneTool "openssl"
}

function installOneTool(){
    local TOOL=${1}

    local IS_TOOL_INSTALLED=$(command -v ${TOOL})
    if [ -z ${IS_TOOL_INSTALLED} ]; then
        echo ${TOOL}" not found, installing now ..."
        apt-get install -y ${TOOL}
        echo "----- DONE -----"
    else
        echo ${TOOL}" is installed, skipping installation ..."
    fi
}

function installMongo(){
	echo "Installing MongoDB ..."
	apt-get update && apt-get install -y mongodb
	echo "MongoDB successfully installed..."
	echo "Stopping MongoDB Service ..."
    service mongodb stop
}

function installKubernetes(){
    echo "Beginning the installation of the Kubernetes tools ..."
    curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add -

    echo "deb http://apt.kubernetes.io/ kubernetes-xenial main" > /etc/apt/sources.list.d/kubernetes.list
    apt-get update

    echo "Installing Docker ..."
    apt-get install -y docker.io

    echo "Docker sucessfully installed"
    echo "Installing Kubelet ..."
    apt-get install -y kubelet

    echo "Kubelet successfully intstalled"
    echo "Installing KubeAdm ..."
    apt-get install -y kubeadm

    echo "Kubeadm successfully installed"
    echo "Installing kubectl ..."
    apt-get install -y kubectl

    echo "Kubectl successfully installed"
    echo "Instsalling Kubernetes-cni ..."
    apt-get install -y kubernetes-cni

    echo "Kubernetes-cni successfully installed"

    echo "Installing Flannel driver"
    curl -o flannel.yml https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml
    echo "Flannel driver successfully installed"

}

function initKubernetes(){
    echo "Initializing the master node"

    kubeadm reset
    systemctl start kubelet.service
    kubeadm init --pod-network-cidr=10.244.0.0/16
    kubectl taint nodes --all dedicated-
    kubectl apply -f flannel.yml
}
#Start here########
installTools
installMongo
installKubernetes
initKubernetes
###################
