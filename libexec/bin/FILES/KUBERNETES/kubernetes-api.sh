#!/bin/bash

echo "###############################################################"
echo "#"
echo "# KUBERNETES"
echo "#"
echo "###############################################################"
echo ""
echo "Connect to Kubernetes:"
echo "------------------------"
echo ""
# check the platform to determine which ip to use: linux | darwin
unamestr=`uname`
if [[ "$unamestr" == 'Darwin' ]]; then
	BINARIES_PATH="/usr/local/bin"

	echo IP ADDRESS: $(${BINARIES_PATH}/minikube ip)
	echo ""
    echo Kubernetes PORT: 8443
    echo ""
elif [[ "$unamestr" == 'Linux' ]]; then
	BINARIES_PATH="/usr/bin"

	echo IP ADDRESS: 127.0.0.1
	echo ""
    echo Kubernetes PORT: 6443
    echo ""
fi

echo "Kubernetes TOKEN: $(${BINARIES_PATH}/kubectl describe secret | grep token: | cut -d: -f2)"