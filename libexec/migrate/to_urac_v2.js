'use strict';
const fs = require("fs");
let Mongo = require("soajs").mongo;


function unpdateUsersAndGroups(mongoConnection, tenantInfo, tenant, dataPath, callback) {
    let condition = {$or: [{'tenant.code': "DEVE"}, {'tenant.code': "DEVO"}, {'tenant.code': "OWNE"}]};
    let s = {'$set': {'tenant': tenantInfo}};
    mongoConnection.update("users", condition, s, {'multi': true}, () => {

        condition = {'tenant.code': "DEVE"};
        let develGroup = require(dataPath + "urac/groups/devel.js");
        delete (develGroup._id);
        s['$set'].config = develGroup.config;
        mongoConnection.update("groups", condition, s, {'multi': true}, () => {

            mongoConnection.update("groups", {"code": develGroup.code}, develGroup, {'upsert': true}, () => {

                condition = {'tenant.code': "DEVO"};
                let devopGroup = require(dataPath + "urac/groups/devop.js");
                delete (devopGroup._id);
                s['$set'].config = devopGroup.config;
                mongoConnection.update("groups", condition, s, {'multi': true}, () => {

                    mongoConnection.update("groups", {"code": devopGroup.code}, devopGroup, {'upsert': true}, () => {

                        condition = {'tenant.code': "OWNE"};
                        let ownwerGroup = require(dataPath + "urac/groups/owner.js");
                        delete (ownwerGroup._id);
                        s['$set'].config = ownwerGroup.config;
                        mongoConnection.update("groups", condition, s, {'multi': true}, () => {

                            mongoConnection.update("groups", {"code": ownwerGroup.code}, ownwerGroup, {'upsert': true}, () => {

                                return callback();

                            });
                        });

                    });
                });

            });
        });
    });
}

function fixOwnerAndTenants(mongoConnection, profile, tenant, callback) {
    let condition = {username: "owner"};
    mongoConnection.find("users", condition, (error, ownerUser) => {
        if (error) {
            //close mongo connection
            mongoConnection.closeDb();
            return callback(error);
        }
        if (!ownerUser) {
            //close mongo connection
            mongoConnection.closeDb();
            return callback(null, 'Unable to migrate: Owner user record not found!');
        }
        if (ownerUser.length > 1) {
            //close mongo connection
            mongoConnection.closeDb();
            return callback(null, 'Unable to migrate: Many Owner user record found!');
        }
        ownerUser = ownerUser[0];

        ownerUser.tenant = {
            "id": tenant._id.toString(),
            "code": tenant.code
        };
        ownerUser.groups = ['owner'];
        mongoConnection.update("users", condition, ownerUser, (error) => {
            if (error) {
                //close mongo connection
                mongoConnection.closeDb();
                return callback(error);
            }
            condition = {code: "owner"};
            mongoConnection.find("groups", condition, (error, ownerGroup) => {
                if (error) {
                    //close mongo connection
                    mongoConnection.closeDb();
                    return callback(error);
                }
                if (!ownerGroup) {
                    //close mongo connection
                    mongoConnection.closeDb();
                    return callback(null, 'Unable to migrate: Owner group record not found!');
                }
                if (ownerGroup.length > 1) {
                    //close mongo connection
                    mongoConnection.closeDb();
                    return callback(null, 'Unable to migrate: Many Owner group record found!');
                }
                ownerGroup = ownerGroup[0];

                ownerGroup.tenant = {
                    "id": tenant._id.toString(),
                    "code": tenant.code
                };
                ownerGroup.config = {
                    "allowedPackages": {}
                };
                ownerGroup.config.allowedPackages[tenant.applications[0].product] = ["DSBRD_OWNER"];
                mongoConnection.update("groups", condition, ownerGroup, (error) => {
                    if (error) {
                        //close mongo connection
                        mongoConnection.closeDb();
                        return callback(error);
                    }
                    return callback(null, null);
                });
            });

        });
    });
}

module.exports = (profilePath, dataPath, callback) => {
    let profile;
    //check if profile is found
    fs.stat(profilePath, (error) => {
        if (error) {
            return callback(null, 'Profile not found!');
        }

        //read  mongo profile file
        profile = require(profilePath);
        //use soajs.core.modules to create a connection to core_provision database
        let mongoConnectionTenant = new Mongo(profile);

        let condition = {code: "DBTN"};
        mongoConnectionTenant.find("tenants", condition, (error, tenant) => {
            if (error) {
                return callback(error);
            }
            if (!tenant) {
                //close mongo connection
                mongoConnectionTenant.closeDb();
                return callback(null, 'Unable to migrate: Tenant record not found!');
            }
            if (tenant.length > 1) {
                //close mongo connection
                mongoConnectionTenant.closeDb();
                return callback(null, 'Unable to migrate: Many Tenant record found!');
            }
            tenant = tenant[0];

            //Update tenant information
            tenant.name = "Console Tenant";
            tenant.description = "This is the tenant that holds the access rights and configuration for the console users with DSBRD_GUEST as Guest default package";
            tenant.tag = "Console";
            if (tenant.applications) {
                for (let i = 0; i < tenant.applications.length; i++) {
                    if (tenant.applications[i].keys) {
                        for (let j = 0; j < tenant.applications[i].keys.length; j++) {
                            if (tenant.applications[i].keys[j].extKeys) {
                                for (let k = 0; k < tenant.applications[i].keys[j].extKeys.length; k++) {
                                    tenant.applications[i].keys[j].extKeys[k].dashboardAccess = true;
                                }
                            }
                        }
                    }
                }
            }
            mongoConnectionTenant.update("tenants", condition, tenant, () => {
                //delete unneeded console tenants
                condition = {$or: [{code: "DEVE"}, {code: "DEVO"}, {code: "OWNE"}]};
                mongoConnectionTenant.remove("tenants", condition, () => {

                    //update product DSBRD
                    let record = require(dataPath + "products/dsbrd.js");
                    delete (record._id);
                    condition = {code: "DSBRD"};
                    mongoConnectionTenant.update("products", condition, record, {'upsert': true}, () => {
                        //close mongo connection
                        mongoConnectionTenant.closeDb();

                        //switch profile DBTN_urac
                        profile.name = "DBTN_urac";
                        let mongoConnection = new Mongo(profile);
                        fixOwnerAndTenants(mongoConnection, profile, tenant, (error, response) => {
                            if (error || response)
                                return callback(error, response);
                            unpdateUsersAndGroups(mongoConnection, {
                                "id": tenant._id.toString(),
                                "code": tenant.code
                            }, tenant, dataPath, () => {
                                //close mongo connection
                                mongoConnection.closeDb();
                                return callback(null, "MongoDb Soajs Data migrate!")
                            });
                        });
                    });
                });
            });
        });
    });
};