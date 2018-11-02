#!/bin/bash

#This script installs prerequisites that enable this machine to join a kubernetes cluster
#Compatible with Ubuntu

function displayHeadline(){
	echo "###############################################################"
    echo "#"
    echo "# KUBERNETES"
    echo "#"
    echo "###############################################################"
    echo ""
    echo "Downloading and install Kubernetes, do not stop the execution ..."
    echo ""
}

function installKubernetes(){
    echo "Beginning the installation of the Kubernetes tools ..."
    curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add -

    echo "deb http://apt.kubernetes.io/ kubernetes-xenial main" > /etc/apt/sources.list.d/kubernetes.list
    apt-get update -y

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

	systemctl stop kubelet
}

#Start here########
printHeadline
installKubernetes
###################
