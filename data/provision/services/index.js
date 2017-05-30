'use strict';

var services = [
	{
		"name": "controller",
		"port": 4000,
		"src": {
			"provider": "github",
			"owner": "soajs",
			"repo": "soajs.controller"
		}
	},
	{
		"name": "urac",
		"group": "SOAJS Core Services",
		"port": 4001,
		"requestTimeout": 30,
		"requestTimeoutRenewal": 5,
		"src" : {
			"provider" : "github",
			"owner" : "soajs",
			"repo" : "soajs.urac",
			"cmd": [
				"/etc/init.d/postfix start"
			]
		},
		"versions": {
			"1": {
				"extKeyRequired": true,
				"oauth": true,
				"awareness": false,
				"apis": [
					{
						"l": "Change Email",
						"group": "My Account",
						'v': "/account/changeEmail"
					},
					{
						"l": "Change Password",
						"group": "My Account",
						'v': "/account/changePassword"
					},
					{
						"l": "Edit Profile",
						"group": "My Account",
						'v': "/account/editProfile"
					},
					{
						"l": "Get User Info",
						"group": "My Account",
						"groupMain": true,
						'v': "/account/getUser"
					},
					{
						"l": "Add new User",
						"group": "Administration",
						'v': "/admin/addUser"
					},
					{
						"l": "Get User Record",
						"group": "Administration",
						'v': "/admin/getUser"
					},
					{
						"l": "Change User Status",
						"group": "Administration",
						'v': "/admin/changeUserStatus"
					},
					{
						"l": "Edit User Record",
						"group": "Administration",
						'v': "/admin/editUser"
					},
					{
						"l": "Add new Group",
						"group": "Administration",
						'v': "/admin/group/add"
					},
					{
						"l": "Add Users to Group",
						"group": "Administration",
						'v': "/admin/group/addUsers"
					},
					{
						"l": "Delete Group",
						"group": "Administration",
						'v': "/admin/group/delete"
					},
					{
						"l": "Edit Group",
						"group": "Administration",
						'v': "/admin/group/edit"
					},
					{
						"l": "List Groups",
						"group": "Administration",
						'v': "/admin/group/list"
					},
					{
						"l": "List Users",
						"group": "Administration",
						"groupMain": true,
						'v': "/admin/listUsers"
					},
					{
						"l": "Validate Change Email",
						"group": "Guest",
						'v': "/changeEmail/validate"
					},
					{
						"l": "Forgot Password",
						"group": "Guest",
						'v': "/forgotPassword"
					},
					{
						"l": "Register",
						"group": "Guest",
						'v': "/join"
					},
					{
						"l": "Validate Register",
						"group": "Guest",
						'v': "/join/validate"
					},
					{
						"l": "Login",
						"group": "Guest",
						"groupMain": true,
						'v': "/login"
					},
					{
						"l": "Logout",
						"group": "Guest",
						'v': "/logout"
					},
					{
						"l": "Reset Password",
						"group": "Guest",
						'v': "/resetPassword"
					},
					{
						"l": "Get all Users & Groups",
						"group": "Administration",
						'v': "/admin/all"
					}
				]
			},
			"2": {
				"extKeyRequired": true,
				"oauth": true,
				"apis": [
					{
						"l": "Login Through Passport",
						"v": "/passport/login/:strategy",
						"m": "get",
						"group": "Guest"
					},
					{
						"l": "Login Through Passport Validate",
						"v": "/passport/validate/:strategy",
						"m": "get",
						"group": "Guest"
					},
					{
						"l": "Validate Register",
						"v": "/join/validate",
						"m": "get",
						"group": "Guest"
					},
					{
						"l": "Forgot Password",
						"v": "/forgotPassword",
						"m": "get",
						"group": "Guest"
					},
					{
						"l": "Check If Username Exists",
						"v": "/checkUsername",
						"m": "get",
						"group": "Guest"
					},
					{
						"l": "Validate Change Email",
						"v": "/changeEmail/validate",
						"m": "get",
						"group": "Guest"
					},
					{
						"l": "Get User Info",
						"v": "/account/getUser",
						"m": "get",
						"group": "My Account",
						"groupMain": true
					},
					{
						"l": "Change User Status",
						"v": "/admin/changeUserStatus",
						"m": "get",
						"group": "Administration"
					},
					{
						"l": "List Users",
						"v": "/admin/listUsers",
						"m": "get",
						"group": "Administration",
						"groupMain": true
					},
					{
						"l": "Total Users Count",
						"v": "/admin/users/count",
						"m": "get",
						"group": "Administration"
					},
					{
						"l": "Get User Record",
						"v": "/admin/getUser",
						"m": "get",
						"group": "Administration"
					},
					{
						"l": "List Groups",
						"v": "/admin/group/list",
						"m": "get",
						"group": "Administration"
					},
					{
						"l": "Get all Users & Groups",
						"v": "/admin/all",
						"m": "get",
						"group": "Administration"
					},
					{
						"l": "Total Users Count",
						"v": "/owner/admin/users/count",
						"m": "get",
						"group": "Owner"
					},
					{
						"l": "List Users",
						"v": "/owner/admin/listUsers",
						"m": "get",
						"group": "Owner",
						"groupMain": true
					},
					{
						"l": "Change User Status",
						"v": "/owner/admin/changeUserStatus",
						"m": "get",
						"group": "Owner"
					},
					{
						"l": "Get User Record",
						"v": "/owner/admin/getUser",
						"m": "get",
						"group": "Owner"
					},
					{
						"l": "List Groups",
						"v": "/owner/admin/group/list",
						"m": "get",
						"group": "Owner"
					},
					{
						"l": "List Tokens",
						"v": "/owner/admin/tokens/list",
						"m": "get",
						"group": "Owner"
					},
					{
						"l": "OpenAM Login",
						"v": "/openam/login",
						"m": "post",
						"group": "Guest"
					},
					{
						"l": "Ldap Login",
						"v": "/ldap/login",
						"m": "post",
						"group": "Guest"
					},
					{
						"l": "Register",
						"v": "/join",
						"m": "post",
						"group": "Guest"
					},
					{
						"l": "Reset Password",
						"v": "/resetPassword",
						"m": "post",
						"group": "Guest"
					},
					{
						"l": "Change Password",
						"v": "/account/changePassword",
						"m": "post",
						"group": "My Account"
					},
					{
						"l": "Change Email",
						"v": "/account/changeEmail",
						"m": "post",
						"group": "My Account"
					},
					{
						"l": "Edit Profile",
						"v": "/account/editProfile",
						"m": "post",
						"group": "My Account"
					},
					{
						"l": "Add new User",
						"v": "/admin/addUser",
						"m": "post",
						"group": "Administration"
					},
					{
						"l": "Edit User Record",
						"v": "/admin/editUser",
						"m": "post",
						"group": "Administration"
					},
					{
						"l": "Edit User Config",
						"v": "/admin/editUserConfig",
						"m": "post",
						"group": "Administration"
					},
					{
						"l": "Add new Group",
						"v": "/admin/group/add",
						"m": "post",
						"group": "Administration"
					},
					{
						"l": "Edit Group",
						"v": "/admin/group/edit",
						"m": "post",
						"group": "Administration"
					},
					{
						"l": "Add Users to Group",
						"v": "/admin/group/addUsers",
						"m": "post",
						"group": "Administration"
					},
					{
						"l": "Add new User",
						"v": "/owner/admin/addUser",
						"m": "post",
						"group": "Owner"
					},
					{
						"l": "Edit User Record",
						"v": "/owner/admin/editUser",
						"m": "post",
						"group": "Owner"
					},
					{
						"l": "Edit User Config",
						"v": "/owner/admin/editUserConfig",
						"m": "post",
						"group": "Owner"
					},
					{
						"l": "Add new Group",
						"v": "/owner/admin/group/add",
						"m": "post",
						"group": "Owner"
					},
					{
						"l": "Edit Group",
						"v": "/owner/admin/group/edit",
						"m": "post",
						"group": "Owner"
					},
					{
						"l": "Add Users to Group",
						"v": "/owner/admin/group/addUsers",
						"m": "post",
						"group": "Owner"
					},
					{
						"l": "Delete Group",
						"v": "/admin/group/delete",
						"m": "delete",
						"group": "Administration"
					},
					{
						"l": "Delete Group",
						"v": "/owner/admin/group/delete",
						"m": "delete",
						"group": "Owner"
					},
					{
						"l": "Delete Token",
						"v": "/owner/admin/tokens/delete",
						"m": "delete",
						"group": "Owner"
					}
				],
				"awareness": true
			}
		}
	},
	{
		"name": "dashboard",
		"group": "SOAJS Core Services",
		"port": 4003,
		"requestTimeout": 30,
		"requestTimeoutRenewal": 5,
		"src" : {
			"provider" : "github",
			"owner" : "soajs",
			"repo" : "soajs.dashboard"
		},
		"versions": {
			"1": {
				"extKeyRequired": true,
				"urac" : true,
				"uracDriver" : true,
				"urac_Profile" : true,
				"urac_ACL" : true,
				"provision_ACL" : true,
				"awareness": true,
				"apis": [
					{
						"l": "List Environments",
						'v': "/environment/list",
						"group": "Environment",
						"groupMain": true
					}
					, {
						"l": "Add Environment",
						'v': "/environment/add",
						"group": "Environment"
					},
					{
						"l": "Delete Environment",
						'v': "/environment/delete",
						"group": "Environment"
					},
					{
						"l": "Update Environment",
						'v': "/environment/update",
						"group": "Environment"
					}, {
						"l": "Update Environment Tenant Key Security",
						'v': "/environment/key/update",
						"group": "Environment"
					}, {
						"l": "List Environment Databases",
						'v': "/environment/dbs/list",
						"group": "Environment Databases",
						"groupMain": true
					}, {
						"l": "Add Environment Database",
						'v': "/environment/dbs/add",
						"group": "Environment Databases"
					}, {
						"l": "Update Environment Database",
						'v': "/environment/dbs/update",
						"group": "Environment Databases"
					}, {
						"l": "Delete Environment Database",
						'v': "/environment/dbs/delete",
						"group": "Environment Databases"
					}, {
						"l": "Update Environment Databases Prefix",
						'v': "/environment/dbs/updatePrefix",
						"group": "Environment Databases"
					}, {
						"l": "List Environment Database Clusters",
						'v': "/environment/clusters/list",
						"group": "Environment Clusters",
						"groupMain": true
					}, {
						"l": "Add Environment Database Cluster",
						'v': "/environment/clusters/add",
						"group": "Environment Clusters"
					}, {
						"l": "Update Environment Database Cluster",
						'v': "/environment/clusters/update",
						"group": "Environment Clusters"
					}, {
						"l": "Delete Environment Database Cluster",
						'v': "/environment/clusters/delete",
						"group": "Environment Clusters"
					}, {
						"l": "List Products",
						'v': "/product/list",
						"group": "Product",
						"groupMain": true
					},
					{
						"l": "Get Product",
						'v': "/product/get",
						"group": "Product"
					}, {
						"l": "Add Product",
						'v': "/product/add",
						"group": "Product"
					}, {
						"l": "Delete Product",
						'v': "/product/delete",
						"group": "Product"
					}, {
						"l": "Update Product",
						'v': "/product/update",
						"group": "Product"
					}, {
						"l": "Delete Product Package",
						'v': "/product/packages/delete",
						"group": "Product"
					}, {
						"l": "List Product Packages",
						'v': "/product/packages/list",
						"group": "Product"
					}, {
						"l": "Get Product Package",
						'v': "/product/packages/get",
						"group": "Product"
					}, {
						"l": "Add Product Package",
						'v': "/product/packages/add",
						"group": "Product"
					}, {
						"l": "Update Product Package",
						'v': "/product/packages/update",
						"group": "Product"
					},
					{
						"l": "Get the user dashboard key",
						'v': "/key/get",
						"group": "Tenant"
					},
					{
						"l": "Get Tenant Security Permissions",
						'v': "/permissions/get",
						"group": "Tenant"
					},
					{
						"l": "List Tenants",
						'v': "/tenant/list",
						"group": "Tenant",
						"groupMain": true
					}, {
						"l": "Add Tenant",
						'v': "/tenant/add",
						"group": "Tenant"
					}, {
						"l": "Delete Tenant",
						'v': "/tenant/delete",
						"group": "Tenant"
					}, {
						"l": "Get Tenant",
						'v': "/tenant/get",
						"group": "Tenant"
					}, {
						"l": "Update Tenant",
						'v': "/tenant/update",
						"group": "Tenant"
					}, {
						"l": "Get Tenant oAuth Configuration",
						'v': "/tenant/oauth/list",
						"group": "Tenant oAuth"
					}, {
						"l": "Delete Tenant oAuth Configuration",
						'v': "/tenant/oauth/delete",
						"group": "Tenant oAuth"
					}, {
						"l": "Add Tenant oAuth Configuration",
						'v': "/tenant/oauth/add",
						"group": "Tenant oAuth"
					}, {
						"l": "Update Tenant oAuth Configuration",
						'v': "/tenant/oauth/update",
						"group": "Tenant oAuth"
					}, {
						"l": "List Tenant oAuth Users",
						'v': "/tenant/oauth/users/list",
						"group": "Tenant oAuth"
					}, {
						"l": "Delete Tenant oAuth User",
						'v': "/tenant/oauth/users/delete",
						"group": "Tenant oAuth"
					}, {
						"l": "Add Tenant oAuth User",
						'v': "/tenant/oauth/users/add",
						"group": "Tenant oAuth"
					}, {
						"l": "Update Tenant oAuth User",
						'v': "/tenant/oauth/users/update",
						"group": "Tenant oAuth"
					}, {
						"l": "List Tenant Applications",
						'v': "/tenant/application/list",
						"group": "Tenant Application"
					}, {
						"l": "Delete Tenant Application",
						'v': "/tenant/application/delete",
						"group": "Tenant Application"
					}, {
						"l": "Add Tenant Application",
						'v': "/tenant/application/add",
						"group": "Tenant Application"
					}, {
						"l": "Update Tenant Application",
						'v': "/tenant/application/update",
						"group": "Tenant Application"
					}, {
						"l": "Get Current Tenant Access Level",
						'v': "/tenant/acl/get",
						"group": "Tenant"
					}, {
						"l": "Add Tenant Application Key",
						'v': "/tenant/application/key/add",
						"group": "Tenant Application"
					}, {
						"l": "List Tenant Application Keys",
						'v': "/tenant/application/key/list",
						"group": "Tenant Application"
					}, {
						"l": "Delete Tenant Application Key",
						'v': "/tenant/application/key/delete",
						"group": "Tenant Application"
					}, {
						"l": "List Tenant Application External Keys",
						'v': "/tenant/application/key/ext/list",
						"group": "Tenant Application"
					}, {
						"l": "Add Tenant Application External Key",
						'v': "/tenant/application/key/ext/add",
						"group": "Tenant Application"
					}, {
						"l": "Update Tenant Application External Key",
						'v': "/tenant/application/key/ext/update",
						"group": "Tenant Application"
					}, {
						"l": "Delete Tenant Application External Key",
						'v': "/tenant/application/key/ext/delete",
						"group": "Tenant Application"
					}, {
						"l": "List Tenant Application Key Configuration",
						'v': "/tenant/application/key/config/list",
						"group": "Tenant Application"
					}, {
						"l": "Update Tenant Application Key Configuration",
						'v': "/tenant/application/key/config/update",
						"group": "Tenant Application"
					}, {
						"l": "Get Tenant",
						'v': "/settings/tenant/get",
						"group": "Tenant Settings"
					}, {
						"l": "Update Tenant",
						'v': "/settings/tenant/update",
						"group": "Tenant Settings"
					}, {
						"l": "Get Tenant oAuth Configuration",
						'v': "/settings/tenant/oauth/list",
						"group": "Tenant Settings"
					}, {
						"l": "Delete Tenant oAuth Configuration",
						'v': "/settings/tenant/oauth/delete",
						"group": "Tenant Settings"
					}, {
						"l": "Add Tenant oAuth Configuration",
						'v': "/settings/tenant/oauth/add",
						"group": "Tenant Settings"
					}, {
						"l": "Update Tenant oAuth Configuration",
						'v': "/settings/tenant/oauth/update",
						"group": "Tenant Settings"
					}, {
						"l": "List Tenant oAuth Users",
						'v': "/settings/tenant/oauth/users/list",
						"group": "Tenant Settings"
					}, {
						"l": "Delete Tenant oAuth User",
						'v': "/settings/tenant/oauth/users/delete",
						"group": "Tenant Settings"
					}, {
						"l": "Add Tenant oAuth User",
						'v': "/settings/tenant/oauth/users/add",
						"group": "Tenant Settings"
					}, {
						"l": "Update Tenant oAuth User",
						'v': "/settings/tenant/oauth/users/update",
						"group": "Tenant Settings"
					}, {
						"l": "List Tenant Applications",
						'v': "/settings/tenant/application/list",
						"group": "Tenant Settings"
					}, {
						"l": "Add Tenant Application Key",
						'v': "/settings/tenant/application/key/add",
						"group": "Tenant Settings"
					}, {
						"l": "List Tenant Application Keys",
						'v': "/settings/tenant/application/key/list",
						"group": "Tenant Settings"
					}, {
						"l": "Delete Tenant Application Key",
						'v': "/settings/tenant/application/key/delete",
						"group": "Tenant Settings"
					}, {
						"l": "List Tenant Application External Keys",
						'v': "/settings/tenant/application/key/ext/list",
						"group": "Tenant Settings"
					}, {
						"l": "Add Tenant Application External Key",
						'v': "/settings/tenant/application/key/ext/add",
						"group": "Tenant Settings"
					}, {
						"l": "Update Tenant Application External Key",
						'v': "/settings/tenant/application/key/ext/update",
						"group": "Tenant Settings"
					}, {
						"l": "Delete Tenant Application External Key",
						'v': "/settings/tenant/application/key/ext/delete",
						"group": "Tenant Settings"
					}, {
						"l": "List Tenant Application Key Configuration",
						'v': "/settings/tenant/application/key/config/list",
						"group": "Tenant Settings"
					}, {
						"l": "Update Tenant Application Key Configuration",
						'v': "/settings/tenant/application/key/config/update",
						"group": "Tenant Settings"
					}, {
						"l": "List Services",
						'v': "/services/list",
						"group": "Services"
					}, {
						"l": "Update Service",
						'v': "/services/delete",
						"group": "Services"
					}, {
						"l": "List Hosts",
						'v': "/hosts/list",
						"group": "Hosts",
						"groupMain": true
					}, {
						"l": "Delete Hosts",
						'v': "/hosts/delete",
						"group": "Hosts"
					}, {
						"l": "Perform Maintenance Operation",
						'v': "/hosts/maintenanceOperation",
						"group": "Hosts"
					},
					{
						"v": "host/deployController",
						"l": "Deploy New Controller",
						"group": "Hosts"
					},
					{
						'v': "host/deployNginx",
						"l": "Deploy New Nginx",
						"group": "Hosts"
					},
					{
						'v': "host/deployService",
						"l": "Deploy New Service",
						"group": "Hosts"
					},
					
					{
						'v': "/cb/list",
						"l": "List Content Schema",
						"group": "Content Builder",
						"groupMain": true
					},
					{
						'v': "/cb/add",
						"l": "Add New Content Schema",
						"group": "Content Builder"
					},
					{
						'v': "/cb/update",
						"l": "Update Content Schema",
						"group": "Content Builder"
					},
					{
						'v': "/cb/get",
						"l": "Get One Content Schema",
						"group": "Content Builder"
					},
					{
						'v': "/cb/listRevisions",
						"l": "List Content Schema Revisions",
						"group": "Content Builder"
					}
				]
			}
		}
	},
	// {
	// 	"name": "proxy",
	// 	"group": "SOAJS Core Services",
	// 	"port": 4009,
	// 	"requestTimeout": 30,
	// 	"requestTimeoutRenewal": 5,
	// 	"src": {
	// 		"provider": "github",
	// 		"owner": "soajs",
	// 		"repo": "soajs.prx"
	// 	},
	// 	"versions": {
	// 		"1": {
	// 			"extKeyRequired": true,
	// 			"awareness": false,
	// 			"apis": [
	// 				{
	// 					"l":" Redirect",
	// 					"v": "/redirect"
	// 				}
	// 			]
	// 		}
	// 	}
	// },
	{
		"name": "oauth",
		"group": "SOAJS Core Services",
		"port": 4002,
		"swagger": false,
		"requestTimeout": 30,
		"requestTimeoutRenewal": 5,
		"src": {
			"provider": "github",
			"owner": "soajs",
			"repo": "soajs.oauth"
		},
		"versions": {
			"1": {
				"extKeyRequired": true,
				"oauth": true,
				"apis": [
					{
						"l": "Get the authorization value",
						"v": "/authorization",
						"m": "get"
					},
					{
						"l": "Create Token",
						"v": "/token",
						"m": "post"
					},
					{
						"l": "Delete Access Token",
						"v": "/accessToken/:token",
						"m": "delete"
					},
					{
						"l": "Delete Refresh Token",
						"v": "/refreshToken/:token",
						"m": "delete"
					},
					{
						"l": "Delete all Tokens for this User",
						"v": "/tokens/user/:userId",
						"m": "delete"
					},
					{
						"l": "Delete all Tokens for this Client",
						"v": "/tokens/tenant/:clientId",
						"m": "delete"
					}
				],
				"awareness": true
			}
		}
	}
];

module.exports = services;