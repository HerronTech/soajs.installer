'use strict';
var dashboard = {
    "_id": '55128442e603d7e01ab1688c',
    "code": "DASHBOARD",
    "domain": "%domain%",
    "sitePrefix": "%site%",
    "apiPrefix": "%api%",
    "locked": true,
    "port": 80,
	"protocol": "http",
    "profile": "%wrkDir%/soajs/FILES/profiles/profile.js",
    "deployer": {
	    "type": "%deployType%",
	    "selected": "%deployDriver%",
	    "manual": {
	    	"nodes": "%containerNode%",
	    },
	    "container": {
		    "docker": {
			    "local": {
				    "nodes": "%deployDockerNodes%",
				    "socketPath": "/var/run/docker.sock",
			    },
			    "remote": {
				    "apiPort": "%dockerRemotePort%",
				    "nodes": "%deployDockerNodes%",
				    "protocol": "https",
				    "auth": {
					    "token": "%dockertoken%"
				    }
			    }
		    },
		    "kubernetes":{
			    "local":{
				    "nodes": "%containerNode%",
				    "apiPort": "%kubernetesRemotePort%",
				    "namespace": "%namespace%",
                    "auth": {
				        "token": "%kubetoken%"
                    }
			    },
			    "remote":{
				    "nodes": "%containerNode%",
				    "apiPort": "%kubernetesRemotePort%",
				    "namespace": "%namespace%",
                    "auth": {
                        "token": "%kubetoken%"
                    }
			    }
		    }
	    }
    },
    "description": "this is the Dashboard environment",
    "dbs": {
        "config": {
            "prefix": "%clusterPrefix%"
        },
	    "session": {
		    "cluster": "dash_cluster",
		    "tenantSpecific": false,
		    "name": "core_session",
		    'store': {},
		    "collection": "sessions",
		    'stringify': false,
		    'expireAfter': 1000 * 60 * 60 * 24 * 14 // 2 weeks
	    },
        "databases": {
            "urac": {
                "cluster": "dash_cluster",
                "tenantSpecific": true
            }
        }
    },
    "services": {
        "controller": {
            "maxPoolSize": 100,
            "authorization": true,
            "requestTimeout": 30,
            "requestTimeoutRenewal": 0
        },
        "config": {
            "awareness": {
                "cacheTTL": 1000 * 60 * 60, // 1 hr
                "healthCheckInterval": 1000 * 5, // 5 seconds
                "autoRelaodRegistry": 1000 * 60 * 60, // 1 hr
                "maxLogCount": 5,
                "autoRegisterService": true
            },
            "agent": {
                "topologyDir": "%wrkDir%/soajs/"
            },
            "key": {
                "algorithm": 'aes256',
                "password": '%keySecret%'
            },
            "logger": {
                "src": true,
                "level": "debug",
                "formatter": {
	                //"outputMode": "bunyan",
	                "levelInString": true,
	                "outputMode": 'long'
                }
            },
            "cors": {
                "enabled": true,
                "origin": '*',
                "credentials": 'true',
                "methods": 'GET,HEAD,PUT,PATCH,POST,DELETE',
                "headers": 'key,soajsauth,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization',
                "maxage": 1728000
            },
            "oauth": {
                "grants": ['password', 'refresh_token'],
                "debug": false,
	            "accessTokenLifetime": 7200,
	            "refreshTokenLifetime": 1209600
            },
            "ports": {
	            "controller": 4000,
	            "maintenanceInc": 1000,
	            "randomInc": 100
            },
            "cookie": {
	            "secret": "%cookieSecret%"
            },
            "session": {
                "name": "soajsID",
                "secret": "%sessionSecret%",
                "cookie": {
                    "path": '/',
                    "httpOnly": true,
                    "secure": false,
                    "maxAge": null
                },
                "resave": false,
                "saveUninitialized": false,
                "rolling": false,
                "unset": "keep"
            }
        }
    }
};

module.exports = dashboard;
