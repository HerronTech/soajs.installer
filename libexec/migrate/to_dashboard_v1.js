'use strict';
const fs = require("fs");
const async = require("async");
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
        let mongoConnection = new Mongo(profile);

        //update product services
        let records = require(dataPath + "services/index.js");
        if (records && Array.isArray(records)) {
            async.each(
                records,
                (service, cb) => {
                    if (service.name) {
                        let condition = {name: service.name};
                        let s = {'$set': service};
                        mongoConnection.update("services", condition, s, {'upsert': true}, () => {
                            cb();
                        });
                    }
                },
                () => {
                    mongoConnection.closeDb();
                    return callback(null, "MongoDb Soajs Data migrate!")
                }
            );
        }
    });
};