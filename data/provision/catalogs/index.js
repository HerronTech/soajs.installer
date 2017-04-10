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
                "volumes": [] //array of objects
            },
            "buildOptions": {
                "configRepo": {
                    "source": "", //github|bitbucket|bitbucket_enterprise
                    "repo": "",
                    "owner": "",
                    "branch": "",
                    "token": ""
                },
                "env": [], //array of strings
                "cmd": {
                    "pre_install": "",
                    "post_install": "",
                    "pre_deploy": "",
                    "post_deploy": ""
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
                "volumes": [] //array of objects
            },
            "buildOptions": {
                "configRepo": {
                    "source": "", //github|bitbucket|bitbucket_enterprise
                    "repo": "",
                    "owner": "",
                    "branch": "",
                    "token": ""
                },
                "env": [], //array of strings
                "cmd": {
                    "pre_install": "",
                    "post_install": "",
                    "pre_deploy": "",
                    "post_deploy": ""
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
                "volumes": [], //array of objects
                "ssl": {
                    "enabled": false, //boolean true | false
                    "source": "", //self-signed || secret
                    "secret": "" //only in case of kubernetes
                },
                "ports": {
                    "http": {
                        "exposed": "",
                        "target": "80"
                    },
                    "https": {
                        "exposed": "",
                        "target": "443"
                    }
                }
            },
            "buildOptions": {
                "configRepo": {
                    "source": "", //github|bitbucket|bitbucket_enterprise
                    "repo": "",
                    "owner": "",
                    "branch": "",
                    "token": ""
                },
                "env": [], //array of strings
                "cmd": {
                    "pre_install": "",
                    "post_install": "",
                    "pre_deploy": "",
                    "post_deploy": ""
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
                "volumes": [] //array of objects
            },
            "buildOptions": {
                "configRepo": {
                    "source": "", //github|bitbucket|bitbucket_enterprise
                    "repo": "",
                    "owner": "",
                    "branch": "",
                    "token": ""
                },
                "env": [], //array of strings
                "cmd": {
                    "pre_install": "",
                    "post_install": "",
                    "pre_deploy": "",
                    "post_deploy": ""
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
                "volumes": [] //array of objects
            },
            "buildOptions": {
                "configRepo": {
                    "source": "", //github|bitbucket|bitbucket_enterprise
                    "repo": "",
                    "owner": "",
                    "branch": "",
                    "token": ""
                },
                "env": [], //array of strings
                "cmd": {
                    "pre_install": "",
                    "post_install": "",
                    "pre_deploy": "",
                    "post_deploy": ""
                }
            }
        }
    }
];

module.exports = catalogs;
