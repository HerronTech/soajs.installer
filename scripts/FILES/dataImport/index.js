/***************************************************************
 *
 * DASHBOARD CORE_PROVISION
 *
 ***************************************************************/
var soajs = require("soajs");
var async = require("async");

const dataFolder = process.env.SOAJS_DATA_FOLDER;
delete require.cache[process.env.SOAJS_PROFILE];
const profile = require(process.env.SOAJS_PROFILE);

profile.name = "core_provision";
if (!process.env.MONGO_EXT || process.env.MONGO_EXT === 'false') {
	profile.servers[0].port = parseInt(process.env.MONGO_PORT) || 27017;
}

var mongo = new soajs.mongo(profile);

mongo.dropDatabase(function () {
	lib.addEnvs(function () {
		lib.addProducts(function () {
			lib.addServices(function () {
				lib.addTenants(function () {
					lib.addGitAccounts(function () {
						lib.addCatalogs(function () {
							lib.addInfraRecord(function () {
								mongo.closeDb();
								profile.name = "DBTN_urac";
								mongo = new soajs.mongo(profile);
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
});

const lib = {
	/*
	 Environments
	 */
	"addEnvs": function (cb) {
		async.parallel({
			"env": function (mCb) {
				var record = require(dataFolder + "environments/dashboard.js");
				record._id = mongo.ObjectId(record._id);
				mongo.insert("environment", record, mCb);
			},
			"mongo": function (mCb) {
				var record = require(dataFolder + "resources/mongo.js");
				record._id = mongo.ObjectId(record._id);
				mongo.insert("resources", record, mCb);
			},
			"templates": function (mCb) {
				var templates = require(dataFolder + "environments/templates.js");
				mongo.insert("templates", templates, mCb);
			}
		}, cb);
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
		async.series([
			function (mCb) {
				var record = require(dataFolder + "tenants/owner.js");
				
				record._id = mongo.ObjectId(record._id);
				record.applications.forEach(function (oneApp) {
					oneApp.appId = mongo.ObjectId(oneApp.appId);
				});
				
				mongo.insert("tenants", record, mCb);
			},
			function (mCb) {
				var record = require(dataFolder + "tenants/techop.js");
				
				record._id = mongo.ObjectId(record._id);
				record.applications.forEach(function (oneApp) {
					oneApp.appId = mongo.ObjectId(oneApp.appId);
				});
				
				mongo.insert("tenants", record, mCb);
			},
		], cb);
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
	 Catalogs
	 */
	"addCatalogs": function (cb) {
		var options =
			{
				col: 'catalogs',
				index: {name: 1},
				options: {unique: true}
			};
		
		mongo.createIndex(options.col, options.index, options.options, function (error) {
			lib.errorLogger(error);
			var records = require(dataFolder + "catalogs/index.js");
			mongo.insert("catalogs", records, cb);
		});
		
	},
	
	/*
	 Infra Record
	 */
	"addInfraRecord": function (cb) {
		var options =
			{
				col: 'infra',
				index: {type: 1}
			};
		
		mongo.createIndex(options.col, options.index, null, function (error) {
			lib.errorLogger(error);
			try {
				var records = require(dataFolder + "infra/infra.js");
				mongo.insert("infra", records, cb);
			}
			catch (e) {
				return cb();
			}
			
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
			mongo.createIndex(oneIndex.col, oneIndex.index, oneIndex.options, function (error) {
				lib.errorLogger(error);
				return callback();
			});
		}, cb);
	}
};
