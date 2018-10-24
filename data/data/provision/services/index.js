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
		"src": {
			"provider": "github",
			"owner": "soajs",
			"repo": "soajs.urac",
			"cmd": [
				"/etc/init.d/postfix start"
			]
		},
		"versions": {
			"2": {
				"extKeyRequired": true,
				"urac": false,
				"urac_Profile": false,
				"urac_ACL": false,
				"provision_ACL": false,
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
						"l": "List Tenants",
						"v": "/tenant/list",
						"m": "get",
						"group": "Tenant"
					},
					{
						"l": "Get user acl info",
						"v": "/tenant/getUserAclInfo",
						"m": "get",
						"group": "Tenant"
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
				]
			}
		}
	},
	{
		"name": "dashboard",
		"group": "SOAJS Core Services",
		"port": 4003,
		"requestTimeout": 60,
		"requestTimeoutRenewal": 5,
		"src": {
			"provider": "github",
			"owner": "soajs",
			"repo": "soajs.dashboard"
		},
		"versions": {
			"1": {
				"extKeyRequired": true,
				"urac": true,
				"urac_Profile": true,
				"urac_ACL": true,
				"provision_ACL": true,
				"oauth": true,
				"apis": [
					{
						"l": "Lists the ledgers of a specific environment",
						"v": "/cd/ledger",
						"m": "get",
						"group": "Continuous Delivery"
					},
					{
						"l": "Get Environment",
						"v": "/environment",
						"m": "get",
						"group": "Environment"
					},
					{
						"l": "Get Templates",
						"v": "/templates",
						"m": "get",
						"group": "Templates"
					},
					{
						"l": "Upgrade Old Templates",
						"v": "/templates/upgrade",
						"m": "get",
						"group": "Templates"
					},
					{
						"l": "Get/Set Environment Deployment Status",
						"v": "/environment/status",
						"m": "get",
						"group": "Environment"
					},
					{
						"l": "List Environments",
						"v": "/environment/list",
						"m": "get",
						"group": "Environment",
						"groupMain": true
					},
					{
						"l": "Get Profile",
						"v": "/environment/profile",
						"m": "get",
						"group": "Environment"
					},
					{
						"l": "List Environment Databases",
						"v": "/environment/dbs/list",
						"m": "get",
						"group": "Environment Databases"
					},
					{
						"l": "List Available Resources",
						"v": "/resources",
						"m": "get",
						"group": "Resources",
						"groupMain": true
					},
					{
						"l": "Get One Resource",
						"v": "/resources/get",
						"m": "get",
						"group": "Resources"
					},
					{
						"l": "Upgrade Resources to latest version",
						"v": "/resources/upgrade",
						"m": "get",
						"group": "Resources",
						"groupMain": true
					},
					{
						"l": "Get Resources Deploy Configuration",
						"v": "/resources/config",
						"m": "get",
						"group": "Resources"
					},
					{
						"l": "List Custom Registry Entries",
						"v": "/customRegistry/list",
						"m": "get",
						"group": "Custom Registry",
						"groupMain": true
					},
					{
						"l": "Get Custom Registry Entry",
						"v": "/customRegistry/get",
						"m": "get",
						"group": "Custom Registry"
					},
					{
						"l": "List Environment Platforms",
						"v": "/environment/platforms/list",
						"m": "get",
						"group": "Environment Platforms"
					},
					{
						"l": "List Products",
						"v": "/product/list",
						"m": "get",
						"group": "Product",
						"groupMain": true
					},
					{
						"l": "Get Product",
						"v": "/product/get",
						"m": "get",
						"group": "Product"
					},
					{
						"l": "List Product Packages",
						"v": "/product/packages/list",
						"m": "get",
						"group": "Product"
					},
					{
						"l": "Get Product Package",
						"v": "/product/packages/get",
						"m": "get",
						"group": "Product"
					},
					{
						"l": "Get Tenant Security Permissions",
						"v": "/permissions/get",
						"m": "get",
						"group": "Tenant"
					},
					{
						"l": "List Tenants",
						"v": "/tenant/list",
						"m": "get",
						"group": "Tenant"
					},
					{
						"l": "Get Tenant",
						"v": "/tenant/get",
						"m": "get",
						"group": "Tenant"
					},
					{
						"l": "Get Tenant oAuth Configuration",
						"v": "/tenant/oauth/list",
						"m": "get",
						"group": "Tenant oAuth"
					},
					{
						"l": "List Tenant oAuth Users",
						"v": "/tenant/oauth/users/list",
						"m": "get",
						"group": "Tenant oAuth"
					},
					{
						"l": "List Tenant Applications",
						"v": "/tenant/application/list",
						"m": "get",
						"group": "Tenant Application"
					},
					{
						"l": "List Tenant Application Keys",
						"v": "/tenant/application/key/list",
						"m": "get",
						"group": "Tenant Application"
					},
					{
						"l": "List Tenant Application External Keys",
						"v": "/tenant/application/key/ext/list",
						"m": "get",
						"group": "Tenant Application"
					},
					{
						"l": "List Tenant Application Key Configuration",
						"v": "/tenant/application/key/config/list",
						"m": "get",
						"group": "Tenant Application"
					},
					{
						"l": "List Dashboard Tenant Keys",
						"v": "/tenant/db/keys/list",
						"m": "get",
						"group": "Dashboard Tenants"
					},
					{
						"l": "Get Tenant",
						"v": "/settings/tenant/get",
						"m": "get",
						"group": "Tenant Settings"
					},
					{
						"l": "Get Tenant oAuth Configuration",
						"v": "/settings/tenant/oauth/list",
						"m": "get",
						"group": "Tenant Settings"
					},
					{
						"l": "List Tenant oAuth Users",
						"v": "/settings/tenant/oauth/users/list",
						"m": "get",
						"group": "Tenant Settings"
					},
					{
						"l": "List Tenant Applications",
						"v": "/settings/tenant/application/list",
						"m": "get",
						"group": "Tenant Settings"
					},
					{
						"l": "List Tenant Application Keys",
						"v": "/settings/tenant/application/key/list",
						"m": "get",
						"group": "Tenant Settings"
					},
					{
						"l": "List Tenant Application External Keys",
						"v": "/settings/tenant/application/key/ext/list",
						"m": "get",
						"group": "Tenant Settings"
					},
					{
						"l": "List Tenant Application Key Configuration",
						"v": "/settings/tenant/application/key/config/list",
						"m": "get",
						"group": "Tenant Settings"
					},
					{
						"l": "List The Environment Where A Service Is Deployed",
						"v": "/services/env/list",
						"m": "get",
						"group": "Services"
					},
					{
						"l": "List Service Configuration",
						"v": "/daemons/groupConfig/serviceConfig/list",
						"m": "get",
						"group": "Daemons"
					},
					{
						"l": "List Job's External Keys",
						"v": "/daemons/groupConfig/tenantExtKeys/list",
						"m": "get",
						"group": "Daemons"
					},
					{
						"l": "List Hosts",
						"v": "/hosts/list",
						"m": "get",
						"group": "Hosts",
						"groupMain": true
					},
					{
						"l": "Get Controller Hosts",
						"v": "/hosts/awareness",
						"m": "get",
						"group": "Hosts"
					},
					{
						"l": "List Cloud Services",
						"v": "/cloud/services/list",
						"m": "get",
						"group": "HA Cloud"
					},
					{
						"l": "List HA Cloud Nodes",
						"v": "/cloud/nodes/list",
						"m": "get",
						"group": "HA Cloud"
					},
					{
						"l": "Get Service Container Logs",
						"v": "/cloud/services/instances/logs",
						"m": "get",
						"group": "HA Cloud"
					},
					{
						"l": "List Available Namespaces",
						"v": "/cloud/namespaces/list",
						"m": "get",
						"group": "HA Cloud"
					},
					{
						"l": "Check if resource is Deployed",
						"v": "/cloud/resource",
						"m": "get",
						"group": "HA Cloud"
					},
					{
						"l": "List Cloud Virtual Machines",
						"v": "/cloud/vm/list",
						"m": "get",
						"group": "Services"
					},
					{
						"l": "List Cloud Virtual Machines",
						"v": "/cloud/vm/layer/status",
						"m": "get",
						"group": "Services"
					},
					{
						"l": "List Services Metrics",
						"v": "/cloud/metrics/services",
						"m": "get",
						"group": "HA Cloud"
					},
					{
						"l": "List Nodes Metrics",
						"v": "/cloud/metrics/nodes",
						"m": "get",
						"group": "HA Cloud"
					},
					{
						"l": "List Catalog Recipes",
						"v": "/catalog/recipes/list",
						"m": "get",
						"group": "Catalog"
					},
					{
						"l": "Get a Catalog",
						"v": "/catalog/recipes/get",
						"m": "get",
						"group": "Catalog"
					},
					{
						"l": "Upgrade Catalog Recipes to latest Version",
						"v": "/catalog/recipes/upgrade",
						"m": "get",
						"group": "Catalog"
					},
					{
						"l": "Get CD Configuration",
						"v": "/cd",
						"m": "get",
						"group": "Continuous Delivery"
					},
					{
						"l": "Get Update Notification Ledger",
						"v": "/cd/updates",
						"m": "get",
						"group": "Continuous Delivery"
					},
					{
						"l": "Get CI Accounts",
						"v": "/ci",
						"m": "get",
						"group": "Continuous Integration"
					},
					{
						"l": "Get CI Providers",
						"v": "/ci/providers",
						"m": "get",
						"group": "Continuous Integration"
					},
					{
						"l": "Download CI Recipe",
						"v": "/ci/recipe/download",
						"m": "get",
						"group": "Continuous Integration"
					},
					{
						"l": "Download CI Script",
						"v": "/ci/script/download",
						"m": "get",
						"group": "Continuous Integration"
					},
					{
						"l": "Turn On/Off Repository CI",
						"v": "/ci/status",
						"m": "get",
						"group": "Continuous Integration"
					},
					{
						"l": "Get CI Repository Settings & Environment Variables",
						"v": "/ci/settings",
						"m": "get",
						"group": "Continuous Integration"
					},
					{
						"l": "Get the CI configuration file of the repository from provider",
						"v": "/ci/repo/remote/config",
						"m": "get",
						"group": "Continuous Integration"
					},
					{
						"l": "Get the CI Latest Repository Build Per Branch",
						"v": "/ci/repo/builds",
						"m": "get",
						"group": "Continuous Integration"
					},
					{
						"l": "List Git Accounts",
						"v": "/gitAccounts/accounts/list",
						"m": "get",
						"group": "Git Accounts"
					},
					{
						"l": "Get Repositories",
						"v": "/gitAccounts/getRepos",
						"m": "get",
						"group": "Git Accounts"
					},
					{
						"l": "Get Repository Branches",
						"v": "/gitAccounts/getBranches",
						"m": "get",
						"group": "Git Accounts"
					},
					{
						"l": "Get Yaml file",
						"v": "/gitAccounts/getYaml",
						"m": "get",
						"group": "Git Accounts"
					},
					{
						"l": "List Endpoints",
						"v": "/apiBuilder/list",
						"m": "get",
						"group": "API Builder"
					},
					{
						"l": "Get Endpoint",
						"v": "/apiBuilder/get",
						"m": "get",
						"group": "API Builder"
					},
					{
						"l": "Publish endpoint apis",
						"v": "/apiBuilder/publish",
						"m": "get",
						"group": "API Builder"
					},
					{
						"l": "Get Resources",
						"v": "/apiBuilder/getResources",
						"m": "get",
						"group": "API Builder"
					},
					{
						"l": "List Available Secrets",
						"v": "/secrets/list",
						"m": "get",
						"group": "Secrets"
					},
					{
						"l": "Get One Secret",
						"v": "/secrets/get",
						"m": "get",
						"group": "Secrets"
					},
					{
						"l": "Get Infra Provider",
						"v": "/infra",
						"m": "get",
						"group": "Infra Providers"
					},
					{
						"l": "Get Cluster From Infra Provider",
						"v": "/infra/cluster",
						"m": "get",
						"group": "Infra Providers"
					},
					{
						"l": "Download Infra as Code Template",
						"v": "/infra/template/download",
						"m": "get",
						"group": "Infra Providers"
					},
					{
						"l": "Get Extra Compnents From An Infra Provider",
						"v": "/infra/extras",
						"m": "get",
						"group": "Infra Providers"
					},
					{
						"l": "Import Templates",
						"v": "/templates/import",
						"m": "post",
						"group": "Templates"
					},
					{
						"l": "Export Templates",
						"v": "/templates/export",
						"m": "post",
						"group": "Templates"
					},
					{
						"l": "List Services",
						"v": "/services/list",
						"m": "post",
						"group": "Services"
					},
					{
						"l": "Add Environment",
						"v": "/environment/add",
						"m": "post",
						"group": "Environment"
					},
					{
						"l": "Add Environment Database",
						"v": "/environment/dbs/add",
						"m": "post",
						"group": "Environment Databases"
					},
					{
						"l": "Attach Container Technology",
						"v": "/environment/platforms/attach",
						"m": "post",
						"group": "Environment Platforms"
					},
					{
						"l": "Add / Edit Resource",
						"v": "/resources",
						"m": "post",
						"group": "Resources"
					},
					{
						"l": "Add New Custom Registry Entry",
						"v": "/customRegistry/add",
						"m": "post",
						"group": "Custom Registry"
					},
					{
						"l": "Add Product",
						"v": "/product/add",
						"m": "post",
						"group": "Product"
					},
					{
						"l": "Add Product Package",
						"v": "/product/packages/add",
						"m": "post",
						"group": "Product"
					},
					{
						"l": "Add Tenant",
						"v": "/tenant/add",
						"m": "post",
						"group": "Tenant"
					},
					{
						"l": "Add Tenant oAuth Configuration",
						"v": "/tenant/oauth/add",
						"m": "post",
						"group": "Tenant oAuth"
					},
					{
						"l": "Add Tenant oAuth User",
						"v": "/tenant/oauth/users/add",
						"m": "post",
						"group": "Tenant oAuth"
					},
					{
						"l": "Add Tenant Application",
						"v": "/tenant/application/add",
						"m": "post",
						"group": "Tenant Application"
					},
					{
						"l": "Add Tenant Application Key",
						"v": "/tenant/application/key/add",
						"m": "post",
						"group": "Tenant Application"
					},
					{
						"l": "Add Tenant Application External Key",
						"v": "/tenant/application/key/ext/add",
						"m": "post",
						"group": "Tenant Application"
					},
					{
						"l": "Delete Tenant Application External Key",
						"v": "/tenant/application/key/ext/delete",
						"m": "post",
						"group": "Tenant Application"
					},
					{
						"l": "Get Current Tenant Access Level",
						"v": "/tenant/acl/get",
						"m": "post",
						"group": "Tenant"
					},
					{
						"l": "Add Tenant oAuth Configuration",
						"v": "/settings/tenant/oauth/add",
						"m": "post",
						"group": "Tenant Settings"
					},
					{
						"l": "Add Tenant oAuth User",
						"v": "/settings/tenant/oauth/users/add",
						"m": "post",
						"group": "Tenant Settings"
					},
					{
						"l": "Add Tenant Application Key",
						"v": "/settings/tenant/application/key/add",
						"m": "post",
						"group": "Tenant Settings"
					},
					{
						"l": "Add Tenant Application External Key",
						"v": "/settings/tenant/application/key/ext/add",
						"m": "post",
						"group": "Tenant Settings"
					},
					{
						"l": "Delete Tenant Application External Key",
						"v": "/settings/tenant/application/key/ext/delete",
						"m": "post",
						"group": "Tenant Settings"
					},
					{
						"l": "List Daemon Group Configuration",
						"v": "/daemons/groupConfig/list",
						"m": "post",
						"group": "Daemons"
					},
					{
						"l": "Add Daemon Group Configuration",
						"v": "/daemons/groupConfig/add",
						"m": "post",
						"group": "Daemons"
					},
					{
						"l": "List Daemons",
						"v": "/daemons/list",
						"m": "post",
						"group": "Daemons"
					},
					{
						"l": "Deploy A New SOAJS Service",
						"v": "/cloud/services/soajs/deploy",
						"m": "post",
						"group": "HA Cloud"
					},
					{
						"l": "Deploy A Custom Resource",
						"v": "/cloud/plugins/deploy",
						"m": "post",
						"group": "HA Cloud"
					},
					{
						"l": "Add HA Cloud Node",
						"v": "/cloud/nodes/add",
						"m": "post",
						"group": "HA Cloud"
					},
					{
						"l": "Perform A Maintenance Operation on a Deployed Service",
						"v": "/cloud/services/maintenance",
						"m": "post",
						"group": "HA Cloud"
					},
					{
						"l": "Perform A Maintenance Operation on a Virtual Machine",
						"v": "/cloud/vm/maintenance",
						"m": "post",
						"group": "HA Cloud"
					},
					{
						"l": "Add Virtual Machine Layer",
						"v": "/cloud/vm",
						"m": "post",
						"group": "HA Cloud"
					},
					{
						"l": "On-board Virtual Machine Layer",
						"v": "/cloud/vm/onboard",
						"m": "post",
						"group": "HA Cloud"
					},
					{
						"l": "Get Service Container Logs",
						"v": "/cloud/vm/logs",
						"m": "post",
						"group": "HA Cloud"
					},
					{
						"l": "Add New Catalog",
						"v": "/catalog/recipes/add",
						"m": "post",
						"group": "Catalog"
					},
					{
						"l": "Activate CI Provider",
						"v": "/ci/provider",
						"m": "post",
						"group": "Continuous Integration"
					},
					{
						"l": "Add New CI Recipe",
						"v": "/ci/recipe",
						"m": "post",
						"group": "Continuous Integration"
					},
					{
						"l": "Save CD Configuration for a specific Service",
						"v": "/cd",
						"m": "post",
						"group": "Continuous Delivery"
					},
					{
						"l": "Pause CD Configuration",
						"v": "/cd/pause",
						"m": "post",
						"group": "Continuous Delivery"
					},
					{
						"l": "Trigger CD Deployment",
						"v": "/cd/deploy",
						"m": "post",
						"group": "Continuous Delivery"
					},
					{
						"l": "Github Login",
						"v": "/gitAccounts/login",
						"m": "post",
						"group": "Git Accounts"
					},
					{
						"l": "Activate Repository",
						"v": "/gitAccounts/repo/activate",
						"m": "post",
						"group": "Git Accounts"
					},
					{
						"l": "Api simulation service",
						"v": "/swagger/simulate",
						"m": "post",
						"group": "Simulate",
						"groupMain": true
					},
					{
						"l": "Generate Service via Swagger",
						"v": "/swagger/generate",
						"m": "post",
						"group": "swagger",
						"groupMain": true
					},
					{
						"l": "Regenerate Service via Swagger",
						"v": "/swagger/generateExistingService",
						"m": "post",
						"group": "swagger",
						"groupMain": true
					},
					{
						"l": "Add Endpoint",
						"v": "/apiBuilder/add",
						"m": "post",
						"group": "API Builder"
					},
					{
						"l": "Update Route Authentication Method",
						"v": "/apiBuilder/authentication/update",
						"m": "post",
						"group": "API Builder"
					},
					{
						"l": "Convert Swagger String To an IMFV Soajs Object",
						"v": "/apiBuilder/convertSwaggerToImfv",
						"m": "post",
						"group": "API Builder"
					},
					{
						"l": "Convert IMFV Soajs Object to a Swagger String",
						"v": "/apiBuilder/convertImfvToSwagger",
						"m": "post",
						"group": "API Builder"
					},
					{
						"l": "Add Secret",
						"v": "/secrets/add",
						"m": "post",
						"group": "Secrets"
					},
					{
						"l": "Connect Infra Providers",
						"v": "/infra",
						"m": "post",
						"group": "Infra Providers"
					},
					{
						"l": "Add Infra as Code Template",
						"v": "/infra/template",
						"m": "post",
						"group": "Infra Providers"
					},
					{
						"l": "Update Infra as Code Template",
						"v": "/infra/template/upload",
						"m": "post",
						"group": "Infra Providers"
					},
					{
						"l": "Scale Cluster at Infra Provider",
						"v": "/infra/cluster/scale",
						"m": "post",
						"group": "Infra Providers"
					},
					{
						"l": "Create Infra component",
						"v": "/infra/extras",
						"m": "post",
						"group": "HA Cloud"
					},
					{
						"l": "Updates Service Settings",
						"v": "/services/settings/update",
						"m": "put",
						"group": "Services"
					},
					{
						"l": "Mark as read",
						"v": "/cd/ledger/read",
						"m": "put",
						"group": "Continuous Delivery"
					},
					{
						"l": "Take Action",
						"v": "/cd/action",
						"m": "put",
						"group": "Continuous Delivery"
					},
					{
						"l": "Update Environment",
						"v": "/environment/update",
						"m": "put",
						"group": "Environment"
					},
					{
						"l": "Update Environment Tenant Key Security",
						"v": "/environment/key/update",
						"m": "put",
						"group": "Environment"
					},
					{
						"l": "Update Environment Database",
						"v": "/environment/dbs/update",
						"m": "put",
						"group": "Environment Databases"
					},
					{
						"l": "Update Environment Databases Prefix",
						"v": "/environment/dbs/updatePrefix",
						"m": "put",
						"group": "Environment Databases"
					},
					{
						"l": "Update Resource",
						"v": "/resources/update",
						"m": "put",
						"group": "Resources"
					},
					{
						"l": "Set Resource Deploy Configuration",
						"v": "/resources/config/update",
						"m": "put",
						"group": "Resources"
					},
					{
						"l": "Update Custom Registry Entry",
						"v": "/customRegistry/update",
						"m": "put",
						"group": "Custom Registry"
					},
					{
						"l": "Upgrade To New Custom Registry",
						"v": "/customRegistry/upgrade",
						"m": "put",
						"group": "Custom Registry"
					},
					{
						"l": "Change Deployer Type",
						"v": "/environment/platforms/deployer/update",
						"m": "put",
						"group": "Environment Platforms"
					},
					{
						"l": "Update Product",
						"v": "/product/update",
						"m": "put",
						"group": "Product"
					},
					{
						"l": "Update Product Package",
						"v": "/product/packages/update",
						"m": "put",
						"group": "Product"
					},
					{
						"l": "Update Tenant",
						"v": "/tenant/update",
						"m": "put",
						"group": "Tenant"
					},
					{
						"l": "Update Tenant oAuth Configuration",
						"v": "/tenant/oauth/update",
						"m": "put",
						"group": "Tenant oAuth"
					},
					{
						"l": "Update Tenant oAuth User",
						"v": "/tenant/oauth/users/update",
						"m": "put",
						"group": "Tenant oAuth"
					},
					{
						"l": "Update Tenant Application",
						"v": "/tenant/application/update",
						"m": "put",
						"group": "Tenant Application"
					},
					{
						"l": "Update Tenant Application External Key",
						"v": "/tenant/application/key/ext/update",
						"m": "put",
						"group": "Tenant Application"
					},
					{
						"l": "Update Tenant Application Key Configuration",
						"v": "/tenant/application/key/config/update",
						"m": "put",
						"group": "Tenant Application"
					},
					{
						"l": "Update Tenant",
						"v": "/settings/tenant/update",
						"m": "put",
						"group": "Tenant Settings"
					},
					{
						"l": "Update Tenant oAuth Configuration",
						"v": "/settings/tenant/oauth/update",
						"m": "put",
						"group": "Tenant Settings"
					},
					{
						"l": "Update Tenant oAuth User",
						"v": "/settings/tenant/oauth/users/update",
						"m": "put",
						"group": "Tenant Settings"
					},
					{
						"l": "Update Tenant Application External Key",
						"v": "/settings/tenant/application/key/ext/update",
						"m": "put",
						"group": "Tenant Settings"
					},
					{
						"l": "Update Tenant Application Key Configuration",
						"v": "/settings/tenant/application/key/config/update",
						"m": "put",
						"group": "Tenant Settings"
					},
					{
						"l": "Update Daemon Group Configuration",
						"v": "/daemons/groupConfig/update",
						"m": "put",
						"group": "Daemons"
					},
					{
						"l": "Update Service Configuration",
						"v": "/daemons/groupConfig/serviceConfig/update",
						"m": "put",
						"group": "Daemons"
					},
					{
						"l": "Update Job's External Keys",
						"v": "/daemons/groupConfig/tenantExtKeys/update",
						"m": "put",
						"group": "Daemons"
					},
					{
						"l": "Update HA Cloud Node",
						"v": "/cloud/nodes/update",
						"m": "put",
						"group": "HA Cloud"
					},
					{
						"l": "Scale HA Service",
						"v": "/cloud/services/scale",
						"m": "put",
						"group": "HA Cloud"
					},
					{
						"l": "Redeploy HA Service",
						"v": "/cloud/services/redeploy",
						"m": "put",
						"group": "HA Cloud"
					},
					{
						"l": "Autoscale Services",
						"v": "/cloud/services/autoscale",
						"m": "put",
						"group": "HA Cloud"
					},
					{
						"l": "Configure Environment Autoscaling",
						"v": "/cloud/services/autoscale/config",
						"m": "put",
						"group": "HA Cloud"
					},
					{
						"l": "Update Catalog",
						"v": "/catalog/recipes/update",
						"m": "put",
						"group": "Catalog"
					},
					{
						"l": "Deactivate Repository",
						"v": "/gitAccounts/repo/sync",
						"m": "put",
						"group": "Git Accounts"
					},
					{
						"l": "Deactivate CI Provider",
						"v": "/ci/provider",
						"m": "put",
						"group": "Continuous Integration"
					},
					{
						"l": "Edit CI Recipe",
						"v": "/ci/recipe",
						"m": "put",
						"group": "Continuous Integration"
					},
					{
						"l": "Update CI Repository Settings",
						"v": "/ci/settings",
						"m": "put",
						"group": "Continuous Integration"
					},
					{
						"l": "Deactivate Repository",
						"v": "/gitAccounts/repo/deactivate",
						"m": "put",
						"group": "Git Accounts"
					},
					{
						"l": "Edit Endpoint",
						"v": "/apiBuilder/edit",
						"m": "put",
						"group": "API Builder"
					},
					{
						"l": "Update Endpoint's Schemas",
						"v": "/apiBuilder/updateSchemas",
						"m": "put",
						"group": "API Builder"
					},
					{
						"l": "Modify Infra Providers Connection",
						"v": "/infra",
						"m": "put",
						"group": "Infra Providers"
					},
					{
						"l": "Update Infra as Code Template",
						"v": "/infra/template",
						"m": "put",
						"group": "Infra Providers"
					},
					{
						"l": "Modify Virtual Machine Layer",
						"v": "/cloud/vm",
						"m": "put",
						"group": "HA Cloud"
					},
					{
						"l": "Create Infra component",
						"v": "/infra/extras",
						"m": "put",
						"group": "HA Cloud"
					},
					{
						"l": "Delete Template",
						"v": "/templates",
						"m": "delete",
						"group": "Templates"
					},
					{
						"l": "Delete Environment",
						"v": "/environment/delete",
						"m": "delete",
						"group": "Environment"
					},
					{
						"l": "Delete Environment Database",
						"v": "/environment/dbs/delete",
						"m": "delete",
						"group": "Environment Databases"
					},
					{
						"l": "Detach Container Technology",
						"v": "/environment/platforms/detach",
						"m": "delete",
						"group": "Environment Platforms"
					},
					{
						"l": "Delete a resource",
						"v": "/resources",
						"m": "delete",
						"group": "Resources"
					},
					{
						"l": "Delete A Custom Registry Entry",
						"v": "/customRegistry/delete",
						"m": "delete",
						"group": "Custom Registry"
					},
					{
						"l": "Delete Product",
						"v": "/product/delete",
						"m": "delete",
						"group": "Product"
					},
					{
						"l": "Delete Product Package",
						"v": "/product/packages/delete",
						"m": "delete",
						"group": "Product"
					},
					{
						"l": "Delete Tenant",
						"v": "/tenant/delete",
						"m": "delete",
						"group": "Tenant"
					},
					{
						"l": "Delete Tenant oAuth Configuration",
						"v": "/tenant/oauth/delete",
						"m": "delete",
						"group": "Tenant oAuth"
					},
					{
						"l": "Delete Tenant oAuth User",
						"v": "/tenant/oauth/users/delete",
						"m": "delete",
						"group": "Tenant oAuth"
					},
					{
						"l": "Delete Tenant Application",
						"v": "/tenant/application/delete",
						"m": "delete",
						"group": "Tenant Application"
					},
					{
						"l": "Delete Tenant Application Key",
						"v": "/tenant/application/key/delete",
						"m": "delete",
						"group": "Tenant Application"
					},
					{
						"l": "Delete Tenant oAuth Configuration",
						"v": "/settings/tenant/oauth/delete",
						"m": "delete",
						"group": "Tenant Settings"
					},
					{
						"l": "Delete Tenant oAuth User",
						"v": "/settings/tenant/oauth/users/delete",
						"m": "delete",
						"group": "Tenant Settings"
					},
					{
						"l": "Delete Tenant Application Key",
						"v": "/settings/tenant/application/key/delete",
						"m": "delete",
						"group": "Tenant Settings"
					},
					{
						"l": "Delete Daemon Group Configuration",
						"v": "/daemons/groupConfig/delete",
						"m": "delete",
						"group": "Daemons"
					},
					{
						"l": "Remove HA Cloud Node",
						"v": "/cloud/nodes/remove",
						"m": "delete",
						"group": "HA Cloud"
					},
					{
						"l": "Delete HA Service",
						"v": "/cloud/services/delete",
						"m": "delete",
						"group": "HA Cloud"
					},
					{
						"l": "Delete Virtual Machine",
						"v": "/cloud/vm/instance",
						"m": "delete",
						"group": "HA Cloud"
					},
					{
						"l": "Delete Virtual Machine Layer",
						"v": "/cloud/vm",
						"m": "delete",
						"group": "HA Cloud"
					},
					{
						"l": "Delete a Namespace",
						"v": "/cloud/namespaces/delete",
						"m": "delete",
						"group": "HA Cloud"
					},
					{
						"l": "Delete a Catalog",
						"v": "/catalog/recipes/delete",
						"m": "delete",
						"group": "Catalog"
					},
					{
						"l": "Delete CI Recipe",
						"v": "/ci/recipe",
						"m": "delete",
						"group": "Continuous Integration"
					},
					{
						"l": "Github Logout",
						"v": "/gitAccounts/logout",
						"m": "delete",
						"group": "Git Accounts"
					},
					{
						"l": "Delete Endpoint",
						"v": "/apiBuilder/delete",
						"m": "delete",
						"group": "API Builder"
					},
					{
						"l": "Delete Secret",
						"v": "/secrets/delete",
						"m": "delete",
						"group": "Secrets"
					},
					{
						"l": "Deactivate Infra Providers",
						"v": "/infra",
						"m": "delete",
						"group": "Infra Providers"
					},
					{
						"l": "Deactivate Infra Providers",
						"v": "/infra/deployment",
						"m": "delete",
						"group": "Infra Providers"
					},
					{
						"l": "Remove Template from Infra Providers",
						"v": "/infra/template",
						"m": "delete",
						"group": "Infra Providers"
					},
					{
						"l": "Create Infra component",
						"v": "/infra/extras",
						"m": "delete",
						"group": "HA Cloud"
					}
				]
			}
		}
	},
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
				"urac": false,
				"urac_Profile": false,
				"urac_ACL": false,
				"provision_ACL": false,
				"oauth": true,
				"awareness": true,
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
				]
			}
		}
	}
];

module.exports = services;