'use strict';

var defaultVoluming = {}, mongoVoluming = {}, esVoluming = {};
if (process.env.SOAJS_DEPLOY_HA === 'docker') {
    defaultVoluming = {
        "volumes": [
            {
                "Type": "volume",
                "Source": "soajs_log_volume",
                "Target": "/var/log/soajs/"
            },
            //NOTE: Voluming the unix socket is only required for the controller
            //NOTE: It is not required for any other service and can be removed
            {
                "Type": "bind",
                "ReadOnly": true,
                "Source": "/var/run/docker.sock",
                "Target": "/var/run/docker.sock"
            }
        ]
    };
    mongoVoluming = {
        "volumes": [
            {
                "Type": "volume",
                "Source": "/data/custom/db/",
                "Target": "/data/db/"
            }
        ]
    };
    esVoluming = {
        "volumes": [
            {
                "Type": "volume",
                "Source": "/usr/share/elasticsearch/custom/data/",
                "Target": "/usr/share/elasticsearch/data/"
            }
        ]
    };
}
else if (process.env.SOAJS_DEPLOY_HA === 'kubernetes') {
    defaultVoluming = {
        "volumes": [
            {
                "name": "soajs-log-volume",
                "hostPath": {
                    "path": "/var/log/soajs/"
                }
            }
        ],
        "volumeMounts": [
            {
                "mountPath": "/var/log/soajs/",
                "name": "soajs-log-volume"
            }
        ]
    };
    mongoVoluming = {
        "volumes": [
            {
                "name": "custom-mongo-volume",
                "hostPath": {
                    "path": "/data/custom/db/"
                }
            }
        ],
        "volumeMounts": [
            {
                "mountPath": "/data/db/",
                "name": "custom-mongo-volume"
            }
        ]
    };
    esVoluming = {
        "volumes": [
            {
                "name": "custom-es-volume",
                "hostPath": {
                    "path": "/usr/share/elasticsearch/custom/data/"
                }
            }
        ],
        "volumeMounts": [
            {
                "mountPath": "/usr/share/elasticsearch/data/",
                "name": "custom-es-volume"
            }
        ]
    };
}

