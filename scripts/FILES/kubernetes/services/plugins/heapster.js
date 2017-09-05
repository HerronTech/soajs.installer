'use strict';

var components = {

    customNamespace: true,

    serviceAccount: {
        "apiVersion": "v1",
        "kind": "ServiceAccount",
        "metadata": {
            "name": "heapster",
            "namespace": "kube-system"
        }
    },

    service: {
        "apiVersion": "v1",
        "kind": "Service",
        "metadata": {
            "labels": {
	            "soajs.service.type": "system",
	            "soajs.service.subtype": "heapster",
                "task": "monitoring",
                "kubernetes.io/cluster-service": "true",
                "kubernetes.io/name": "Heapster"
            },
            "name": "heapster",
            "namespace": "kube-system"
        },
        "spec": {
            "selector": {
                "k8s-app": "heapster"
            },
            "ports": [
                {
                    "port": 80,
                    "targetPort": 8082
                }
            ]
        }
    },

    deployment: {
        "apiVersion": "extensions/v1beta1",
        "kind": "Deployment",
        "metadata": {
            "name": "heapster",
            "namespace": "kube-system"
        },
        "spec": {
            "replicas": 1,
            "template": {
                "metadata": {
                    "labels": {
                        "task": "monitoring",
                        "k8s-app": "heapster"
                    }
                },
                "spec": {
                    "serviceAccountName": "heapster",
                    "containers": [
                        {
                            "name": "heapster",
                            "image": "gcr.io/google_containers/heapster-amd64:v1.3.0",
                            "imagePullPolicy": "IfNotPresent",
                            "command": [
                                "/heapster",
                                "--source=kubernetes:https://kubernetes.default"
                            ]
                        }
                    ]
                }
            }
        }
    }

};

module.exports = components;
