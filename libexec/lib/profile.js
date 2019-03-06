'use strict';

const path = require("path");
const fs = require("fs");

const profileModule = {

    /**
     * Create a backup file of the original soajs_profile.js if not created yet.
     * load soajs_profile, change the port value
     * rewrite the soajs_profile
     * @param args {Array}
     * @param callback {Function}
     */
    'setPort': (args, callback) => {
        //Verify argument
        if (!Array.isArray(args) || args.length === 0) {
            return callback(null, "Missing port value!");
        }
        if (args.length > 1) {
            args.shift();
            return callback(null, `Unidentified input ${args.join(" ")}. Please use soajs profile setPort %number%.`);
        }

        let profileDir = path.normalize(process.env.PWD + "/../data/");
        //check and create a backup file
        fs.stat(profileDir + "default.soajs_profile.js", (error, stats) => {
            if (error) {
                if (error.code === 'ENOENT' && !stats) {
                    fs.copyFile(profileDir + "soajs_profile.js", profileDir + "default.soajs_profile.js", (error) => {
                        if (error) {
                            return callback(error);
                        }
                        updateProfile();
                    });
                }
                else {
                    return callback(error);
                }
            }
            else {
                updateProfile();
            }
        });

        function updateProfile() {
            let soajsProfile = require(profileDir + "soajs_profile.js");
            try {
                soajsProfile.servers[0].port = parseInt(args[0]);
            }
            catch (e) {
                return callback(e);
            }

            let newProfileData = "'use strict';\n\n";
            newProfileData += "module.exports = " + JSON.stringify(soajsProfile, null, 2) + ";\n";

            fs.writeFile(profileDir + "soajs_profile.js", newProfileData, (error) => {
                if (error) {
                    return callback(error);
                }

                return callback(null, `MongoDB port has been updated to ${soajsProfile.servers[0].port} in the SOAJS Profile.`);
            });
        }
    },

    /**
     * Create a backup file of the original soajs_profile.js if not created yet.
     * load soajs_profile, change the port value
     * rewrite the soajs_profile
     * @param args {Array}
     * @param callback {Function}
     */
    'setHost': (args, callback) => {
        //Verify argument
        if (!Array.isArray(args) || args.length === 0) {
            return callback(null, "Missing host value!");
        }
        if (args.length > 1) {
            args.shift();
            return callback(null, `Unidentified input ${args.join(" ")}. Please use soajs profile setHost %host_domain%.`);
        }

        let profileDir = path.normalize(process.env.PWD + "/../data/");
        //check and create a backup file
        fs.stat(profileDir + "default.soajs_profile.js", (error, stats) => {
            if (error) {
                if (error.code === 'ENOENT' && !stats) {
                    fs.copyFile(profileDir + "soajs_profile.js", profileDir + "default.soajs_profile.js", (error) => {
                        if (error) {
                            return callback(error);
                        }
                        updateProfile();
                    });
                }
                else {
                    return callback(error);
                }
            }
            else {
                updateProfile();
            }
        });

        function updateProfile() {
            let soajsProfile = require(profileDir + "soajs_profile.js");
            soajsProfile.servers[0].host = args[0];

            let newProfileData = "'use strict';\n\n";
            newProfileData += "module.exports = " + JSON.stringify(soajsProfile, null, 2) + ";\n";

            fs.writeFile(profileDir + "soajs_profile.js", newProfileData, (error) => {
                if (error) {
                    return callback(error);
                }

                return callback(null, `MongoDB host has been updated to ${soajsProfile.servers[0].host} in the SOAJS Profile.`);
            });
        }
    }
};

module.exports = profileModule;