var catalogs = [
    {
        "name": "Service Recipe",
	    "type": "soajs",
	    "subtype": "service",
        "description": "This is a sample service catalog recipe",
        "locked": true,
        "recipe": {
            "deployOptions": {
                "image": {
                    "prefix": "soajsorg",
                    "name": "soajs",
                    "tag": "latest",
                    "pullPolicy": "IfNotPresent"
                },
	            "specifyGitConfiguration": true,
                "readinessProbe": {
                    "httpGet": {
                        "path": "/heartbeat",
                        "port": "maintenance"
                    },
                    "initialDelaySeconds": 5,
                    "timeoutSeconds": 2,
                    "periodSeconds": 5,
                    "successThreshold": 1,
                    "failureThreshold": 3
                },
                "restartPolicy": {
                    "condition": "", //IfNotPresent || OnFailure || Never
                    "maxAttempts": 0 //only valid for docker
                },
                "container": {
                    "network": "", //container network for docker
                    "workingDir": "/opt/soajs/deployer/" //container working directory
                },
                "voluming": JSON.parse(JSON.stringify(defaultVoluming))
            },
            "buildOptions": {
                "settings": {
                    "accelerateDeployment": true
                },
                "env": {
                    "NODE_ENV": {
                        "type": "static",
                        "value":"production"
                    },

                    "SOAJS_ENV": {
                        "type": "computed",
                        "value": "$SOAJS_ENV"
                    },
                    "SOAJS_PROFILE": {
                        "type": "static",
                        "value": "/opt/soajs/FILES/profiles/profile.js",
                    },

                    "SOAJS_SRV_AUTOREGISTERHOST":{
                        "type": "static",
                        "value": "true",
                    },
                    "SOAJS_SRV_MEMORY": {
                        "type": "computed",
                        "value": "$SOAJS_SRV_MEMORY"
                    },
                    "SOAJS_SRV_MAIN": {
                        "type": "computed",
                        "value": "$SOAJS_SRV_MAIN"
                    },

                    "SOAJS_GC_NAME": {
                        "type": "computed",
                        "value": "$SOAJS_GC_NAME"
                    },
                    "SOAJS_GC_VERSION": {
                        "type": "computed",
                        "value": "$SOAJS_GC_VERSION"
                    },

                    "SOAJS_GIT_OWNER": {
                        "type": "computed",
                        "value": "$SOAJS_GIT_OWNER"
                    },
                    "SOAJS_GIT_BRANCH": {
                        "type": "computed",
                        "value": "$SOAJS_GIT_BRANCH"
                    },
                    "SOAJS_GIT_COMMIT": {
                        "type": "computed",
                        "value": "$SOAJS_GIT_COMMIT"
                    },
                    "SOAJS_GIT_REPO": {
                        "type": "computed",
                        "value": "$SOAJS_GIT_REPO"
                    },
                    "SOAJS_GIT_TOKEN": {
                        "type": "computed",
                        "value": "$SOAJS_GIT_TOKEN"
                    },

                    "SOAJS_DEPLOY_HA": {
                        "type": "computed",
                        "value": "$SOAJS_DEPLOY_HA"
                    },
                    "SOAJS_HA_NAME": {
                        "type": "computed",
                        "value": "$SOAJS_HA_NAME"
                    },

                    "SOAJS_MONGO_NB": {
                        "type": "computed",
                        "value": "$SOAJS_MONGO_NB"
                    },
                    "SOAJS_MONGO_PREFIX": {
                        "type": "computed",
                        "value": "$SOAJS_MONGO_PREFIX"
                    },
                    "SOAJS_MONGO_RSNAME": {
                        "type": "computed",
                        "value": "$SOAJS_MONGO_RSNAME"
                    },
                    "SOAJS_MONGO_AUTH_DB": {
                        "type": "computed",
                        "value": "$SOAJS_MONGO_AUTH_DB"
                    },
                    "SOAJS_MONGO_SSL": {
                        "type": "computed",
                        "value": "$SOAJS_MONGO_SSL"
                    },
                    "SOAJS_MONGO_IP": {
                        "type": "computed",
                        "value": "$SOAJS_MONGO_IP_N"
                    },
                    "SOAJS_MONGO_PORT": {
                        "type": "computed",
                        "value": "$SOAJS_MONGO_PORT_N"
                    }
                },
                "cmd": {
                    "deploy": {
                        "command": ["bash"],
                        "args": ["-c","node index.js -T service"]
                    }
                }
            }
        }
    },
    {
        "name": "Nodejs Recipe",
        "type": "service",
        "description": "This is a sample nodejs catalog recipe",
        "locked": true,
        "recipe": {
            "deployOptions": {
                "image": {
                    "prefix": "soajsorg",
                    "name": "soajs",
                    "tag": "latest",
                    "pullPolicy": "IfNotPresent"
                },
                "readinessProbe": {
                    "httpGet": {
                        "path": "/",
                        "port": ""
                    },
                    "initialDelaySeconds": 5,
                    "timeoutSeconds": 2,
                    "periodSeconds": 5,
                    "successThreshold": 1,
                    "failureThreshold": 3
                },
                "restartPolicy": {
                    "condition": "", //Always || OnFailure || Never
                    "maxAttempts": 0 //only valid for docker
                },
                "container": {
                    "network": "", //container network for docker
                    "workingDir": "/opt/soajs/deployer/" //container working directory
                },
                "voluming": {
                    "volumes": [], //array of objects
                    "volumeMounts": [] //array of objects
                }
            },
            "buildOptions": {
                "settings": {
                    "accelerateDeployment": true
                },
                "env": {
                    "NODE_ENV": {
                        "type": "static",
                        "value":"production"
                    },
                },
                "cmd": {
                    "deploy": {
                        "command": ["bash"],
                        "args": ["-c","node index.js -T nodejs"]
                    }
                }
            }
        }
    },
    {
        "name": "Daemon Recipe",
	    "type": "soajs",
	    "subtype": "daemon",
        "description": "This is a sample daemon recipe",
        "locked": true,
        "recipe": {
            "deployOptions": {
                "image": {
                    "prefix": "soajsorg",
                    "name": "soajs",
                    "tag": "latest",
                    "pullPolicy": "IfNotPresent"
                },
	            "specifyGitConfiguration": true,
                "readinessProbe": {
                    "httpGet": {
                        "path": "/heartbeat",
                        "port": "maintenance"
                    },
                    "initialDelaySeconds": 5,
                    "timeoutSeconds": 2,
                    "periodSeconds": 5,
                    "successThreshold": 1,
                    "failureThreshold": 3
                },
                "restartPolicy": {
                    "condition": "", //Always || OnFailure || Never
                    "maxAttempts": 0 //only valid for docker
                },
                "container": {
                    "network": "", //container network for docker
                    "workingDir": "/opt/soajs/deployer/" //container working directory
                },
                "voluming": JSON.parse(JSON.stringify(defaultVoluming))
            },
            "buildOptions": {
                "settings": {
                    "accelerateDeployment": true
                },
                "env": {
                    "NODE_ENV": {
                        "type": "static",
                        "value":"production"
                    },

                    "SOAJS_ENV": {
                        "type": "computed",
                        "value": "$SOAJS_ENV"
                    },
                    "SOAJS_PROFILE": {
                        "type": "static",
                        "value": "/opt/soajs/FILES/profiles/profile.js",
                    },
                    "SOAJS_SRV_AUTOREGISTERHOST":{
                        "type": "static",
                        "value": "true",
                    },
                    "SOAJS_SRV_MEMORY": {
                        "type": "computed",
                        "value": "$SOAJS_SRV_MEMORY"
                    },
                    "SOAJS_SRV_MAIN": {
                        "type": "computed",
                        "value": "$SOAJS_SRV_MAIN"
                    },

                    "SOAJS_DAEMON_GRP_CONF": {
                        "type": "computed",
                        "value": "$SOAJS_DAEMON_GRP_CONF"
                    },

                    "SOAJS_GIT_OWNER": {
                        "type": "computed",
                        "value": "$SOAJS_GIT_OWNER"
                    },
                    "SOAJS_GIT_BRANCH": {
                        "type": "computed",
                        "value": "$SOAJS_GIT_BRANCH"
                    },
                    "SOAJS_GIT_COMMIT": {
                        "type": "computed",
                        "value": "$SOAJS_GIT_COMMIT"
                    },
                    "SOAJS_GIT_REPO": {
                        "type": "computed",
                        "value": "$SOAJS_GIT_REPO"
                    },
                    "SOAJS_GIT_TOKEN": {
                        "type": "computed",
                        "value": "$SOAJS_GIT_TOKEN"
                    },

                    "SOAJS_DEPLOY_HA": {
                        "type": "computed",
                        "value": "$SOAJS_DEPLOY_HA"
                    },
                    "SOAJS_HA_NAME": {
                        "type": "computed",
                        "value": "$SOAJS_HA_NAME"
                    },

                    "SOAJS_MONGO_NB": {
                        "type": "computed",
                        "value": "$SOAJS_MONGO_NB"
                    },
                    "SOAJS_MONGO_PREFIX": {
                        "type": "computed",
                        "value": "$SOAJS_MONGO_PREFIX"
                    },
                    "SOAJS_MONGO_RSNAME": {
                        "type": "computed",
                        "value": "$SOAJS_MONGO_RSNAME"
                    },
                    "SOAJS_MONGO_AUTH_DB": {
                        "type": "computed",
                        "value": "$SOAJS_MONGO_AUTH_DB"
                    },
                    "SOAJS_MONGO_SSL": {
                        "type": "computed",
                        "value": "$SOAJS_MONGO_SSL"
                    },
                    "SOAJS_MONGO_IP": {
                        "type": "computed",
                        "value": "$SOAJS_MONGO_IP_N"
                    },
                    "SOAJS_MONGO_PORT": {
                        "type": "computed",
                        "value": "$SOAJS_MONGO_PORT_N"
                    }
                },
                "cmd": {
                    "deploy": {
                        "command": ["bash"],
                        "args": ["-c", "node index.js -T service"]
                    }
                }
            }
        }
    },
    {
        "name": "Nginx Recipe",
        "type": "nginx",
        "description": "This is a sample nginx recipe",
        "locked": true,
        "recipe": {
            "deployOptions": {
                "image": {
                    "prefix": "soajsorg",
                    "name": "nginx",
                    "tag": "latest",
                    "pullPolicy": "IfNotPresent"
                },
                "readinessProbe": {
                    "httpGet": {
                        "path": "/",
                        "port": "http"
                    },
                    "initialDelaySeconds": 5,
                    "timeoutSeconds": 2,
                    "periodSeconds": 5,
                    "successThreshold": 1,
                    "failureThreshold": 3
                },
                "restartPolicy": {
                    "condition": "", //Always || OnFailure || Never
                    "maxAttempts": 0 //only valid for docker
                },
                "container": {
                    "network": "", //container network for docker
                    "workingDir": "/opt/soajs/deployer/" //container working directory
                },
                "voluming": JSON.parse(JSON.stringify(defaultVoluming)),
                "ports": [
                    {
                        "name": "http",
                        "target": 80,
                        "isPublished": true,
                        "published": 81
                    },
                    {
                        "name": "https",
                        "target": 443,
                        "isPublished": true,
                        "published": 444
                    }
                ]
            },
            "buildOptions": {
                "env": {
                    "SOAJS_ENV": {
                        "type": "computed",
                        "value": "$SOAJS_ENV"
                    },
                    "SOAJS_NX_DOMAIN": {
                        "type": "computed",
                        "value": "$SOAJS_NX_DOMAIN"
                    },
                    "SOAJS_NX_API_DOMAIN": {
                        "type": "computed",
                        "value": "$SOAJS_NX_API_DOMAIN"
                    },
                    "SOAJS_NX_SITE_DOMAIN": {
                        "type": "computed",
                        "value": "$SOAJS_NX_SITE_DOMAIN"
                    },

                    "SOAJS_NX_CONTROLLER_NB": {
                        "type": "computed",
                        "value": "$SOAJS_NX_CONTROLLER_NB"
                    },
                    "SOAJS_NX_CONTROLLER_IP": {
                        "type": "computed",
                        "value": "$SOAJS_NX_CONTROLLER_IP_N"
                    },
                    "SOAJS_NX_CONTROLLER_PORT": {
                        "type": "computed",
                        "value": "$SOAJS_NX_CONTROLLER_PORT"
                    },

                    "SOAJS_DEPLOY_HA": {
                        "type": "computed",
                        "value": "$SOAJS_DEPLOY_HA"
                    },
                    "SOAJS_HA_NAME": {
                        "type": "computed",
                        "value": "$SOAJS_HA_NAME"
                    },
                },
                "cmd": {
                    "deploy": {
                        "command": ["bash"],
                        "args": ["-c", "node index.js -T nginx"]
                    }
                }
            }
        }
    },
    {
        "name": "Mongo Recipe",
        "type": "mongo",
        "description": "This is a sample mongo recipe",
        "locked": true,
        "recipe": {
            "deployOptions": {
                "image": {
                    "prefix": "",
                    "name": "mongo",
                    "tag": "latest",
                    "pullPolicy": "IfNotPresent"
                },
                "readinessProbe": {
                    "httpGet": {
                        "path": "/",
                        "port": 27017
                    },
                    "initialDelaySeconds": 5,
                    "timeoutSeconds": 2,
                    "periodSeconds": 5,
                    "successThreshold": 1,
                    "failureThreshold": 3
                },
                "restartPolicy": {
                    "condition": "", //Always || OnFailure || Never
                    "maxAttempts": 0 //only valid for docker
                },
                "container": {
                    "network": "", //container network for docker
                    "workingDir": "" //container working directory
                },
                "voluming": JSON.parse(JSON.stringify(mongoVoluming)),
                "ports": [
                    {
                        "name": "mongo",
                        "target": 27017,
                        "isPublished": true
                    }
                ]
            },
            "buildOptions": {
                "env": {},
                "cmd": {
                    "deploy": {
                        "command": ["mongod"],
                        "args": ["--smallfiles"]
                    }
                }
            }
        }
    },
    {
        "name": "Elasticsearch Recipe",
        "type": "es",
        "description": "This is a sample elasticsearch recipe",
        "locked": true,
        "recipe": {
            "deployOptions": {
                "image": {
                    "prefix": "",
                    "name": "elasticsearch",
                    "tag": "latest",
                    "pullPolicy": "IfNotPresent"
                },
                "readinessProbe": {
                    "httpGet": {
                        "path": "/",
                        "port": 9200
                    },
                    "initialDelaySeconds": 5,
                    "timeoutSeconds": 2,
                    "periodSeconds": 5,
                    "successThreshold": 1,
                    "failureThreshold": 3
                },
                "restartPolicy": {
                    "condition": "", //Always || OnFailure || Never
                    "maxAttempts": 0 //only valid for docker
                },
                "container": {
                    "network": "", //container network for docker
                    "workingDir": "" //container working directory
                },
                "voluming": JSON.parse(JSON.stringify(esVoluming)),
                "ports": [
                    {
                        "name": "es",
                        "target": 9200,
                        "isPublished": true
                    }
                ]
            },
            "buildOptions": {
                "env": {},
                "cmd": {
                    "deploy": {
                        "command": [],
                        "args": []
                    }
                }
            }
        }
    }
];

module.exports = catalogs;
