'use strict';
var gConfig = require("../../config.js");

var components = {
    service: {
        "apiVersion": "v1",
        "kind": "Service",
        "metadata": {
            "name": "dashboard-soajsdata",
            "labels": {
                "soajs.content": "true",
                "soajs.env.code": "dashboard",

                "soajs.service.name": "soajsdata",
                "soajs.service.group": "db",
                "soajs.service.label": "dashboard-soajsdata"
            }
        },
        "spec": {
            "type": "NodePort",
            "selector": {
                "soajs.service.label": "dashboard-soajsdata"
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
            "name": "dashboard-soajsdata",
            "labels": {
                "soajs.env.code": "dashboard",

                "soajs.service.name": "soajsdata",
                "soajs.service.group": "db",
                "soajs.service.label": "dashboard-soajsdata"
            }
        },
        "spec": {
            "replicas": 1,
            "selector": {
                "matchLabels": {
                    "soajs.service.label": "dashboard-soajsdata"
                }
            },
            "template": {
                "metadata": {
                    "name": "dashboard-soajsdata",
                    "labels": {
                        "soajs.env.code": "dashboard",

                        "soajs.service.name": "soajsdata",
                        "soajs.service.group": "db",
                        "soajs.service.label": "dashboard-soajsdata"
                    }
                },
                "spec": {
                    "containers": [
                        {
                            "name": "dashboard-soajsdata",
                            "image": "mongo",
                            "imagePullPolicy": "IfNotPresent",
                            "command": ["mongod", "--smallfiles"],
                            "ports": [
                                {

                                    "containerPort": 27017
                                }
                            ],
                            "volumeMounts": [
                                {
                                    "mountPath": "/data/db/",
                                    "name": "dashboard-soajsdata"
                                }
                            ]
                        }
                    ],
                    "volumes": [
                        {
                            "name": "dashboard-soajsdata",
                            "hostPath": {
                                "path": "/data/db/"
                            }
                        }
                    ]
                }
            }
        }
    }
};

module.exports = components;
