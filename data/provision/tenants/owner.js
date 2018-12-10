'use strict';
var dsbrd = {
		"_id" : "5c0e72d59acc3c5a84a51257",
		"type" : "client",
		"code" : "OWNE",
		"locked" : true,
		"name" : "Owner",
		"description" : "This is the tenant that holds the access rights and configuration for user owner",
		"oauth" : {
			"secret" : "this is a secret",
			"redirectURI" : "http://domain.com",
			"grants" : [
				"password",
				"refresh_token"
			],
			"disabled" : 0,
			"type" : 2,
			"loginMode" : "urac"
		},
		"applications" : [
			{
				"product" : "DSBRD",
				"package" : "DSBRD_OWNER",
				"appId" : "5c0e72d59acc3c5a84a51258",
				"description" : "This application is used to provide owner level access. This means the user who has this package will have access to everything.",
				"_TTL" : 604800000,
				"keys" : [
					{
						"key" : "3471a73d438f697cea3344bbf0d4723c",
						"extKeys" : [
							{
								"extKey" : "6a1fcf96a0982cf0c2b10cba18271cee706a92159599126c825e71dc3bb389b5e2cadb2d0c1830dddc01857ce42699ccfb8bd6c86d92bde56c5bb50c672f91e8115c619068c7bede0435744d379e818a570292a9d0da588756ddc3d71ac8239d",
								"device" : null,
								"geo" : null,
								"env" : "DASHBOARD",
								"dashboardAccess" : true,
								"expDate" : null
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
		]
	}
;

module.exports = dsbrd;
