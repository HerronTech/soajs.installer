/**
 * Created by Nicolas on 12/7/16.
 */
/***************************************************************
 *
 * DASHBOARD CORE_PROVISION
 *
 ***************************************************************/
var soajs = require("soajs");

var dataFolder = process.env.SOAJS_DATA_FOLDER;
delete require.cache[process.env.SOAJS_PROFILE];
var profile = require(process.env.SOAJS_PROFILE);

profile.name = "core_provision";
var mongo = new soajs.mongo(profile);


mongo.dropDatabase(function(){
    lib.addExtKeys(function(){
        lib.addEnvs(function(){
            lib.addProducts(function() {
                lib.addServices(function() {
                    lib.addTenants(function () {
                        lib.addGitAccounts(function () {
                            lib.provisionIndex(function () {
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

var lib = {
    /*
     DASHBOARD EXT KEYS
     */
    "addExtKeys" : function (cb) {
        var record = require(dataFolder + "extKeys/keys.js");
        mongo.insert("dashboard_extKeys", record, cb);
    },

    /*
     Environments
     */
    "addEnvs" : function (cb) {
        var record = require(dataFolder + "environments/dashboard.js");
        record._id = mongo.ObjectId(record._id);
        mongo.insert("environment", record, cb);
    },

    /*
     Products
     */
    "addProducts" : function (cb) {
        var record = require(dataFolder + "products/dsbrd.js");
        record._id = mongo.ObjectId(record._id);
        mongo.insert("products", record, cb);
    },

    /*
     Services
     */
    "addServices" : function (cb) {
        var record = require(dataFolder + "services/index.js");
        mongo.insert("services", record, cb);
    },

    /*
     Tenants
     */
    "addTenants" : function (cb) {
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
    "addGitAccounts" : function (cb) {
        var record = require(dataFolder + "gitAccounts/soajsRepos.js");
        record._id = mongo.ObjectId(record._id);
        mongo.insert("git_accounts", record, cb);
    },

    /***************************************************************
     *
     * DASHBOARD URAC
     *
     ***************************************************************/
    /*
     Users
     */
    "addUsers" : function (cb) {
        var record = require(dataFolder + "urac/users/owner.js");
        mongo.insert("users", record, cb);
    },

    /*
     Groups
     */
    "addGroups" : function (cb) {
        var record = require(dataFolder + "urac/groups/owner.js");
        mongo.insert("groups", record, cb);
    },

    "errorLogger" : function(error) {
        if (error) {
            return console.log(error);
        }
    },

    //users
    "provisionIndex": function(cb){
        mongo.ensureIndex("users", {username: 1}, {unique: true}, lib.errorLogger);
        mongo.ensureIndex("users", {email: 1}, {unique: true}, lib.errorLogger);
        mongo.ensureIndex("users", {username: 1, status: 1}, null, lib.errorLogger);
        mongo.ensureIndex("users", {email: 1, status: 1}, null, lib.errorLogger);
        mongo.ensureIndex("users", {groups: 1, 'tenant.id': 1}, null, lib.errorLogger);
        mongo.ensureIndex("users", {username: 1, 'tenant.id': 1}, null, lib.errorLogger);
        mongo.ensureIndex("users", {status: 1}, null, lib.errorLogger);
        mongo.ensureIndex("users", {locked: 1}, null, lib.errorLogger);
        mongo.ensureIndex("users", {'tenant.id': 1}, null, lib.errorLogger);
        return cb();
    },

    "uracIndex": function(cb){
        //groups
        mongo.ensureIndex("groups", {code: 1, 'tenant.id': 1}, null, lib.errorLogger);
        mongo.ensureIndex("groups", {code: 1}, null, lib.errorLogger);
        mongo.ensureIndex("groups", {'tenant.id': 1}, null, lib.errorLogger);
        mongo.ensureIndex("groups", {locked: 1}, null, lib.errorLogger);
        //tokens
        mongo.ensureIndex("tokens", {token: 1}, {unique: true}, lib.errorLogger);
        mongo.ensureIndex("tokens", {userId: 1, service: 1, status: 1}, null, lib.errorLogger);
        mongo.ensureIndex("tokens", {token: 1, service: 1, status: 1}, null, lib.errorLogger);
        return cb();

    }
};