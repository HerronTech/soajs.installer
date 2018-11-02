#!/bin/bash

#This script installs prerequisites that enable this machine to join a kubernetes cluster
#Compatible with Ubuntu

DIRNAME=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

function initKubernetes(){
	echo "initializing kubeadm"
    kubeadm init --pod-network-cidr=192.168.0.0/16 --apiserver-advertise-address=192.168.0.103

    #echo "starting kubelet"
    #systemctl start kubelet && systemctl enable kubelet

	echo "Creating kube config @ $HOME/.kube/config"
    mkdir -p $HOME/.kube
    cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
    chown "$(id -u):$(id -g)" $HOME/.kube/config

    sleep 2

    echo "Applying Kubernetes Flannel"
    kubectl apply -f $DIRNAME/flannel/kube-flannel.yml

	echo "Tainting Kubernetes Node"
    kubectl taint nodes --all node-role.kubernetes.io/master:NoSchedule-

	echo "Creating Cluster Role Binding"
    kubectl create clusterrolebinding permissive-binding --clusterrole=cluster-admin --user=admin --user=kubelet --group=system:serviceaccounts;

    echo "----- DONE -----"
}

initKubernetes