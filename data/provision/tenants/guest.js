'use strict';
var techop = {
	"_id": "5c0e74ba9acc3c5a84a51259",
	"type": "product",
	"code": "DBTN",
	"locked": true,
	"console": true,
    "name": "Console Tenant",
    "description": "This is the tenant that holds the access rights and configuration for the console users with DSBRD_GUEST as Guest default package",
	"oauth": {
		"secret": "this is a secret",
		"disabled": 0,
		"type": 2,
		"loginMode": "urac"
	},
	"applications": [
		{
			"product": "DSBRD",
			"package": "DSBRD_GUEST",
			"appId": "5c0e74ba9acc3c5a84a5125a",
			"description": "Dashboard application for DSBRD_GUEST package",
			"_TTL": 604800000,
			"keys": [
				{
					"key": "a139786a6e6d18e48b4987e83789430b",
					"extKeys": [
						{
							"extKey": "3d90163cf9d6b3076ad26aa5ed58556348069258e5c6c941ee0f18448b570ad1c5c790e2d2a1989680c55f4904e2005ff5f8e71606e4aa641e67882f4210ebbc5460ff305dcb36e6ec2a2299cf0448ef60b9e38f41950ec251c1cf41f05f3ce9",
							"device": null,
							"geo": null,
							"env": "DASHBOARD",
                            "dashboardAccess" : true,
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
    "tag": "Console"
};

module.exports = techop;
