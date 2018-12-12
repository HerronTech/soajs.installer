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
		"guestExtKey": "3d90163cf9d6b3076ad26aa5ed58556348069258e5c6c941ee0f18448b570ad1c5c790e2d2a1989680c55f4904e2005ff5f8e71606e4aa641e67882f4210ebbc5460ff305dcb36e6ec2a2299cf0448ef60b9e38f41950ec251c1cf41f05f3ce9",
		"ownerExtKey": "6a1fcf96a0982cf0c2b10cba18271cee706a92159599126c825e71dc3bb389b5e2cadb2d0c1830dddc01857ce42699ccfb8bd6c86d92bde56c5bb50c672f91e8115c619068c7bede0435744d379e818a570292a9d0da588756ddc3d71ac8239d",
		"developerExtKey": "d756add847df57336a34775e4d471c9289b9c3ec62210e048c8b9da1492810d2f3b7c6db43529561e08705af30a86295a8092a70bee3e7595c6f3ffdef1259a780c142c76838fe6d664a37b64f45fc1b7d148769e92a8129efe9d5666c60311f",
		"devOpsExtKey": "09d8412b8d07baf1aff5153d8dd26fdf4373806ea1c03326e4b1d9e85a3589c5d17b397208b553df91f01968551a5ec64b390cc311d74a015eb1fb3d8ffa1d69bf0f93bfb8786dd2a7180579061cab076df8762a204542f87bfeb9bb6178c1b4"
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