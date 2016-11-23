'use strict';
var gConfig = require("../../config.js");

var components = {
    service: {
        "apiVersion": "v1",
        "kind": "Service",
        "metadata": {
            "name": "dashboard-soajsdata",
            "labels": {
                "type": "soajs-service"
            }
        },
        "spec": {
            "type": "NodePort",
            "selector": {
                "soajs-app": "dashboard-soajsdata"
            },
            "ports": [
                {
                    "protocol": "TCP",
                    "port": 27017,
                    "targetPort": 27017,
                    "nodePort": ( 5000 + 27017 )
                }
            ]
        }
    },
    deployment: {
        "apiVersion": "extensions/v1beta1",
        "kind": "Deployment",
        "metadata": {
            "name": "dashboard-soajsdata"
        },
        "spec": {
            "replicas": gConfig.kubernetes.replicas,
            "selector": {
                "matchLabels": {
                    "soajs-app": "dashboard-soajsdata"
                }
            },
            "template": {
                "metadata": {
                    "name": "dashboard-soajsdata",
                    "labels": {
                        "soajs-app": "dashboard-soajsdata"
                    }
                },
                "spec": {
                    "containers": [
                        {
                            "name": "dashboard-soajsdata",
                            "image": "mongo",
                            "command": ["mongod", "--smallfiles"],
                            "ports": [
                                {

                                    "containerPort": 27017
                                }
                            ]
                        }
                    ]
                }
            }
        }
    }
};

module.exports = components;
