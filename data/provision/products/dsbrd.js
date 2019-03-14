'use strict';

var dsbrdProduct = {
	"_id" : "5512867be603d7e01ab1688d",
	"locked" : true,
	"code" : "DSBRD",
	"name" : "Console UI Product",
	"description" : "This is the main Console UI Product.",
	"scope": {
		"acl": {
			"dashboard": {
				"urac": {
					"2": {
						"access": false,
						"get": {
							"apis": {
								"/passport/login/:strategy": {
									"access": false
								},
								"/changeEmail/validate": {
									"access": true
								},
								"/account/getUser": {
									"access": true
								},
								"/checkUsername": {
									"access": false
								},
								"/admin/changeUserStatus": {
									"access": true
								},
								"/admin/listUsers": {
									"access": true
								},
								"/admin/users/count": {
									"access": true
								},
								"/admin/getUser": {
									"access": true
								},
								"/admin/group/list": {
									"access": true
								},
								"/admin/all": {
									"access": true
								},
								"/tenant/list": {
									"access": true
								},
								"/tenant/getUserAclInfo": {
									"access": true
								}
							}
						},
						"post": {
							"apis": {
								"/resetPassword": {
									"access": true
								},
								"/account/changePassword": {
									"access": true
								},
								"/account/changeEmail": {
									"access": true
								},
								"/account/editProfile": {
									"access": true
								},
								"/admin/group/addUsers": {
									"access": true
								},
								"/admin/group/edit": {
									"access": true
								},
								"/admin/group/add": {
									"access": true
								},
								"/admin/editUserConfig": {
									"access": true
								},
								"/admin/editUser": {
									"access": true
								},
								"/admin/addUser": {
									"access": true
								}
							}
						},
						"delete": {
							"apis": {
								"/admin/group/delete": {
									"access": true
								}
							}
						}
					}
				},
				"dashboard": {
					"1": {
						"access": true,
						"post": {
							"apis": {
								"/tenant/acl/get": {
									"access": true
								},
								"/cd/deploy": {
									"access": false
								}
							}
						}
					}
				},
				"oauth": {
					"1": {
						"access": false,
						"delete": {
							"apis": {
								"/accessToken/:token": {
									"access": true
								},
								"/refreshToken/:token": {
									"access": true
								},
								"/tokens/user/:userId": {
									"access": false
								},
								"/tokens/tenant/:clientId": {
									"access": false
								}
							}
						},
						"get": {
							"apis": {
								"/authorization": {
									"access": false
								}
							}
						},
						"post": {
							"apis": {
								"/token": {
									"access": false
								}
							}
						}
					}
				}
			}
		}
	},
	"packages" : [
		{
			"code": "DSBRD_GUEST",
			"name": "Guest",
			"locked": true,
			"description": "This package is used to provide anyone access to login and forgot password. Once logged in the package linked to the user tenant will take over thus providing the right access to the logged in user.",
			"acl": {
				"dashboard": {
					oauth: [
						{
							version: "1",
							get: [
								"Guest"
							],
							post: [
								"Guest"
							],
							delete: [
								"Tokenization"
							]
						}
					],
					urac: [
						{
							version: "2",
							get: [
								"Guest Account Settings",
								"Guest Email Account Settings",
								"My Account",
								"Administration"
							],
							post: [
								"Guest Account Settings",
								"My Account",
								"Administration"
							]
						}
					],
					dashboard: [
						{
							version: "1",
							post: [
								"Private Tenant ACL"
							]
						}
					]
				}
			},
			"_TTL": 604800000
		},
		{
			"code": "DSBRD_OWNER",
			"name": "Owner",
			"description": "This package is used to provide owner level access. This means the user who has this package will have access to everything.",
			"locked": true,
			acl: {
				dashboard: {
					oauth: [
						{
							version: "1",
							get: [
								"Guest"
							],
							post: [
								"Guest"
							],
							delete: [
								"Tokenization",
								"User Tokenization",
								"Cient Tokenization"
							]
						}
					],
					urac: [
						{
							version: "2",
							get: [
								"Tenant",
								"Administration",
								"My Account",
								"Guest Email Account Settings",
								"Guest Account Settings"
							],
							post: [
								"Administration",
								"My Account",
								"Guest Account Settings"
							],
							delete: [
								"Administration"
							]
						}
					]
				}
			},
			"_TTL": 604800000
		},
		{
			"code" : "DSBRD_DEVOP",
			"name" : "DevOps",
			"locked" : true,
			"description" : "This package has the right privileges a DevOps user will need to be able to configure, control, and monitor what is happening across the board.",
			acl: {
				dashboard: {
					oauth: [
						{
							version: "1",
							delete: [
								"Tokenization",
								"User Tokenization",
								"Cient Tokenization"
							],
							get: [
								"Guest"
							],
							post: [
								"Guest"
							]
						}
					],
					urac: [
						{
							version: "2",
							get: [
								"Guest Email Account Settings",
								"Tenant",
								"My Account"
							],
							post: [
								"My Account"
							]
						}
					]
				}
			},
			"_TTL" : 604800000
		},
		{
			"code" : "DSBRD_DEVEL",
			"name" : "Developer",
			"locked" : true,
			"description" : "This package is ideal for a developer. You are not giving much access but yet it is enough to sail and fast.",
			acl: {
				dashboard: {
					oauth: [
						{
							version: "1",
							delete: [
								"Tokenization",
								"User Tokenization",
								"Cient Tokenization"
							],
							get: [
								"Guest"
							],
							post: [
								"Guest"
							]
						}
					],
					urac: [
						{
							version: "2",
							get: [
								"My Account",
								"Tenant",
								"Guest Email Account Settings"
							],
							post: [
								"My Account"
							]
						}
					]
				}
			},
			"_TTL" : 21600000
		}
	]
};

module.exports = dsbrdProduct;