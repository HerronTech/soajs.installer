'use strict';

var components = {
    deployment: {
        "apiVersion": "extensions/v1beta1",
        "kind": "Deployment",
        "metadata": {
            "name": "dashboard-urac",
            "labels": {
                "soajs.service.group": "core",
                "soajs.service": "urac",
                "soajs.env": "dashboard"
            }
        },
        "spec": {
            "replicas": 1,
            "selector": {
                "matchLabels": {
                    "soajs-app": "dashboard-urac"
                }
            },
            "template": {
                "metadata": {
                    "name": "dashboard-urac",
                    "labels": {
                        "soajs-app": "dashboard-urac"
                    }
                },
                "spec": {
                    "containers": [
                        {
                            "name": "dashboard-urac",
                            "image": "ameerfaraj/soajs",
                            "workingDir": "/opt/soajs/FILES/deployer/",
                            "command": ["./soajsDeployer.sh"],
                            "args": ["-T", "service", "-X", "deploy", "-L"],
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
                                    "value": "soajs.urac"
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
