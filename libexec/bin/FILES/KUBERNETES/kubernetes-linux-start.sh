#!/bin/bash

#This script installs prerequisites that enable this machine to join a kubernetes cluster
#Compatible with Ubuntu

DIRNAME=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

function initKubernetes(){
    echo "starting kubelet"
    systemctl start kubelet && systemctl enable kubelet

	echo "initializing kubeadm"
    kubeadm init --kubernetes-version=stable-1.7

	echo "Creating kube config @ $HOME/.kube/config"
    mkdir -p $HOME/.kube
    cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
    chown "$(id -u):$(id -g)" $HOME/.kube/config

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