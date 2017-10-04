#!/bin/bash

#This script installs prerequisites that enable this machine to join a kubernetes cluster
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

}

function initKubernetes(){
    echo "Initializing the master node"

    kubeadm reset
    systemctl start kubelet.service
    kubeadm init --pod-network-cidr=10.244.0.0/16 --kubernetes-version=stable-1.7
    kubectl taint nodes --all node-role.kubernetes.io/master:NoSchedule-
    mkdir -p $HOME/.kube
    cp -rf /etc/kubernetes/admin.conf $HOME/.kube/config
    chown "${SUDO_USER}:${SUDO_USER}" $HOME/.kube/config
    kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml

    kubectl create clusterrolebinding permissive-binding --clusterrole=cluster-admin --user=admin --user=kubelet --group=system:serviceaccounts;
}
#Start here########
installTools
installKubernetes
initKubernetes
###################
