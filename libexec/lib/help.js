"use strict";

const helpModule = {
	/**
	 * Displays the SOAJS installer manual
	 * @param args
	 * @param callback
	 * @returns {*}
	 */
	go: (args, callback) => {
		let output = "\nSOAJS Installer Manual:\n=======================\n\n";
		
		let manual = {
			"SOAJS Console Commands": {
				"install": "Configures & starts mongodb server, patches the SOAJS sample data, installs and starts the SOAJS Console",
				"update": "Stops SOAJS Console, updates all the Console Microservices and starts the SOAJS Console",
				"remove": "Stops SOAJS Console, stops MongoDB server and deletes all the downloaded Console Microservices",
				"start": "Starts all the Microservices of the SOAJS Console",
				"stop": "Stops all the Microservices of the SOAJS Console",
				"restart": "Restarts all the Microservices of the SOAJS Console"
			},
			"MongoDB Server Commands" :{
				"install": "Creates the MongoDB configuration file and updates the SOAJS profile",
				"start": "Starts MongoDB server",
				"stop": "Stops MongoDB server",
				"restart": "Restarts MongoDB server",
				"setPort": "Changes the default MongoDB server port and updates the SOAJS profile",
				"clean": "Removes all the databases of SOAJS sample data from the MongoDB server",
				"patch": "Imports the SOAJS sample data into MongoDB server and creates all the needed databases"
			},
			"Profile Commands" :{
				"setPort": "Updates the MongoDB server port in the SOAJS profile"
			},
			"Docker Commands" :{
				"install": "Downloads, installs and starts Docker on your machine",
				"remove": "Removes Docker from your machine",
				"start": "Starts Docker Swarm on your machine",
				"stop": "Stops Docker Swarm on your machine",
				"restart": "Restarts Docker Swarm on your machine",
				"connect": "Configures and displays how to connect to Docker Swarm on your machine"
			},
			"Kubernetes Commands" :{
				"install": "Downloads, installs and starts Kubernetes on your machine",
				"remove": "Removes Kubernetes from your machine",
				"start": "Starts Kubernetes on your machine ( Not supported on Ubuntu )",
				"stop": "Stops Kubernetes on your machine ( Not supported on Ubuntu )",
				"restart": "Restarts Kubernetes on your machine ( Not supported on Ubuntu )",
				"connect": "Configures and displays how to connect to Kubernetes on your machine"
			},
			"Remote Cloud Commands" :{
				"start": "Starts the SOAJS Remote Cloud Installer",
				"stop": "Stops the SOAJS Remote Cloud Installer"
			}
		};
		
		for(let section in manual){
			output += `${section}:\n`;
			
			let commands = manual[section];
			for(let command in commands){
				output += `${command}\t\t${commands[command]}\n`;
			}
			output += "\n";
			output += "Refer to README.md file for more details about the commands and their arguments.";
			output += "\n";
		}
		
		//print and return
		console.log(output);
		return callback();
	}
};

module.exports = helpModule;