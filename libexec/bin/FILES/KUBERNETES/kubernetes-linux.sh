#!/bin/bash

#This script installs prerequisites that enable this machine to join a kubernetes cluster
#Compatible with Ubuntu

DIRNAME=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

#Need to run as root in order to install Docker
if [ $(whoami) != 'root' ]; then
    echo "Please run this script as root, exiting ..."
    exit 1
fi

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

function installTools(){
    installOneTool "curl"
    installOneTool "openssl"
    installOneTool "ca-certificates"
    installOneTool "apt-transport-https"
    installOneTool "software-properties-common"
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

	#todo: from here ...
	# if docker installed, skip installing it again
	# check docker-linux line 102-> 114
    echo "Installing Docker ..."
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -

    # Set up the stable repository:
    add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu xenial stable"
    apt-get update
    apt-get install -y docker-ce

    #todo: till here ...

    echo "Docker sucessfully installed"
    echo "Installing Kubelet ..."
    apt-get install -y kubelet=1.7.11-00

    echo "Kubelet successfully intstalled"
    echo "Installing KubeAdm ..."
    apt-get install -y kubeadm=1.7.11-00

    echo "Kubeadm successfully installed"
    echo "Installing kubectl ..."
    apt-get install -y kubectl=1.7.11-00

    echo "Kubectl successfully installed"
    echo "Instsalling Kubernetes-cni ..."
    apt-get install -y kubernetes-cni=1.7.11-00

    echo "Kubernetes-cni successfully installed"

}

function initKubernetes(){
    echo "Initializing the master node"

    kubeadm reset
    systemctl start kubelet.service
    kubeadm init --pod-network-cidr=10.244.0.0/16 --kubernetes-version=stable-1.7

    mkdir -p $HOME/.kube
    cp -rf /etc/kubernetes/admin.conf $HOME/.kube/config
    chown "${SUDO_USER}:${SUDO_USER}" $HOME/.kube/config

    sleep 2

    kubectl taint nodes --all node-role.kubernetes.io/master:NoSchedule-
    kubectl apply -f $DIRNAME/flannel/kube-flannel.yml

    kubectl create clusterrolebinding permissive-binding --clusterrole=cluster-admin --user=admin --user=kubelet --group=system:serviceaccounts;
}
#Start here########
printHeadline
installTools
installKubernetes
initKubernetes
###################
