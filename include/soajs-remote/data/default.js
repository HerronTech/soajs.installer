"use strict";
module.exports = {
	"gi": {
		"domain": "soajs.org",
		"api": "dashboard-api",
		"site": "dashboard",
		"wrkDir": "/opt/tmp",
		"email": "me@localhost.com",
		"username": "owner",
		"password": "password"
	},
	"security": {
		"key": "soajs key lal massa",
		"cookie": "this is a secret sentence",
		"session": "this is antoine hage app server",
		"guestExtKey": "3d90163cf9d6b3076ad26aa5ed58556348069258e5c6c941ee0f18448b570ad1c5c790e2d2a1989680c55f4904e2005ff5f8e71606e4aa641e67882f4210ebbc5460ff305dcb36e6ec2a2299cf0448ef60b9e38f41950ec251c1cf41f05f3ce9"
	},
	"clusters": {
		"prefix": "",
		"mongoExt": false,
		"servers": [
			{
				"host": "127.0.0.1",
				"port": 27017
			}
		],
		"credentials": {
			"username": "",
			"password": ""
		},
		"URLParam": {
			"connectTimeoutMS": 0,
			"socketTimeoutMS": 0,
			"maxPoolSize": 5,
			"wtimeoutMS": 0,
			"slaveOk": true
		},
		"extraParam": {
			"db": {
				"native_parser": true,
				"bufferMaxEntries": 0
			},
			"server": {
			}
		},
		"streaming": {
			"batchSize": 1000
		}
	},
	"deployment": {
		"deployType": "manual",
		"deployDriver": "manual",
		"deployDockerNodes": [],
		"containerHost": "127.0.0.1",
		
		"gitOwner": null,
		"gitRepo": null,
		"gitToken": null,
		
		"imagePrefix": "soajsorg",
		"nginxPort": 30080,
		"nginxSecurePort": 30443,
		"mongoExposedPort": 32017,
		"nginxSsl": null,
		"dockerReplica": 1,
		
		"docker":{
			"networkName": "soajsnet",
			"dockerSocket": "/var/run/docker.sock",
			"containerPort": 2376,
			"dockerInternalPort": 2377
		},
		"kubernetes":{
			"containerPort": 8443
		}
	}
};