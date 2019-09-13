'use strict';
const fs = require("fs");
let Mongo = require("soajs").mongo;

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


        //update product DSBRD
        let record = require(dataPath + "gitAccounts/soajsRepos.js");
        delete (record._id);
        let condition = {"owner": "soajs", "provider": "github"};
        mongoConnectionTenant.update("git_accounts", condition, record, {'upsert': true}, () => {
	
	        let condition = {code: "DBTN"};
	        mongoConnectionTenant.find("tenants", condition, (error, tenant) => {
		        if (error) {
			        mongoConnectionTenant.closeDb();
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
		        tenant.console = true;
		        mongoConnectionTenant.update("tenants", condition, tenant, () => {
			
			        //close mongo connection
			        mongoConnectionTenant.closeDb();
			        return callback(null, "MongoDb Soajs Data migrate!");
		        });
	        });
        });
    });
};