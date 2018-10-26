#!/bin/bash

BINARIES_PATH="/usr/local/bin"
echo "###############################################################"
echo "#"
echo "#"  KUBERNETES
echo "#"
echo "###############################################################"
echo ""
echo "Connect to Kubernetes:"
echo "------------------------"
echo ""
# check the platform to determine which ip to use: linux | darwin
unamestr=`uname`
if [[ "$unamestr" == 'Darwin' ]]; then
	echo IP ADDRESS: $(${BINARIES_PATH}/minikube ip)
elif [[ "$unamestr" == 'Linux' ]]; then
	echo IP ADDRESS: 127.0.0.1
fi
echo ""
echo Kubernetes PORT: 6443
echo ""
echo "Kubernetes TOKEN: $(${BINARIES_PATH}/kubectl describe secret | grep token: | cut -f 3)"