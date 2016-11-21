'use strict';

var components = {
    service: {
        "apiVersion": "v1",
        "kind": "Service",
        "metadata": {
            "name": "dashboard-nginx-service",
            "labels": {
                "type": "soajs-service"
            }
        },
        "spec": {
            "type": "NodePort",
            "selector": {
                "soajs-app": "dashboard-nginx"
            },
            "ports": [
                {
                    "protocol": "TCP",
                    "port": 80,
                    "targetPort": 80,
                    "nodePort": 30080
                }
            ]
        }
    },
    deployment: {
        "apiVersion": "extensions/v1beta1",
        "kind": "Deployment",
        "metadata": {
            "name": "dashboard-nginx",
            "labels": {
                "soajs.service.group": "nginx",
                "soajs.service": "nginx",
                "soajs.env": "dashboard"
            }
        },
        "spec": {
            "replicas": 1,
            "selector": {
                "matchLabels": {
                    "soajs-app": "dashboard-nginx"
                }
            },
            "template": {
                "metadata": {
                    "name": "dashboard-nginx",
                    "labels": {
                        "soajs-app": "dashboard-nginx"
                    }
                },
                "spec": {
                    "containers": [
                        {
                            "name": "dashboard-nginx",
                            "image": "ameerfaraj/soajs-nginx",
                            "workingDir": "/opt/soajs/FILES/deployer/",
                            "command": ["./soajsDeployer.sh"],
                            "args": ["-T", "nginx", "-X", "deploy"],
                            "ports": [
                                {
                                    "containerPort": 80
                                }
                            ],
                            "env": [
                                {
                                    "name": "SOAJS_ENV",
                                    "value": "dashboard"
                                },
                                {
                                    "name": "SOAJS_GIT_DASHBOARD_BRANCH",
                                    "value": "feature/SOAJ-372"
                                },
                                {
                                    "name": "SOAJS_NX_API_DOMAIN",
                                    "value": "dashboard-api.soajs.org"
                                },
                                {
                                    "name": "SOAJS_NX_SITE_DOMAIN",
                                    "value": "dashboard.soajs.org"
                                },
                                {
                                    "name": "SOAJS_NX_CONTROLLER_NB",
                                    "value": "1"
                                },
                                {
                                    "name": "SOAJS_NX_CONTROLLER_IP_1",
                                    "value": "dashboard-controller-service"
                                },
                                {
                                    "name": "SOAJS_NX_CONTROLLER_PORT_1",
                                    "value": "4000"
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
