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
                "soajs.service.group": "soajs-db",
                "soajs.service.type": "cluster",
                "soajs.service.subtype": "mongo",
                "soajs.service.label": "dashboard-soajsdata",
                "soajs.service.mode": "deployment"
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
                    "nodePort": ((process.env.MONGO_PORT) ? parseInt(process.env.MONGO_PORT) : 32017)
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
                "soajs.content": "true",
                "soajs.env.code": "dashboard",

                "soajs.service.name": "soajsdata",
	            "soajs.service.group": "soajs-db",
	            "soajs.service.type": "cluster",
	            "soajs.service.subtype": "mongo",
                "soajs.service.label": "dashboard-soajsdata",
                "soajs.service.mode": "deployment"
            }
        },
        "spec": {
	        "revisionHistoryLimit": 2,
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
                        "soajs.content": "true",
                        "soajs.env.code": "dashboard",

                        "soajs.service.name": "soajsdata",
	                    "soajs.service.group": "soajs-db",
	                    "soajs.service.type": "cluster",
	                    "soajs.service.subtype": "mongo",
                        "soajs.service.label": "dashboard-soajsdata",
                        "soajs.service.mode": "deployment"
                    }
                },
                "spec": {
                    "containers": [
                        {
                            "name": "dashboard-soajsdata",
                            "image": "mongo:3.4.10",
                            "imagePullPolicy": gConfig.imagePullPolicy,
                            "command": [ "mongod", "--smallfiles" ],
                            "ports": [
                                {
                                    "name": "mongoport",
                                    "containerPort": 27017
                                }
                            ],
                            "readinessProbe": {
                                "httpGet": {
                                    "path": "/",
                                    "port": "mongoport"
                                },
                                "initialDelaySeconds": gConfig.kubernetes.readinessProbe.initialDelaySeconds,
                                "timeoutSeconds": gConfig.kubernetes.readinessProbe.timeoutSeconds,
                                "periodSeconds": gConfig.kubernetes.readinessProbe.periodSeconds,
                                "successThreshold": gConfig.kubernetes.readinessProbe.successThreshold,
                                "failureThreshold": gConfig.kubernetes.readinessProbe.failureThreshold
                            },
                            "volumeMounts": [
                                {
                                    "mountPath": "/var/data/db/",
                                    "name": "dashboard-soajsdata"
                                }
                            ]
                        }
                    ],
                    "volumes": [
                        {
                            "name": "dashboard-soajsdata",
                            "hostPath": {
                                "path": "/var/data/db/"
                            }
                        }
                    ]
                }
            }
        }
    }
};

module.exports = components;
