'use strict';
var gConfig = require("../../config.js");

var components = {
    service: {
        "apiVersion": "v1",
        "kind": "Service",
        "metadata": {
            "name": "dashboard-controller",
            "labels": {
                "soajs.content": "true",
                "soajs.env.code": "dashboard",

                "soajs.service.name": "controller",
                "soajs.service.group": "soajs-core-services",
                "soajs.service.type": "service",
                "soajs.service.version": "1",
                "soajs.service.label": "dashboard-controller"
            }
        },
        "spec": {
            "selector": {
                "soajs.service.label": "dashboard-controller"
            },
            "ports": [
                {
                    "name": "service-port",
                    "protocol": "TCP",
                    "port": 4000,
                    "targetPort": 4000
                },
                {
                    "name": "maintenance-port",
                    "protocol": "TCP",
                    "port": 5000,
                    "targetPort": 5000
                }
            ]
        }
    },
    deployment: {
        "apiVersion": "extensions/v1beta1",
        "kind": "Deployment",
        "metadata": {
            "soajs.content": "true",
            "name": "dashboard-controller",
            "labels": {
                "soajs.content": "true",
                "soajs.env.code": "dashboard",

                "soajs.service.name": "controller",
                "soajs.service.group": "soajs-core-services",
                "soajs.service.type": "service",
                "soajs.service.version": "1",
                "soajs.service.label": "dashboard-controller"
            }
        },
        "spec": {
            "replicas": gConfig.kubernetes.replicas,
            "selector": {
                "matchLabels": {
                    "soajs.service.label": "dashboard-controller"
                }
            },
            "template": {
                "metadata": {
                    "name": "controllercon",
                    "labels": {
                        "soajs.content": "true",
                        "soajs.env.code": "dashboard",

                        "soajs.service.name": "controller",
                        "soajs.service.group": "soajs-core-services",
                        "soajs.service.type": "service",
                        "soajs.service.version": "1",
                        "soajs.service.label": "dashboard-controller"
                    }
                },
                "spec": {
                    "containers": [
                        {
                            "name": "dashboard-controller",
                            "image": gConfig.imagePrefix + "/soajs",
                            "imagePullPolicy": gConfig.imagePullPolicy,
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
                                    "value": gConfig.git.branch
                                },
                                {
                                    "name": "SOAJS_GIT_REPO",
                                    "value": "soajs.controller"
                                },
                                {
                                    "name": "SOAJS_DEPLOY_HA",
                                    "value": "kubernetes"
                                },
                                {
                                    "name": "SOAJS_HA_IP",
                                    "valueFrom": {
                                        "fieldRef": {
                                            "fieldPath": "status.podIP"
                                        }
                                    }
                                },
                                {
                                    "name": "SOAJS_HA_NAME",
                                    "valueFrom": {
                                        "fieldRef": {
                                            "fieldPath": "metadata.name"
                                        }
                                    }
                                }
                            ],
                            "volumeMounts": [
                                {
                                    "mountPath": gConfig.kubernetes.volumes.log.path,
                                    "name": gConfig.kubernetes.volumes.log.label
                                }
                            ]
                        },
                        {
                            "name": "kubectl-proxy",
                            "image": "lachlanevenson/k8s-kubectl",
                            "imagePullPolicy": gConfig.imagePullPolicy,
                            "args": ["proxy", "-p", "8001"],
                            "ports": [
                                {

                                    "containerPort": 8001
                                }
                            ],
                            "env": []
                        }
                    ],
                    "volumes": [
                        {
                            "name": gConfig.kubernetes.volumes.log.label,
                            "hostPath": {
                                "path": gConfig.kubernetes.volumes.log.path
                            }
                        }
                    ]
                }
            }
        }
    }
};

module.exports = components;
