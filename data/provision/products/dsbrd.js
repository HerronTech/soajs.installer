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
						"access" : true,
						"post" : {
							"apis" : {
								"/cd/deploy" : {
									"access" : false
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