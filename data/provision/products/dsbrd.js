'use strict';

var dsbrdProduct = {
	"_id" : "5512867be603d7e01ab1688d",
	"locked" : true,
	"code" : "DSBRD",
	"name" : "Console UI Product",
	"description" : "This is the main Console UI Product.",
	"scope": {
		acl: {
			dashboard: {
				urac: {
					"2": {
						access: false,
						get: [
							{
								group: "Guest Email Account Settings",
								apis: {
									"/changeEmail/validate": {
										access: true
									}
								}
							},
							{
								group: "Guest",
								apis: {
									"/join/validate": {
										access: false
									}
								}
							},
							{
								group: "Guest",
								apis: {
									"/passport/login/:strategy": {
										access: false
									}
								}
							},
							{
								group: "Guest",
								apis: {
									"/passport/validate/:strategy": {
										access: false
									}
								}
							},
							{
								group: "Guest Account Settings",
								apis: {
									"/checkUsername": {
										access: false
									}
								}
							},
							{
								group: "Guest Account Settings",
								apis: {
									"/forgotPassword": {
										access: false
									}
								}
							},
							{
								group: "Administration",
								apis: {
									"/admin/users/count": {
										access: true
									}
								}
							},
							{
								group: "Administration",
								apis: {
									"/admin/changeUserStatus": {
										access: true
									}
								}
							},
							{
								group: "Administration",
								apis: {
									"/admin/listUsers": {
										access: true
									}
								}
							},
							{
								group: "Administration",
								apis: {
									"/admin/getUser": {
										access: true
									}
								}
							},
							{
								group: "Administration",
								apis: {
									"/admin/group/list": {
										access: true
									}
								}
							},
							{
								group: "Administration",
								apis: {
									"/admin/all": {
										access: true
									}
								}
							},
							{
								group: "My Account",
								apis: {
									"/account/getUser": {
										access: true
									}
								}
							},
							{
								group: "Tenant",
								apis: {
									"/tenant/list": {
										access: true
									}
								}
							},
							{
								group: "Tenant",
								apis: {
									"/tenant/getUserAclInfo": {
										access: true
									}
								}
							}
						],
						post: [
							{
								group: "Guest Account Settings",
								apis: {
									"/resetPassword": {
										access: true
									}
								}
							},
							{
								group: "Guest",
								apis: {
									"/join": {
										access: false
									}
								}
							},
							{
								group: "Guest",
								apis: {
									"/ldap/login": {
										access: false
									}
								}
							},
							{
								group: "Guest",
								apis: {
									"/openam/login": {
										access: false
									}
								}
							},
							{
								group: "My Account",
								apis: {
									"/account/editProfile": {
										access: true
									}
								}
							},
							{
								group: "My Account",
								apis: {
									"/account/changePassword": {
										access: true
									}
								}
							},
							{
								group: "My Account",
								apis: {
									"/account/changeEmail": {
										access: true
									}
								}
							},
							{
								group: "Administration",
								apis: {
									"/admin/addUser": {
										access: true
									}
								}
							},
							{
								group: "Administration",
								apis: {
									"/admin/editUser": {
										access: true
									}
								}
							},
							{
								group: "Administration",
								apis: {
									"/admin/editUserConfig": {
										access: true
									}
								}
							},
							{
								group: "Administration",
								apis: {
									"/admin/group/add": {
										access: true
									}
								}
							},
							{
								group: "Administration",
								apis: {
									"/admin/group/edit": {
										access: true
									}
								}
							},
							{
								group: "Administration",
								apis: {
									"/admin/group/addUsers": {
										access: true
									}
								}
							}
						],
						delete: [
							{
								group: "Administration",
								apis: {
									"/admin/group/delete": {
										access: true
									}
								}
							}
						]
					}
				},
				dashboard: {
					"1": {
						access: true,
						post: [
							{
								group: "Continuous Delivery Deployment",
								apis: {
									"/cd/deploy": {
										access: false
									}
								}
							}
						]
					}
				},
				oauth: {
					"1": {
						access: false,
						delete: [
							{
								group: "Tokenization",
								apis: {
									"/accessToken/:token": {
										access: true
									}
								}
							},
							{
								group: "Tokenization",
								apis: {
									"/refreshToken/:token": {
										access: true
									}
								}
							}
						]
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