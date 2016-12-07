/**
 * Created by Nicolas on 12/7/16.
 */
/***************************************************************
 *
 * DASHBOARD CORE_PROVISION
 *
 ***************************************************************/
var soajs = require("soajs");
var profile = require("../../../data/startup/profile.js");
var dataFolder = "../../../data/startup/";
profile.name = "core_provision";
var mongo = new soajs.mongo(profile);


mongo.dropDatabase(function(){
    addExtKeys(function(){
        addEnvs(function(){
            addProducts(function() {
                addServices(function() {
                addTenants(function () {
                    addGitAccounts(function () {
                        provisionIndex(function () {
                            mongo.closeDb();
                            profile.name = "DBTN_urac";
                            mongo = new soajs.mongo(profile);
                            mongo.dropDatabase(function () {
                                addUsers(function () {
                                    addGroups(function () {
                                        uracIndex(function () {
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

/*
 DASHBOARD EXT KEYS
 */
var addExtKeys = function(cb){
    var record = require(dataFolder + "extKeys/keys.js");
    mongo.insert("dashboard_extKeys", record, cb);
};

/*
 Environments
 */
var addEnvs = function(cb){
    var record = require(dataFolder + "environments/dashboard.js");
    record._id = mongo.ObjectId(record._id);
    mongo.insert("environment", record, cb);
};

/*
 Products
 */
var addProducts = function(cb){
    var record = require(dataFolder + "products/dsbrd.js");
    record._id = mongo.ObjectId(record._id);
    mongo.insert("products", record, cb);
};

/*
 Services
 */
var addServices = function(cb){
    var record = require(dataFolder + "services/index.js");
    mongo.insert("services", record, cb);
};

/*
 Tenants
 */
var addTenants = function(cb){
    var record = require(dataFolder + "tenants/owner.js");

    record._id = mongo.ObjectId(record._id);
    record.applications.forEach(function(oneApp){
        oneApp.appId = mongo.ObjectId(oneApp.appId);
    });

    mongo.insert("tenants", record, cb);
};

/*
 Git Accounts
 */
var addGitAccounts = function(cb){
    var record = require(dataFolder + "gitAccounts/soajsRepos.js");
    record._id = mongo.ObjectId(record._id);
    mongo.insert("git_accounts", record, cb);
};

/***************************************************************
 *
 * DASHBOARD URAC
 *
 ***************************************************************/
/*
 Users
 */
var addUsers = function(cb){
    var record = require(dataFolder + "urac/users/owner.js");
    mongo.insert("users", record, cb);
};

/*
 Groups
 */
var addGroups = function(cb){
    var record = require(dataFolder + "urac/groups/owner.js");
    mongo.insert("groups", record, cb);
};

function errorLogger(error) {
    if (error) {
        return console.log(error);
    }
}

//users
function provisionIndex(cb){
    mongo.ensureIndex("users", {username: 1}, {unique: true}, errorLogger);
    mongo.ensureIndex("users", {email: 1}, {unique: true}, errorLogger);
    mongo.ensureIndex("users", {username: 1, status: 1}, null, errorLogger);
    mongo.ensureIndex("users", {email: 1, status: 1}, null, errorLogger);
    mongo.ensureIndex("users", {groups: 1, 'tenant.id': 1}, null, errorLogger);
    mongo.ensureIndex("users", {username: 1, 'tenant.id': 1}, null, errorLogger);
    mongo.ensureIndex("users", {status: 1}, null, errorLogger);
    mongo.ensureIndex("users", {locked: 1}, null, errorLogger);
    mongo.ensureIndex("users", {'tenant.id': 1}, null, errorLogger);
    return cb();
}

function uracIndex(cb){
    //groups
    mongo.ensureIndex("groups", {code: 1, 'tenant.id': 1}, null, errorLogger);
    mongo.ensureIndex("groups", {code: 1}, null, errorLogger);
    mongo.ensureIndex("groups", {'tenant.id': 1}, null, errorLogger);
    mongo.ensureIndex("groups", {locked: 1}, null, errorLogger);
    //tokens
    mongo.ensureIndex("tokens", {token: 1}, {unique: true}, errorLogger);
    mongo.ensureIndex("tokens", {userId: 1, service: 1, status: 1}, null, errorLogger);
    mongo.ensureIndex("tokens", {token: 1, service: 1, status: 1}, null, errorLogger);
    return cb();

}

