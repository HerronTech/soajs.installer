#!/bin/bash

#This script installs prerequisites that enable this machine to join a kubernetes cluster
#Compatible with Ubuntu

DIRNAME=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

function initKubernetes(){
    echo "Initializing the master node"

	echo "reseting kubeadm"
    kubeadm reset

    echo "restarting docker service"
    systemctl enable docker && systemctl stop docker &&  systemctl start docker

    echo "starting kubelet"
    systemctl enable kubelet && systemctl stop kubelet && systemctl start kubelet

	echo "pulling kubeadm images"
	kubeadm config images pull

	echo "initializing kubeadm"
    kubeadm init --pod-network-cidr=10.244.0.0/16 --kubernetes-version=stable-1.7

	echo "Creating kube config @ $HOME/.kube/config"
    mkdir -p $HOME/.kube
    cp /etc/kubernetes/admin.conf $HOME/.kube/config
    chown "${SUDO_USER}:${SUDO_USER}" $HOME/.kube/config

    sleep 2

	echo "Tainting Kubernetes Node"
    kubectl taint nodes --all node-role.kubernetes.io/master:NoSchedule-

    echo "Applying Kubernetes Flannel"
    kubectl apply -f $DIRNAME/flannel/kube-flannel.yml

	echo "Creating Cluster Role Binding"
    kubectl create clusterrolebinding permissive-binding --clusterrole=cluster-admin --user=admin --user=kubelet --group=system:serviceaccounts;

    echo "----- DONE -----"
}

initKubernetes