'use strict';

var components = {
    service: {
        "apiVersion": "v1",
        "kind": "Service",
        "metadata": {
            "name": "dashboard-controller-service",
            "labels": {
                "type": "soajs-service"
            }
        },
        "spec": {
            "selector": {
                "soajs-app": "dashboard-controller"
            },
            "ports": [
                {
                    "protocol": "TCP",
                    "port": 4000,
                    "targetPort": 4000
                }
            ]
        }
    },
    deployment: {
        "apiVersion": "extensions/v1beta1",
        "kind": "Deployment",
        "metadata": {
            "name": "dashboard-controller",
            "labels": {
                "soajs.service.group": "core",
                "soajs.service": "controller",
                "soajs.env": "dashboard"
            }
        },
        "spec": {
            "replicas": 1,
            "selector": {
                "matchLabels": {
                    "soajs-app": "dashboard-controller"
                }
            },
            "template": {
                "metadata": {
                    "name": "controllercon",
                    "labels": {
                        "soajs-app": "dashboard-controller"
                    }
                },
                "spec": {
                    "containers": [
                        {
                            "name": "dashboard-controller",
                            "image": "ameerfaraj/soajs",
                            "workingDir": "/opt/soajs/FILES/deployer/",
                            "command": ["./soajsDeployer.sh"],
                            "args": ["-T", "service", "-X", "deploy", "-L"],
                            "ports": [
                                {

                                    "containerPort": 4000
                                }
                            ],
                            "env": [
                                {
                                    "name": "NODE_ENV",
                                    "value": "production"
                                },
                                {
                                    "name": "SOAJS_ENV",
                                    "value": "dashboard"
                                },
                                {
                                    "name": "SOAJS_PROFILE",
                                    "value": "/opt/soajs/FILES/profiles/profile.js"
                                },
                                {
                                    "name": "SOAJS_SRV_AUTOREGISTERHOST",
                                    "value": "true"
                                },
                                {
                                    "name": "SOAJS_GIT_OWNER",
                                    "value": "soajs"
                                },
                                {
                                    "name": "SOAJS_GIT_BRANCH",
                                    "value": "develop"
                                },
                                {
                                    "name": "SOAJS_GIT_REPO",
                                    "value": "soajs.controller"
                                },
                                {
                                    "name": "SOAJS_DEPLOY_HA",
                                    "value": "true"
                                },
                                {
                                    "name": "SOAJS_MONGO_NB",
                                    "value": "1"
                                },
                                {
                                    "name": "SOAJS_MONGO_IP_1",
                                    "value": "dashboard-soajsdata-service"
                                },
                                {
                                    "name": "SOAJS_MONGO_PORT_1",
                                    "value": "27017"
                                },
                                {
                                    "name": "SOAJS_DEPLOY_KUBE",
                                    "value": "true"
                                },
                                {
                                    "name": "SOAJS_KUBE_POD_IP",
                                    "valueFrom": {
                                        "fieldRef": {
                                            "fieldPath": "status.podIP"
                                        }
                                    }
                                },
                                {
                                    "name": "SOAJS_KUBE_POD_NAME",
                                    "valueFrom": {
                                        "fieldRef": {
                                            "fieldPath": "metadata.name"
                                        }
                                    }
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
