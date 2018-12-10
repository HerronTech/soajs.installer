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
								"extKey" : "%ownerExtKey%",
								"device" : null,
								"geo" : null,
								"env" : "DASHBOARD",
								"dashboardAccess" : true,
								"expDate" : null
							}
						],
						"config" : {
							"dashboard": {
								"commonFields": {
									"mail": {
										"from": "%email%",
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
										"addUser": "%protocol%://%site%.%domain%:%port%/#/setNewPassword",
										"changeEmail": "%protocol%://%site%.%domain%:%port%/#/changeEmail/validate",
										"forgotPassword": "%protocol%://%site%.%domain%:%port%/#/resetPassword",
										"join": "%protocol%://%site%.%domain%:%port%/#/join/validate"
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
