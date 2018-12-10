'use strict';
var techop = {
	"_id": "5c0505a9cc199208a0ebf3b1",
	"type": "client",
	"code": "DEVE",
	"locked": true,
	"name": "Developer",
	"description": "This package is ideal for a developer. You are not giving much access but yet it is enough to sail and fast.",
	"oauth": {
		"secret": "this is a secret",
		"redirectURI": "http://domain.com",
		"grants": [
			"password",
			"refresh_token"
		],
		"disabled": 0.0,
		"type": 2.0,
		"loginMode": "urac"
	},
	"applications": [
		{
			"product": "DSBRD",
			"package": "DSBRD_DEVEL",
			"appId": "5c0505a9cc199208a0ebf3b2",
			"description": "This application is ideal for a developer. You are not giving much access but yet it is enough to sail and fast.",
			"_TTL": 604800000,
			"keys": [
				{
					"key": "499e214f8e1c17d0be793a842074c2cc",
					"extKeys": [
						{
							"extKey": "d756add847df57336a34775e4d471c9289b9c3ec62210e048c8b9da1492810d2f3b7c6db43529561e08705af30a86295a8092a70bee3e7595c6f3ffdef1259a780c142c76838fe6d664a37b64f45fc1b7d148769e92a8129efe9d5666c60311f",
							"device": null,
							"geo": null,
							"env": "DASHBOARD",
							"dashboardAccess": true,
							"expDate": null
						}
					],
					"config" : {
						"dashboard": {
							"oauth":{
								"loginMode": "urac"
							},
							"commonFields":{
								"mail": {
									"from": 'me@localhost.com',
									"transport": {
										"type": "sendmail",
										"options": {}
									}
								}
							},
							"urac": {
								"hashIterations": 1024,
								"seedLength": 32,
								"link": {
									"addUser": "http://dashboard.soajs.org:80/#/setNewPassword",
									"changeEmail": "http://dashboard.soajs.org:80/#/changeEmail/validate",
									"forgotPassword": "http://dashboard.soajs.org:80/#/resetPassword",
									"join": "http://dashboard.soajs.org:80/#/join/validate"
								},
								"tokenExpiryTTL": 2 * 24 * 3600 * 1000,
								"validateJoin": true,
								"mail": {
									"join": {
										"subject": 'Welcome to SOAJS',
										"path": "%wrkDir%/soajs/node_modules/soajs.urac/mail/urac/join.tmpl"
									},
									"forgotPassword": {
										"subject": 'Reset Your Password at SOAJS',
										"path": "%wrkDir%/soajs/node_modules/soajs.urac/mail/urac/forgotPassword.tmpl"
									},
									"addUser": {
										"subject": 'Account Created at SOAJS',
										"path": "%wrkDir%/soajs/node_modules/soajs.urac/mail/urac/addUser.tmpl"
									},
									"changeUserStatus": {
										"subject": "Account Status changed at SOAJS",
										//use custom HTML
										"path": "%wrkDir%/soajs/node_modules/soajs.urac/mail/urac/changeUserStatus.tmpl"
									},
									"changeEmail": {
										"subject": "Change Account Email at SOAJS",
										"path": "%wrkDir%/soajs/node_modules/soajs.urac/mail/urac/changeEmail.tmpl"
									}
								}
							}
						}
					}
				}
			]
		}
	],
	"tag": "developer"
};

module.exports = techop;
