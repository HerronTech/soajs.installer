'use strict';

var catalogs = [
    {
        "name": "Service Recipe",
        "type": "service",
        "description": "This is a sample service catalog recipe",
        "locked": true,
        "recipe": {
            "deployOptions": {
                "image": {
                    "prefix": "soajsorg",
                    "name": "soajs",
                    "tag": "latest",
                    "pullPolicy": "Always"
                },
                "readinessProbe": {
                    "httpGet": {
                        "path": "/heartbeat",
                        "port": "maintenance"
                    },
                    "initialDelaySeconds": "",
                    "timeoutSeconds": "",
                    "periodSeconds": "",
                    "successThreshold": "",
                    "failureThreshold": ""
                },
                "restartPolicy": {
                    "condition": "", //Always || OnFailure || Never
                    "maxAttempts": 0 //only valid for docker
                },
                "container": {
                    "network": "", //container network for docker
                    "workingDir": "" //container working directory
                },
                "voluming": {
                    "volumes": [], //array of objects
                    "volumeMounts": [] //array of objects
                }
            },
            "buildOptions": {
                "settings": {
                    "accelerateDeployment": true || false,
                },
                "env": {
                    "NODE_ENV": "production",

                    "SOAJS_ENV": "dashboard",
                    "SOAJS_PROFILE": "/opt/soajs/FILES/profiles/profile.js",

                    "SOAJS_SRV_AUTOREGISTERHOST": "true",
                    "SOAJS_SRV_MEMORY": "",

                    "SOAJS_GC_NAME": "", //only for gc services
                    "SOAJS_GC_VERSION": "", //only for gc services

                    "SOAJS_GIT_OWNER": "",
                    "SOAJS_GIT_BRANCH": "",
                    "SOAJS_GIT_COMMIT": "",
                    "SOAJS_GIT_REPO": "",
                    "SOAJS_GIT_TOKEN": "", //optional (only if private repo)

                    "SOAJS_DEPLOY_HA": "", //swarm || kubernetes
                    "SOAJS_HA_NAME": "", //computed field

                    "SOAJS_MONGO_NB": "",
                    "SOAJS_MONGO_PREFIX": "",
                    "SOAJS_MONGO_RSNAME": "",
                    "SOAJS_MONGO_AUTH_DB": "",
                    "SOAJS_MONGO_SSL": "",
                    "SOAJS_MONGO_IP_N": "", //replace N with number
                    "SOAJS_MONGO_PORT_N": "", //replace N with number

                    "SOAJS_CONFIG_REPO_PROVIDER": "", //github|bitbucket|bitbucket_enterprise
                    "SOAJS_CONFIG_REPO_OWNER": "",
                    "SOAJS_CONFIG_REPO_BRANCH": "",
                    "SOAJS_CONFIG_REPO_NAME": "",
                    "SOAJS_CONFIG_REPO_TOKEN": ""
                },
                "cmd": {
                    "pre_deploy": [],
                    "post_deploy": []
                }
            }
        }
    },
    {
        "name": "Daemon Recipe",
        "type": "daemon",
        "description": "This is a sample daemon recipe",
        "locked": true,
        "recipe": {
            "deployOptions": {
                "image": {
                    "prefix": "soajsorg",
                    "name": "soajs",
                    "tag": "latest",
                    "pullPolicy": "Always"
                },
                "readinessProbe": {
                    "httpGet": {
                        "path": "/heartbeat",
                        "port": "maintenance"
                    },
                    "initialDelaySeconds": "",
                    "timeoutSeconds": "",
                    "periodSeconds": "",
                    "successThreshold": "",
                    "failureThreshold": ""
                },
                "restartPolicy": {
                    "condition": "", //Always || OnFailure || Never
                    "maxAttempts": 0 //only valid for docker
                },
                "container": {
                    "network": "", //container network for docker
                    "workingDir": "" //container working directory
                },
                "voluming": {
                    "volumes": [], //array of objects
                    "volumeMounts": [] //array of objects, only applicable in case of kubernetes
                }
            },
            "buildOptions": {
                "settings": {
                    "accelerateDeployment": true || false,
                },
                "env": {
                    "NODE_ENV": "production",

                    "SOAJS_ENV": "dashboard",
                    "SOAJS_PROFILE": "/opt/soajs/FILES/profiles/profile.js",

                    "SOAJS_SRV_AUTOREGISTERHOST": "true",
                    "SOAJS_SRV_MEMORY": "",

                    "SOAJS_DAEMON_GRP_CONF": "",

                    "SOAJS_GIT_OWNER": "",
                    "SOAJS_GIT_BRANCH": "",
                    "SOAJS_GIT_COMMIT": "",
                    "SOAJS_GIT_REPO": "",
                    "SOAJS_GIT_TOKEN": "", //optional (only if private repo)

                    "SOAJS_DEPLOY_HA": "", //swarm || kubernetes
                    "SOAJS_HA_NAME": "", //computed field

                    "SOAJS_MONGO_NB": "",
                    "SOAJS_MONGO_PREFIX": "",
                    "SOAJS_MONGO_RSNAME": "",
                    "SOAJS_MONGO_AUTH_DB": "",
                    "SOAJS_MONGO_SSL": "",
                    "SOAJS_MONGO_IP_N": "", //replace N with number
                    "SOAJS_MONGO_PORT_N": "", //replace N with number

                    "SOAJS_CONFIG_REPO_PROVIDER": "", //github|bitbucket|bitbucket_enterprise
                    "SOAJS_CONFIG_REPO_OWNER": "",
                    "SOAJS_CONFIG_REPO_BRANCH": "",
                    "SOAJS_CONFIG_REPO_NAME": "",
                    "SOAJS_CONFIG_REPO_TOKEN": ""
                },
                "cmd": {
                    "pre_deploy": [],
                    "post_deploy": []
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
                    "pullPolicy": "Always"
                },
                "readinessProbe": {
                    "httpGet": {
                        "path": "/",
                        "port": "http"
                    },
                    "initialDelaySeconds": "",
                    "timeoutSeconds": "",
                    "periodSeconds": "",
                    "successThreshold": "",
                    "failureThreshold": ""
                },
                "restartPolicy": {
                    "condition": "", //Always || OnFailure || Never
                    "maxAttempts": 0 //only valid for docker
                },
                "container": {
                    "network": "", //container network for docker
                    "workingDir": "" //container working directory
                },
                "voluming": {
                    "volumes": [], //array of objects
                    "volumeMounts": [] //array of objects
                }
                "ports": []
            },
            "buildOptions": {
                "env": {
                    "SOAJS_ENV": "dashboard",

                    "SOAJS_GIT_DASHBOARD_BRANCH": "", //only for dashboard nginx

                    "SOAJS_NX_DOMAIN": "", //master domain, needed to generate self-signed certs
                    "SOAJS_NX_API_DOMAIN": "",
                    "SOAJS_NX_SITE_DOMAIN": "",

                    "SOAJS_NX_CONTROLLER_NB": "",
                    "SOAJS_NX_CONTROLLER_IP_N": "", //replace N with number
                    "SOAJS_NX_CONTROLLER_PORT_N": "", //replace N with number

                    "SOAJS_NX_API_HTTPS": "",
                    "SOAJS_NX_API_HTTP_REDIRECT": "",
                    "SOAJS_NX_SITE_HTTPS": "",
                    "SOAJS_NX_SITE_HTTP_REDIRECT": "",

                    "SOAJS_NX_CUSTOM_SSL": "", //only for user-provided certs
                    "SOAJS_NX_SSL_CERTS_LOCATION": "/etc/soajs/ssl/", //only for user-provided certs
                    "SOAJS_NX_SSL_SECRET": "", //only for user-provided certs

                    // "SOAJS_GIT_OWNER": "",
                    // "SOAJS_GIT_BRANCH": "",
                    // "SOAJS_GIT_COMMIT": "",
                    // "SOAJS_GIT_REPO": "",
                    // "SOAJS_GIT_TOKEN": "", //optional (only if private repo)

                    "SOAJS_DEPLOY_HA": "", //swarm || kubernetes
                    "SOAJS_HA_NAME": "", //computed field

                    "SOAJS_CONFIG_REPO_PROVIDER": "", //github|bitbucket|bitbucket_enterprise
                    "SOAJS_CONFIG_REPO_OWNER": "",
                    "SOAJS_CONFIG_REPO_BRANCH": "",
                    "SOAJS_CONFIG_REPO_NAME": "",
                    "SOAJS_CONFIG_REPO_TOKEN": ""
                },
                "cmd": {
                    "pre_deploy": [],
                    "post_deploy": []
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
                    "pullPolicy": "Always"
                },
                "readinessProbe": {
                    "httpGet": {
                        "path": "/",
                        "port": "27017"
                    },
                    "initialDelaySeconds": "",
                    "timeoutSeconds": "",
                    "periodSeconds": "",
                    "successThreshold": "",
                    "failureThreshold": ""
                },
                "restartPolicy": {
                    "condition": "", //Always || OnFailure || Never
                    "maxAttempts": 0 //only valid for docker
                },
                "container": {
                    "network": "", //container network for docker
                    "workingDir": "" //container working directory
                },
                "voluming": {
                    "volumes": [], //array of objects
                    "volumeMounts": [] //array of objects
                }
            },
            "buildOptions": {
                "env": {
                    "SOAJS_CONFIG_REPO_PROVIDER": "", //github|bitbucket|bitbucket_enterprise
                    "SOAJS_CONFIG_REPO_OWNER": "",
                    "SOAJS_CONFIG_REPO_BRANCH": "",
                    "SOAJS_CONFIG_REPO_NAME": "",
                    "SOAJS_CONFIG_REPO_TOKEN": ""
                },
                "cmd": {
                    "pre_deploy": [],
                    "post_deploy": []
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
                    "pullPolicy": "Always"
                },
                "readinessProbe": {
                    "httpGet": {
                        "path": "/",
                        "port": "9200"
                    },
                    "initialDelaySeconds": "",
                    "timeoutSeconds": "",
                    "periodSeconds": "",
                    "successThreshold": "",
                    "failureThreshold": ""
                },
                "restartPolicy": {
                    "condition": "", //Always || OnFailure || Never
                    "maxAttempts": 0 //only valid for docker
                },
                "container": {
                    "network": "", //container network for docker
                    "workingDir": "" //container working directory
                },
                "voluming": {
                    "volumes": [], //array of objects
                    "volumeMounts": [] //array of objects
                }
            },
            "buildOptions": {
                "env": {
                    "SOAJS_CONFIG_REPO_PROVIDER": "", //github|bitbucket|bitbucket_enterprise
                    "SOAJS_CONFIG_REPO_OWNER": "",
                    "SOAJS_CONFIG_REPO_BRANCH": "",
                    "SOAJS_CONFIG_REPO_NAME": "",
                    "SOAJS_CONFIG_REPO_TOKEN": ""
                },
                "cmd": {
                    "pre_deploy": [],
                    "post_deploy": []
                }
            }
        }
    }
];

module.exports = catalogs;
