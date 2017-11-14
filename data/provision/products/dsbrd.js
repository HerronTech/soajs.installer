'use strict';

var dsbrdProduct = {
	"_id": "5512867be603d7e01ab1688d",
	"locked": true,
	"code": "DSBRD",
	"name": "Dashboard Product",
	"description": "This is the main dashboard product.",
	"packages": [
		{
			"code": "DSBRD_MAIN",
			"name": "Main Product Dashboard Package",
			"locked": true,
			"description": "This package allows you to login to the dashboard.",
			"acl" : {
				"dashboard" : {
					"oauth" : {
						"access" : false,
						"apisPermission" : "restricted",
						"get" : {
							"apis" : {
								"/authorization" : {
								
								}
							}
						},
						"post" : {
							"apis" : {
								"/token" : {
								
								}
							}
						},
						"delete" : {
							"apis" : {
								"/accessToken/:token" : {
									"access" : true
								},
								"/refreshToken/:token" : {
									"access" : true
								}
							}
						}
					},
					"urac" : {
						"access" : false,
						"apisPermission" : "restricted",
						"get" : {
							"apis" : {
								"/forgotPassword" : {
								
								},
								"/changeEmail/validate" : {
								
								},
								"/account/getUser" : {
									"access" : true
								},
								"/checkUsername" : {
								
								},
								"/admin/changeUserStatus" : {
									"access" : true
								},
								"/admin/listUsers" : {
									"access" : true
								},
								"/admin/users/count" : {
									"access" : true
								},
								"/admin/getUser" : {
									"access" : true
								},
								"/admin/group/list" : {
									"access" : true
								},
								"/admin/all" : {
									"access" : true
								}
							}
						},
						"post" : {
							"apis" : {
								"/resetPassword" : {
								
								},
								"/account/changePassword" : {
									"access" : true
								},
								"/account/changeEmail" : {
									"access" : true
								},
								"/account/editProfile" : {
									"access" : true
								},
								"/admin/addUser" : {
									"access" : true
								},
								"/admin/editUser" : {
									"access" : true
								},
								"/admin/editUserConfig" : {
									"access" : true
								},
								"/admin/group/add" : {
									"access" : true
								},
								"/admin/group/edit" : {
									"access" : true
								},
								"/admin/group/addUsers" : {
									"access" : true
								}
							}
						},
						"delete" : {
							"apis" : {
								"/admin/group/delete" : {
									"access" : true
								}
							}
						}
					}
				}
			},
			"_TTL": 7 * 24 * 3600 * 1000 // 7 days hours
		},
		{
			"code": "DSBRD_OWNER",
			"name": "Dashboard Owner Package",
			"description": "This package provides full access to manage the dashboard and urac features.",
			"locked": true,
			"acl" : {
				"dashboard" : {
					"urac" : {
						"access" : true,
						"apisPermission" : "restricted",
						"get" : {
							"apis" : {
								"/account/getUser" : {
								
								},
								"/changeEmail/validate" : {
								
								},
								"/admin/changeUserStatus" : {
								
								},
								"/admin/listUsers" : {
								
								},
								"/admin/users/count" : {
								
								},
								"/admin/getUser" : {
								
								},
								"/admin/group/list" : {
								
								},
								"/admin/all" : {
								
								}
							}
						},
						"post" : {
							"apis" : {
								"/account/changePassword" : {
								
								},
								"/account/changeEmail" : {
								
								},
								"/account/editProfile" : {
								
								},
								"/resetPassword" : {
								
								},
								"/admin/addUser" : {
								
								},
								"/admin/editUser" : {
								
								},
								"/admin/editUserConfig" : {
								
								},
								"/admin/group/add" : {
								
								},
								"/admin/group/edit" : {
								
								},
								"/admin/group/addUsers" : {
								
								}
							}
						},
						"delete" : {
							"apis" : {
								"/admin/group/delete" : {
								
								}
							}
						}
					},
					"dashboard" : {
						"access" : [
							"owner"
						],
						"post" : {
							"apis" : {
								"/cd/deploy" : {
									"access" : false
								}
							}
						}
					},
					"oauth" : {
						"access" : true,
						"get" : {
							"apis" : {
								"/authorization" : {
									"access" : true
								}
							}
						},
						"post" : {
							"apis" : {
								"/token" : {
									"access" : true
								}
							}
						},
						"delete" : {
							"apis" : {
								"/accessToken/:token" : {
									"access" : true
								},
								"/refreshToken/:token" : {
									"access" : true
								},
								"/tokens/user/:userId" : {
									"access" : true
								},
								"/tokens/tenant/:clientId" : {
									"access" : true
								}
							}
						}
					}
				},
				"portal": {
					"urac": {
						"access" : true,
						"apisPermission" : "restricted",
						"get" : {
							"apis" : {
								"/owner/admin/users/count" : {
								
								},
								"/owner/admin/listUsers" : {
								
								},
								"/owner/admin/changeUserStatus" : {
								
								},
								"/owner/admin/getUser" : {
								
								},
								"/owner/admin/group/list" : {
								
								},
								"/owner/admin/tokens/list" : {
								
								},
								"/tenant/list" : {
								
								},
								"/tenant/getUserAclInfo" : {
								
								}
							}
						},
						"post" : {
							"apis" : {
								"/owner/admin/addUser" : {
								
								},
								"/owner/admin/editUser" : {
								
								},
								"/owner/admin/editUserConfig" : {
								
								},
								"/owner/admin/group/add" : {
								
								},
								"/owner/admin/group/edit" : {
								
								},
								"/owner/admin/group/addUsers" : {
								
								}
							}
						},
						"delete" : {
							"apis" : {
								"/owner/admin/group/delete" : {
								
								},
								"/owner/admin/tokens/delete" : {
								
								}
							}
						}
					}
				}
			},
			"_TTL": 7 * 24 * 3600 * 1000 // 7 days hours
		},
		{
			"code" : "DSBRD_TECOP",
			"name" : "Techop Package",
			"description" : "This package is for the Techop Team, it grants the ability to run administrative operations in all deployed environments except the dashboard.",
			"acl" : {
				"dashboard" : {
					"urac" : {
						"access" : true,
						"apisPermission" : "restricted",
						"get" : {
							"apis" : {
								"/account/getUser" : {
								
								},
								"/changeEmail/validate" : {
								
								},
								"/admin/changeUserStatus" : {
								
								},
								"/admin/listUsers" : {
								
								},
								"/admin/users/count" : {
								
								},
								"/admin/getUser" : {
								
								},
								"/admin/group/list" : {
								
								},
								"/admin/all" : {
								
								},
								"/owner/admin/users/count" : {
								
								},
								"/owner/admin/listUsers" : {
								
								},
								"/owner/admin/changeUserStatus" : {
								
								},
								"/owner/admin/getUser" : {
								
								},
								"/owner/admin/group/list" : {
								
								},
								"/owner/admin/tokens/list" : {
								
								},
								"/tenant/getUserAclInfo" : {
								
								},
								"/tenant/list" : {
								
								}
							}
						},
						"post" : {
							"apis" : {
								"/account/changePassword" : {
								
								},
								"/account/changeEmail" : {
								
								},
								"/account/editProfile" : {
								
								},
								"/resetPassword" : {
								
								},
								"/admin/addUser" : {
								
								},
								"/admin/editUser" : {
								
								},
								"/admin/editUserConfig" : {
								
								},
								"/admin/group/add" : {
								
								},
								"/admin/group/edit" : {
								
								},
								"/admin/group/addUsers" : {
								
								},
								"/owner/admin/addUser" : {
								
								},
								"/owner/admin/editUser" : {
								
								},
								"/owner/admin/editUserConfig" : {
								
								},
								"/owner/admin/group/add" : {
								
								},
								"/owner/admin/group/edit" : {
								
								},
								"/owner/admin/group/addUsers" : {
								
								}
							}
						},
						"delete" : {
							"apis" : {
								"/admin/group/delete" : {
								
								},
								"/owner/admin/group/delete" : {
								
								},
								"/owner/admin/tokens/delete" : {
								
								}
							}
						}
					},
					"oauth" : {
						"access" : true
					},
					"dashboard" : {
						"access": true,
						"apisPermission": "restricted",
						"post": {
							"apis": {
								"/cd/deploy": {
									"access": false
								},
								"/cd": {},
								"/cd/pause": {},
								"/environment/add": {},
								"/environment/dbs/add": {},
								"/resources/add": {},
								"/customRegistry/add": {},
								"/environment/platforms/cert/upload": {},
								"/product/add": {},
								"/product/packages/add": {},
								"/tenant/add": {},
								"/tenant/acl/get": {},
								"/tenant/oauth/add": {},
								"/tenant/oauth/users/add": {},
								"/tenant/application/add": {},
								"/tenant/application/key/add": {},
								"/tenant/application/key/ext/add": {},
								"/tenant/application/key/ext/delete": {},
								"/services/list": {},
								"/daemons/groupConfig/list": {},
								"/daemons/groupConfig/add": {},
								"/daemons/list": {},
								"/hosts/maintenanceOperation": {},
								"/cloud/services/soajs/deploy": {},
								"/cloud/plugins/deploy": {},
								"/cloud/nodes/add": {},
								"/cloud/services/maintenance": {},
								"/catalog/recipes/add": {},
								"/ci/provider": {},
								"/ci/recipe": {},
								"/gitAccounts/login": {},
								"/gitAccounts/repo/activate": {},
								"/swagger/simulate": {},
								"/swagger/generate": {}
							}
						},
						"get": {
							"apis": {
								"/cd/ledger": {},
								"/cd": {},
								"/cd/updates": {},
								"/environment": {},
								"/environment/list": {},
								"/environment/profile": {},
								"/environment/dbs/list": {},
								"/resources/list": {},
								"/resources/get": {},
								"/resources/upgrade": {},
								"/resources/config": {},
								"/customRegistry/list": {},
								"/customRegistry/get": {},
								"/environment/platforms/list": {},
								"/product/list": {},
								"/product/get": {},
								"/product/packages/list": {},
								"/product/packages/get": {},
								"/permissions/get": {},
								"/key/get": {},
								"/tenant/list": {},
								"/tenant/get": {},
								"/tenant/oauth/list": {},
								"/tenant/oauth/users/list": {},
								"/tenant/application/list": {},
								"/tenant/application/key/list": {},
								"/tenant/application/key/ext/list": {},
								"/tenant/application/key/config/list": {},
								"/tenant/db/keys/list": {},
								"/services/env/list": {},
								"/daemons/groupConfig/serviceConfig/list": {},
								"/daemons/groupConfig/tenantExtKeys/list": {},
								"/hosts/list": {},
								"/cloud/services/list": {},
								"/cloud/nodes/list": {},
								"/cloud/services/instances/logs": {},
								"/cloud/namespaces/list": {},
								"/cloud/resource": {},
								"/cloud/metrics/services": {},
								"/cloud/metrics/nodes": {},
								"/catalog/recipes/list": {},
								"/catalog/recipes/get": {},
								"/catalog/recipes/upgrade": {},
								"/ci": {},
								"/ci/providers": {},
								"/ci/recipe/download": {},
								"/ci/script/download": {},
								"/ci/status": {},
								"/ci/settings": {},
								"/ci/repo/remote/config": {},
								"/gitAccounts/accounts/list": {},
								"/gitAccounts/getRepos": {},
								"/gitAccounts/getBranches": {},
								"/gitAccounts/getYaml": {}
							}
						},
						"put": {
							"apis": {
								"/cd/ledger/read": {},
								"/cd/action": {},
								"/environment/update": {},
								"/environment/key/update": {},
								"/environment/dbs/update": {},
								"/environment/dbs/updatePrefix": {},
								"/resources/update": {},
								"/resources/config/update": {},
								"/customRegistry/update": {},
								"/customRegistry/upgrade": {},
								"/environment/platforms/cert/choose": {},
								"/environment/platforms/driver/changeSelected": {},
								"/environment/platforms/deployer/type/change": {},
								"/environment/platforms/deployer/update": {},
								"/product/update": {},
								"/product/packages/update": {},
								"/tenant/update": {},
								"/tenant/oauth/update": {},
								"/tenant/oauth/users/update": {},
								"/tenant/application/update": {},
								"/tenant/application/key/ext/update": {},
								"/tenant/application/key/config/update": {},
								"/services/settings/update": {},
								"/daemons/groupConfig/update": {},
								"/daemons/groupConfig/serviceConfig/update": {},
								"/daemons/groupConfig/tenantExtKeys/update": {},
								"/cloud/nodes/update": {},
								"/cloud/nodes/tag": {},
								"/cloud/services/scale": {},
								"/cloud/services/redeploy": {},
								"/cloud/services/autoscale": {},
								"/cloud/services/autoscale/config": {},
								"/catalog/recipes/update": {},
								"/ci/provider": {},
								"/ci/recipe": {},
								"/ci/settings": {},
								"/gitAccounts/repo/sync": {},
								"/gitAccounts/repo/deactivate": {}
							}
						},
						"delete": {
							"apis": {
								"/environment/delete": {},
								"/environment/dbs/delete": {},
								"/resources/delete": {},
								"/customRegistry/delete": {},
								"/environment/platforms/cert/delete": {},
								"/product/delete": {},
								"/product/packages/delete": {},
								"/tenant/delete": {},
								"/tenant/oauth/delete": {},
								"/tenant/oauth/users/delete": {},
								"/tenant/application/delete": {},
								"/tenant/application/key/delete": {},
								"/daemons/groupConfig/delete": {},
								"/cloud/nodes/remove": {},
								"/cloud/services/delete": {},
								"/cloud/namespaces/delete": {},
								"/catalog/recipes/delete": {},
								"/ci/recipe": {},
								"/gitAccounts/logout": {}
							}
						}
					},
					"portal": {
						"urac": {
							"access" : true,
							"apisPermission" : "restricted",
							"get" : {
								"apis" : {
									"/owner/admin/users/count" : {
									
									},
									"/owner/admin/listUsers" : {
									
									},
									"/owner/admin/changeUserStatus" : {
									
									},
									"/owner/admin/getUser" : {
									
									},
									"/owner/admin/group/list" : {
									
									},
									"/owner/admin/tokens/list" : {
									
									},
									"/tenant/list" : {
									
									},
									"/tenant/getUserAclInfo" : {
									
									}
								}
							},
							"post" : {
								"apis" : {
									"/owner/admin/addUser" : {
									
									},
									"/owner/admin/editUser" : {
									
									},
									"/owner/admin/editUserConfig" : {
									
									},
									"/owner/admin/group/add" : {
									
									},
									"/owner/admin/group/edit" : {
									
									},
									"/owner/admin/group/addUsers" : {
									
									}
								}
							},
							"delete" : {
								"apis" : {
									"/owner/admin/group/delete" : {
									
									},
									"/owner/admin/tokens/delete" : {
									
									}
								}
							}
						}
					}
				}
			},
			"_TTL" : 7 * 24 * 3600 * 1000 // 7 days hours
		}
	]
};

module.exports = dsbrdProduct;