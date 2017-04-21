/**
 * Created by Nicolas on 12/7/16.
 */
/***************************************************************
 *
 * DASHBOARD CORE_PROVISION
 *
 ***************************************************************/
var soajsModules = require("soajs.core.modules");
var async = require("async");

var dataFolder = process.env.SOAJS_DATA_FOLDER;
delete require.cache[process.env.SOAJS_PROFILE];
var profile = require(process.env.SOAJS_PROFILE);

profile.name = "core_provision";
var mongo = new soajsModules.mongo(profile);
var fs= require("fs");

mongo.dropDatabase(function () {
	console.log("1")
	lib.addEnvs(function () {
		lib.addProducts(function () {
			lib.addServices(function () {
				lib.addTenants(function () {
					lib.addAnalytics(function (errAnalytics) {
						if (errAnalytics) {
							throw new Error("Error while importing analytics \n" + errAnalytics);
						}
						lib.addGitAccounts(function () {
							mongo.closeDb();
							profile.name = "DBTN_urac";
							mongo = new soajsModules.mongo(profile);
							mongo.dropDatabase(function () {
								lib.addUsers(function () {
									lib.addGroups(function () {
										lib.uracIndex(function () {
											mongo.closeDb();
										});
									});
								});
							});
						});
					});
				});
			});
		});
	});
});

var lib = {
	/*
	 Environments
	 */
	"addEnvs": function (cb) {
		var record = require(dataFolder + "environments/dashboard.js");
		record._id = mongo.ObjectId(record._id);
		mongo.insert("environment", record, cb);
	},

	/*
	 Products
	 */
	"addProducts": function (cb) {
		var record = require(dataFolder + "products/dsbrd.js");
		record._id = mongo.ObjectId(record._id);
		mongo.insert("products", record, cb);
	},

	/*
	 Services
	 */
	"addServices": function (cb) {
		var record = require(dataFolder + "services/index.js");
		mongo.insert("services", record, cb);
	},

	/*
	 Tenants
	 */
	"addTenants": function (cb) {
		var record = require(dataFolder + "tenants/owner.js");

		record._id = mongo.ObjectId(record._id);
		record.applications.forEach(function (oneApp) {
			oneApp.appId = mongo.ObjectId(oneApp.appId);
		});

		mongo.insert("tenants", record, cb);
	},

	/*
	 Git Accounts
	 */
	"addGitAccounts": function (cb) {
		var record = require(dataFolder + "gitAccounts/soajsRepos.js");
		record._id = mongo.ObjectId(record._id);
		mongo.insert("git_accounts", record, cb);
	},
	
	/*
	 Analytics
	 */
	"addAnalytics": function (cb) {
		
		var records = [];
		fs.readdir(dataFolder + "analytics", function(err, items) {
			
			async.forEachOf(items, function (item, key, callback) {
				if (key === 0) {
					records = require(dataFolder + "analytics/" + items[key]);
				}
				else {
					var array = require(dataFolder + "analytics/" + item);
					if (Array.isArray(array) && array.length > 0){
						records = records.concat(array);
					}
				}
				callback();
			}, function () {
				mongo.insert("analytics", records, cb);
			});
		});
		
		
	},
	/***************************************************************
	 *
	 * DASHBOARD URAC
	 *
	 ***************************************************************/
	/*
	 Users
	 */
	"addUsers": function (cb) {
		var record = require(dataFolder + "urac/users/owner.js");
		mongo.insert("users", record, cb);
	},

	/*
	 Groups
	 */
	"addGroups": function (cb) {
		var record = require(dataFolder + "urac/groups/owner.js");
		mongo.insert("groups", record, cb);
	},

	"errorLogger": function (error) {
		if (error) {
			return console.log(error);
		}
	},

	"uracIndex": function (cb) {
		var indexes = [
			{
				col: 'users',
				index: {username: 1},
				options: {unique: true}
			},
			{
				col: 'users',
				index: {email: 1},
				options: {unique: true}
			},
			{
				col: 'users',
				index: {username: 1, status: 1},
				options: null
			},
			{
				col: 'users',
				index: {email: 1, status: 1},
				options: null
			},
			{
				col: 'users',
				index: {groups: 1, 'tenant.id': 1},
				options: null
			},
			{
				col: 'users',
				index: {username: 1, 'tenant.id': 1},
				options: null
			},
			{
				col: 'users',
				index: {status: 1},
				options: null
			},
			{
				col: 'users',
				index: {locked: 1},
				options: null
			},
			{
				col: 'users',
				index: {'tenant.id': 1},
				options: null
			},
			{
				col: 'groups',
				index: {code: 1, 'tenant.id': 1},
				options: null
			},
			{
				col: 'groups',
				index: {code: 1},
				options: null
			},
			{
				col: 'groups',
				index: {'tenant.id': 1},
				options: null
			},
			{
				col: 'groups',
				index: {locked: 1},
				options: null
			},
			{
				col: 'tokens',
				index: {token: 1},
				options: {unique: true}
			},
			{
				col: 'tokens',
				index: {userId: 1, service: 1, status: 1},
				options: null
			},
			{
				col: 'tokens',
				index: {token: 1, service: 1, status: 1},
				options: null
			}
		];

		async.each(indexes, function (oneIndex, callback) {
			mongo.ensureIndex(oneIndex.col, oneIndex.index, oneIndex.options, function (error) {
				lib.errorLogger(error);
				return callback();
			});
		}, cb);
	}
};
