'use strict';

var dsbrdProduct = {
	"_id" : "5512867be603d7e01ab1688d",
	"locked" : true,
	"code" : "DSBRD",
	"name" : "Console UI Product",
	"description" : "This is the main Console UI Product.",
	"packages" : [
		{
			"code" : "DSBRD_GUEST",
			"name" : "Guest",
			"locked" : true,
			"description" : "This package is used to provide anyone access to login and forgot password. Once logged in the package linked to the user tenant will take over thus providing the right access to the logged in user.",
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
									"access" : false
								},
								"/refreshToken/:token" : {
									"access" : false
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
					},
					"dashboard" : {
						"access" : true,
						"apisPermission" : "restricted",
						"post" : {
							"apis" : {
								"/tenant/acl/get" : {
								
								}
							}
						}
					}
				}
			},
			"_TTL" : 604800000
		},
		{
			"code" : "DSBRD_OWNER",
			"name" : "Owner",
			"description" : "This package is used to provide owner level access. This means the user who has this package will have access to everything.",
			"locked" : true,
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
								"/tenant/list" : {
								
								},
								"/tenant/getUserAclInfo" : {
								
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
						"access" : true,
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
									"access" : false
								}
							}
						},
						"post" : {
							"apis" : {
								"/token" : {
									"access" : false
								}
							}
						},
						"delete" : {
							"apis" : {
								"/accessToken/:token" : {
									"access" : false
								},
								"/refreshToken/:token" : {
									"access" : false
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
				}
			},
			"_TTL" : 604800000
		},
		{
			"code" : "DSBRD_DEVOP",
			"name" : "DevOps",
			"locked" : true,
			"description" : "This package has the right privileges a DevOps user will need to be able to configure, control, and monitor what is happening across the board.",
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
								
								}
							}
						},
						"delete" : {
							"apis" : {
							
							}
						}
					},
					"oauth" : {
						"access" : true,
						"get" : {
							"apis" : {
								"/authorization" : {
									"access" : false
								}
							}
						},
						"post" : {
							"apis" : {
								"/token" : {
									"access" : false
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
					},
					"dashboard" : {
						"access" : true,
						"apisPermission" : "restricted",
						"post" : {
							"apis" : {
								"/cd/deploy" : {
									"access" : false
								},
								"/cd" : {
									"access" : true
								},
								"/cd/pause" : {
									"access" : true
								},
								"/environment/add" : {
									"access" : true
								},
								"/environment/dbs/add" : {
									"access" : true
								},
								"/resources/add" : {
								
								},
								"/customRegistry/add" : {
									"access" : true
								},
								"/environment/platforms/cert/upload" : {
								
								},
								"/product/add" : {
									"access" : true
								},
								"/product/packages/add" : {
									"access" : true
								},
								"/tenant/add" : {
									"access" : true
								},
								"/tenant/acl/get" : {
									"access" : true
								},
								"/tenant/oauth/add" : {
									"access" : true
								},
								"/tenant/oauth/users/add" : {
									"access" : true
								},
								"/tenant/application/add" : {
									"access" : true
								},
								"/tenant/application/key/add" : {
									"access" : true
								},
								"/tenant/application/key/ext/add" : {
									"access" : true
								},
								"/tenant/application/key/ext/delete" : {
									"access" : true
								},
								"/services/list" : {
									"access" : true
								},
								"/daemons/groupConfig/list" : {
									"access" : true
								},
								"/daemons/groupConfig/add" : {
									"access" : true
								},
								"/daemons/list" : {
									"access" : true
								},
								"/hosts/maintenanceOperation" : {
								
								},
								"/cloud/services/soajs/deploy" : {
									"access" : true
								},
								"/cloud/plugins/deploy" : {
									"access" : true
								},
								"/cloud/nodes/add" : {
									"access" : true
								},
								"/cloud/services/maintenance" : {
									"access" : true
								},
								"/catalog/recipes/add" : {
									"access" : true
								},
								"/ci/provider" : {
									"access" : true
								},
								"/ci/recipe" : {
									"access" : true
								},
								"/gitAccounts/login" : {
									"access" : true
								},
								"/gitAccounts/repo/activate" : {
									"access" : true
								},
								"/swagger/simulate" : {
									"access" : true
								},
								"/swagger/generate" : {
									"access" : true
								},
								"/templates/import" : {
									"access" : true
								},
								"/templates/export" : {
									"access" : true
								},
								"/environment/platforms/attach" : {
									"access" : true
								},
								"/settings/tenant/oauth/add" : {
									"access" : true
								},
								"/settings/tenant/oauth/users/add" : {
									"access" : true
								},
								"/settings/tenant/application/key/add" : {
									"access" : true
								},
								"/settings/tenant/application/key/ext/add" : {
									"access" : true
								},
								"/settings/tenant/application/key/ext/delete" : {
									"access" : true
								},
								"/hosts/start" : {
									"access" : true
								},
								"/hosts/stop" : {
									"access" : true
								},
								"/cloud/vm/maintenance" : {
									"access" : true
								},
								"/cloud/vm" : {
									"access" : true
								},
								"/cloud/vm/onboard" : {
									"access" : true
								},
								"/cloud/vm/logs" : {
									"access" : true
								},
								"/infra/extras" : {
									"access" : true
								},
								"/apiBuilder/add" : {
									"access" : true
								},
								"/apiBuilder/authentication/update" : {
									"access" : true
								},
								"/apiBuilder/convertSwaggerToImfv" : {
									"access" : true
								},
								"/apiBuilder/convertImfvToSwagger" : {
									"access" : true
								},
								"/secrets/add" : {
									"access" : true
								},
								"/infra" : {
									"access" : true
								},
								"/infra/template" : {
									"access" : true
								},
								"/infra/template/upload" : {
									"access" : true
								},
								"/infra/cluster/scale" : {
									"access" : true
								},
								"/swagger/generateExistingService" : {
									"access" : true
								},
								"/environment/infra/lock" : {
									"access" : true
								},
								"/resources" : {
									"access" : true
								}
							}
						},
						"get" : {
							"apis" : {
								"/cd/ledger" : {
									"access" : true
								},
								"/cd" : {
									"access" : true
								},
								"/cd/updates" : {
									"access" : true
								},
								"/environment" : {
									"access" : true
								},
								"/environment/list" : {
									"access" : true
								},
								"/environment/profile" : {
									"access" : true
								},
								"/environment/dbs/list" : {
									"access" : true
								},
								"/resources/list" : {
								
								},
								"/resources/get" : {
									"access" : true
								},
								"/resources/upgrade" : {
									"access" : true
								},
								"/resources/config" : {
									"access" : true
								},
								"/customRegistry/list" : {
									"access" : true
								},
								"/customRegistry/get" : {
									"access" : true
								},
								"/environment/platforms/list" : {
									"access" : true
								},
								"/product/list" : {
									"access" : true
								},
								"/product/get" : {
									"access" : true
								},
								"/product/packages/list" : {
									"access" : true
								},
								"/product/packages/get" : {
									"access" : true
								},
								"/permissions/get" : {
									"access" : true
								},
								"/key/get" : {
								
								},
								"/tenant/list" : {
									"access" : true
								},
								"/tenant/get" : {
									"access" : true
								},
								"/tenant/oauth/list" : {
									"access" : true
								},
								"/tenant/oauth/users/list" : {
									"access" : true
								},
								"/tenant/application/list" : {
									"access" : true
								},
								"/tenant/application/key/list" : {
									"access" : true
								},
								"/tenant/application/key/ext/list" : {
									"access" : true
								},
								"/tenant/application/key/config/list" : {
									"access" : true
								},
								"/tenant/db/keys/list" : {
									"access" : true
								},
								"/services/env/list" : {
									"access" : true
								},
								"/daemons/groupConfig/serviceConfig/list" : {
									"access" : true
								},
								"/daemons/groupConfig/tenantExtKeys/list" : {
									"access" : true
								},
								"/hosts/list" : {
									"access" : true
								},
								"/cloud/services/list" : {
									"access" : true
								},
								"/cloud/nodes/list" : {
									"access" : true
								},
								"/cloud/services/instances/logs" : {
									"access" : true
								},
								"/cloud/namespaces/list" : {
									"access" : true
								},
								"/cloud/resource" : {
									"access" : true
								},
								"/cloud/metrics/services" : {
									"access" : true
								},
								"/cloud/metrics/nodes" : {
									"access" : true
								},
								"/catalog/recipes/list" : {
									"access" : true
								},
								"/catalog/recipes/get" : {
									"access" : true
								},
								"/catalog/recipes/upgrade" : {
									"access" : true
								},
								"/ci" : {
									"access" : true
								},
								"/ci/providers" : {
									"access" : true
								},
								"/ci/recipe/download" : {
									"access" : true
								},
								"/ci/script/download" : {
									"access" : true
								},
								"/ci/status" : {
									"access" : true
								},
								"/ci/settings" : {
									"access" : true
								},
								"/ci/repo/remote/config" : {
									"access" : true
								},
								"/gitAccounts/accounts/list" : {
									"access" : true
								},
								"/gitAccounts/getRepos" : {
									"access" : true
								},
								"/gitAccounts/getBranches" : {
									"access" : true
								},
								"/gitAccounts/getYaml" : {
									"access" : true
								},
								"/templates" : {
									"access" : true
								},
								"/templates/upgrade" : {
									"access" : true
								},
								"/settings/tenant/get" : {
									"access" : true
								},
								"/settings/tenant/oauth/list" : {
									"access" : true
								},
								"/settings/tenant/oauth/users/list" : {
									"access" : true
								},
								"/settings/tenant/application/list" : {
									"access" : true
								},
								"/settings/tenant/application/key/list" : {
									"access" : true
								},
								"/settings/tenant/application/key/ext/list" : {
									"access" : true
								},
								"/settings/tenant/application/key/config/list" : {
									"access" : true
								},
								"/cloud/vm/list" : {
									"access" : true
								},
								"/cloud/vm/layer/status" : {
									"access" : true
								},
								"/apiBuilder/list" : {
									"access" : true
								},
								"/apiBuilder/get" : {
									"access" : true
								},
								"/apiBuilder/publish" : {
									"access" : true
								},
								"/apiBuilder/getResources" : {
									"access" : true
								},
								"/secrets/list" : {
									"access" : true
								},
								"/secrets/get" : {
									"access" : true
								},
								"/infra" : {
									"access" : true
								},
								"/infra/cluster" : {
									"access" : true
								},
								"/infra/template/download" : {
									"access" : true
								},
								"/infra/extras" : {
									"access" : true
								},
								"/ci/repo/builds" : {
									"access" : true
								},
								"/environment/status" : {
									"access" : true
								},
								"/resources" : {
									"access" : true
								},
								"/hosts/awareness" : {
									"access" : true
								},
								"/hosts/maintenance" : {
									"access" : true
								}
							}
						},
						"put" : {
							"apis" : {
								"/cd/ledger/read" : {
									"access" : true
								},
								"/cd/action" : {
									"access" : true
								},
								"/environment/update" : {
									"access" : true
								},
								"/environment/key/update" : {
									"access" : true
								},
								"/environment/dbs/update" : {
									"access" : true
								},
								"/environment/dbs/updatePrefix" : {
									"access" : true
								},
								"/resources/update" : {
									"access" : true
								},
								"/resources/config/update" : {
									"access" : true
								},
								"/customRegistry/update" : {
									"access" : true
								},
								"/customRegistry/upgrade" : {
									"access" : true
								},
								"/environment/platforms/cert/choose" : {
								
								},
								"/environment/platforms/driver/changeSelected" : {
								
								},
								"/environment/platforms/deployer/type/change" : {
								
								},
								"/environment/platforms/deployer/update" : {
									"access" : true
								},
								"/product/update" : {
									"access" : true
								},
								"/product/packages/update" : {
									"access" : true
								},
								"/tenant/update" : {
									"access" : true
								},
								"/tenant/oauth/update" : {
									"access" : true
								},
								"/tenant/oauth/users/update" : {
									"access" : true
								},
								"/tenant/application/update" : {
									"access" : true
								},
								"/tenant/application/key/ext/update" : {
									"access" : true
								},
								"/tenant/application/key/config/update" : {
									"access" : true
								},
								"/services/settings/update" : {
									"access" : true
								},
								"/daemons/groupConfig/update" : {
									"access" : true
								},
								"/daemons/groupConfig/serviceConfig/update" : {
									"access" : true
								},
								"/daemons/groupConfig/tenantExtKeys/update" : {
									"access" : true
								},
								"/cloud/nodes/update" : {
									"access" : true
								},
								"/cloud/nodes/tag" : {
								
								},
								"/cloud/services/scale" : {
									"access" : true
								},
								"/cloud/services/redeploy" : {
									"access" : true
								},
								"/cloud/services/autoscale" : {
									"access" : true
								},
								"/cloud/services/autoscale/config" : {
									"access" : true
								},
								"/catalog/recipes/update" : {
									"access" : true
								},
								"/ci/provider" : {
									"access" : true
								},
								"/ci/recipe" : {
									"access" : true
								},
								"/ci/settings" : {
									"access" : true
								},
								"/gitAccounts/repo/sync" : {
									"access" : true
								},
								"/gitAccounts/repo/deactivate" : {
									"access" : true
								},
								"/settings/tenant/update" : {
									"access" : true
								},
								"/settings/tenant/oauth/update" : {
									"access" : true
								},
								"/settings/tenant/oauth/users/update" : {
									"access" : true
								},
								"/settings/tenant/application/key/ext/update" : {
									"access" : true
								},
								"/settings/tenant/application/key/config/update" : {
									"access" : true
								},
								"/apiBuilder/edit" : {
									"access" : true
								},
								"/apiBuilder/updateSchemas" : {
									"access" : true
								},
								"/infra" : {
									"access" : true
								},
								"/infra/template" : {
									"access" : true
								},
								"/gitAccounts/repo/sync/branches" : {
									"access" : true
								}
							}
						},
						"delete" : {
							"apis" : {
								"/environment/delete" : {
									"access" : true
								},
								"/environment/dbs/delete" : {
									"access" : true
								},
								"/resources/delete" : {
								
								},
								"/customRegistry/delete" : {
									"access" : true
								},
								"/environment/platforms/cert/delete" : {
								
								},
								"/product/delete" : {
									"access" : true
								},
								"/product/packages/delete" : {
									"access" : true
								},
								"/tenant/delete" : {
									"access" : true
								},
								"/tenant/oauth/delete" : {
									"access" : true
								},
								"/tenant/oauth/users/delete" : {
									"access" : true
								},
								"/tenant/application/delete" : {
									"access" : true
								},
								"/tenant/application/key/delete" : {
									"access" : true
								},
								"/daemons/groupConfig/delete" : {
									"access" : true
								},
								"/cloud/nodes/remove" : {
									"access" : true
								},
								"/cloud/services/delete" : {
									"access" : true
								},
								"/cloud/namespaces/delete" : {
									"access" : true
								},
								"/catalog/recipes/delete" : {
									"access" : true
								},
								"/ci/recipe" : {
									"access" : true
								},
								"/gitAccounts/logout" : {
									"access" : true
								},
								"/templates" : {
									"access" : true
								},
								"/environment/platforms/detach" : {
									"access" : true
								},
								"/settings/tenant/oauth/delete" : {
									"access" : true
								},
								"/settings/tenant/oauth/users/delete" : {
									"access" : true
								},
								"/settings/tenant/application/key/delete" : {
									"access" : true
								},
								"/apiBuilder/delete" : {
									"access" : true
								},
								"/secrets/delete" : {
									"access" : true
								},
								"/infra" : {
									"access" : true
								},
								"/infra/deployment" : {
									"access" : true
								},
								"/infra/template" : {
									"access" : true
								},
								"/environment/infra/lock" : {
									"access" : true
								},
								"/cloud/vm/instance" : {
									"access" : true
								},
								"/cloud/vm" : {
									"access" : true
								},
								"/infra/extras" : {
									"access" : true
								},
								"/resources" : {
									"access" : true
								}
							}
						}
					},
					"portal" : {
						"access" : false
					}
				}
			},
			"_TTL" : 604800000
		},
		{
			"code" : "DSBRD_DEVEL",
			"name" : "Developer",
			"locked" : true,
			"description" : "This package is ideal for a developer. You are not giving much access but yet it is enough to sail and fast.",
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
								
								}
							}
						},
						"delete" : {
							"apis" : {
							
							}
						}
					},
					"oauth" : {
						"access" : true,
						"get" : {
							"apis" : {
								"/authorization" : {
									"access" : false
								}
							}
						},
						"post" : {
							"apis" : {
								"/token" : {
									"access" : false
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
					},
					"dashboard" : {
						"access" : true,
						"apisPermission" : "restricted",
						"post" : {
							"apis" : {
								"/cd/deploy" : {
									"access" : false
								},
								"/cd" : {
									"access" : true
								},
								"/cd/pause" : {
									"access" : true
								},
								"/environment/add" : {
									"access" : true
								},
								"/environment/dbs/add" : {
									"access" : true
								},
								"/resources/add" : {
								
								},
								"/customRegistry/add" : {
									"access" : true
								},
								"/environment/platforms/cert/upload" : {
								
								},
								"/services/list" : {
									"access" : true
								},
								"/daemons/groupConfig/list" : {
									"access" : true
								},
								"/daemons/groupConfig/add" : {
									"access" : true
								},
								"/daemons/list" : {
									"access" : true
								},
								"/hosts/maintenanceOperation" : {
								
								},
								"/cloud/services/soajs/deploy" : {
									"access" : true
								},
								"/cloud/plugins/deploy" : {
									"access" : true
								},
								"/cloud/nodes/add" : {
									"access" : true
								},
								"/cloud/services/maintenance" : {
									"access" : true
								},
								"/swagger/simulate" : {
									"access" : true
								},
								"/resources" : {
									"access" : true
								},
								"/apiBuilder/add" : {
									"access" : true
								},
								"/apiBuilder/authentication/update" : {
									"access" : true
								},
								"/apiBuilder/convertSwaggerToImfv" : {
									"access" : true
								},
								"/apiBuilder/convertImfvToSwagger" : {
									"access" : true
								},
								"/secrets/add" : {
									"access" : true
								},
								"/environment/infra/lock" : {
									"access" : true
								},
								"/environment/platforms/attach" : {
									"access" : true
								},
								"/hosts/start" : {
									"access" : true
								},
								"/hosts/stop" : {
									"access" : true
								},
								"/cloud/vm/maintenance" : {
									"access" : true
								},
								"/cloud/vm" : {
									"access" : true
								},
								"/cloud/vm/onboard" : {
									"access" : true
								},
								"/cloud/vm/logs" : {
									"access" : true
								},
								"/infra/extras" : {
									"access" : true
								},
								"/swagger/generate" : {
									"access" : true
								},
								"/swagger/generateExistingService" : {
									"access" : true
								},
								"/gitAccounts/login" : {
									"access" : true
								},
								"/gitAccounts/repo/activate" : {
									"access" : true
								}
							}
						},
						"get" : {
							"apis" : {
								"/cd/ledger" : {
									"access" : true
								},
								"/cd" : {
									"access" : true
								},
								"/cd/updates" : {
									"access" : true
								},
								"/environment" : {
									"access" : true
								},
								"/environment/list" : {
									"access" : true
								},
								"/environment/profile" : {
									"access" : true
								},
								"/environment/dbs/list" : {
									"access" : true
								},
								"/resources/list" : {
								
								},
								"/resources/get" : {
									"access" : true
								},
								"/resources/upgrade" : {
									"access" : true
								},
								"/resources/config" : {
									"access" : true
								},
								"/customRegistry/list" : {
									"access" : true
								},
								"/customRegistry/get" : {
									"access" : true
								},
								"/environment/platforms/list" : {
									"access" : true
								},
								"/key/get" : {
								
								},
								"/services/env/list" : {
									"access" : true
								},
								"/daemons/groupConfig/serviceConfig/list" : {
									"access" : true
								},
								"/daemons/groupConfig/tenantExtKeys/list" : {
									"access" : true
								},
								"/hosts/list" : {
									"access" : true
								},
								"/cloud/services/list" : {
									"access" : true
								},
								"/cloud/nodes/list" : {
									"access" : true
								},
								"/cloud/services/instances/logs" : {
									"access" : true
								},
								"/cloud/namespaces/list" : {
									"access" : true
								},
								"/cloud/resource" : {
									"access" : true
								},
								"/cloud/metrics/services" : {
									"access" : true
								},
								"/cloud/metrics/nodes" : {
									"access" : true
								},
								"/catalog/recipes/list" : {
								
								},
								"/catalog/recipes/get" : {
								
								},
								"/catalog/recipes/upgrade" : {
								
								},
								"/environment/status" : {
									"access" : true
								},
								"/resources" : {
									"access" : true
								},
								"/apiBuilder/list" : {
									"access" : true
								},
								"/apiBuilder/get" : {
									"access" : true
								},
								"/apiBuilder/publish" : {
									"access" : true
								},
								"/apiBuilder/getResources" : {
									"access" : true
								},
								"/secrets/list" : {
									"access" : true
								},
								"/secrets/get" : {
									"access" : true
								},
								"/templates" : {
									"access" : true
								},
								"/templates/upgrade" : {
								
								},
								"/cloud/vm/list" : {
									"access" : true
								},
								"/cloud/vm/layer/status" : {
									"access" : true
								},
								"/hosts/awareness" : {
									"access" : true
								},
								"/hosts/maintenance" : {
									"access" : true
								},
								"/gitAccounts/accounts/list" : {
									"access" : true
								},
								"/gitAccounts/getRepos" : {
									"access" : true
								},
								"/gitAccounts/getBranches" : {
									"access" : true
								},
								"/gitAccounts/getYaml" : {
									"access" : true
								}
							}
						},
						"put" : {
							"apis" : {
								"/cd/ledger/read" : {
									"access" : true
								},
								"/cd/action" : {
									"access" : true
								},
								"/environment/update" : {
									"access" : true
								},
								"/environment/key/update" : {
									"access" : true
								},
								"/environment/dbs/update" : {
									"access" : true
								},
								"/environment/dbs/updatePrefix" : {
									"access" : true
								},
								"/resources/update" : {
									"access" : true
								},
								"/resources/config/update" : {
									"access" : true
								},
								"/customRegistry/update" : {
									"access" : true
								},
								"/customRegistry/upgrade" : {
									"access" : true
								},
								"/environment/platforms/cert/choose" : {
								
								},
								"/environment/platforms/driver/changeSelected" : {
								
								},
								"/environment/platforms/deployer/type/change" : {
								
								},
								"/environment/platforms/deployer/update" : {
									"access" : true
								},
								"/services/settings/update" : {
									"access" : true
								},
								"/daemons/groupConfig/update" : {
									"access" : true
								},
								"/daemons/groupConfig/serviceConfig/update" : {
									"access" : true
								},
								"/daemons/groupConfig/tenantExtKeys/update" : {
									"access" : true
								},
								"/cloud/nodes/update" : {
									"access" : true
								},
								"/cloud/nodes/tag" : {
								
								},
								"/cloud/services/scale" : {
									"access" : true
								},
								"/cloud/services/redeploy" : {
									"access" : true
								},
								"/cloud/services/autoscale" : {
									"access" : true
								},
								"/cloud/services/autoscale/config" : {
									"access" : true
								},
								"/apiBuilder/edit" : {
									"access" : true
								},
								"/apiBuilder/updateSchemas" : {
									"access" : true
								},
								"/gitAccounts/repo/sync" : {
									"access" : true
								},
								"/gitAccounts/repo/sync/branches" : {
									"access" : true
								},
								"/gitAccounts/repo/deactivate" : {
									"access" : true
								}
							}
						},
						"delete" : {
							"apis" : {
								"/environment/delete" : {
								
								},
								"/environment/dbs/delete" : {
									"access" : true
								},
								"/resources/delete" : {
								
								},
								"/customRegistry/delete" : {
									"access" : true
								},
								"/environment/platforms/cert/delete" : {
								
								},
								"/daemons/groupConfig/delete" : {
									"access" : true
								},
								"/cloud/nodes/remove" : {
									"access" : true
								},
								"/cloud/services/delete" : {
									"access" : true
								},
								"/cloud/namespaces/delete" : {
									"access" : true
								},
								"/resources" : {
									"access" : true
								},
								"/apiBuilder/delete" : {
									"access" : true
								},
								"/secrets/delete" : {
									"access" : true
								},
								"/environment/infra/lock" : {
								
								},
								"/cloud/vm/instance" : {
									"access" : true
								},
								"/cloud/vm" : {
									"access" : true
								},
								"/infra/extras" : {
									"access" : true
								},
								"/environment/platforms/detach" : {
									"access" : true
								},
								"/gitAccounts/logout" : {
									"access" : true
								}
							}
						}
					},
					"portal" : {
						"access" : false
					}
				}
			},
			"_TTL" : 21600000
		}
	]
};

module.exports = dsbrdProduct;