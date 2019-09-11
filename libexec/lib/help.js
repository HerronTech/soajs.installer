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

		output += "Usage: soajs MODULE OPERATION [PARAMs ...]\n\n";


        output += "Available MODULES:\n";
        output += "   console\n";
        output += "   mongo\n";
        output += "   service\n";
        output += "   profile\n";
        output += "   docker\n";
        output += "   kubernetes\n";
        output += "   remote-installer\n\n";

		let manual = {
			"console Operations": {
				"install": "Configures & starts mongodb server, patches the SOAJS sample data, installs and starts the SOAJS Console",
				"update": "Stops SOAJS Console, updates all the Console Microservices and starts the SOAJS Console",
				"remove": "Stops SOAJS Console, stops MongoDB server and deletes all the downloaded Console Microservices",
				"start": "Starts all the Microservices of the SOAJS Console",
				"stop": "Stops all the Microservices of the SOAJS Console",
				"restart": "Restarts all the Microservices of the SOAJS Console",
                "setHost": "Updates the console server host domain"
			},
			"mongo Operations" :{
				"install": "Creates the MongoDB configuration file and updates the SOAJS profile",
				"start": "Starts MongoDB server",
				"stop": "Stops MongoDB server",
				"restart": "Restarts MongoDB server",
				"setPort": "Changes the default MongoDB server port and updates the SOAJS profile",
				"clean": "Removes all the databases of SOAJS sample data from the MongoDB server",
				"patch": "Imports the SOAJS sample data into MongoDB server and creates all the needed databases",
                "migrate": "Migrate SOAJS data to update from an old version to a new version when needed",
                "custom": "Import custom data"
			},
			"service Operations" :{
				"start": "Start a SOAJS Service [gateway|urac|dashboard|oauth|multitenant]",
				"stop": "Stop a SOAJS Service [gateway|urac|dashboard|oauth|multitenant]",
                "restart": "reStart a SOAJS Service [gateway|urac|dashboard|oauth|multitenant]"
			},
			"profile Operations" :{
				"setPort": "Updates the MongoDB server port in the SOAJS profile",
                "setHost": "Updates the MongoDB server host in the SOAJS profile"
			},
			"docker Operations" :{
				"install": "Downloads, installs and starts Docker on your machine",
				"remove": "Removes Docker from your machine",
				"start": "Starts Docker Swarm on your machine",
				"stop": "Stops Docker Swarm on your machine",
				"restart": "Restarts Docker Swarm on your machine",
				"connect": "Configures and displays how to connect to Docker Swarm on your machine"
			},
			"kubernetes Operations" :{
				"install": "Downloads, installs and starts Kubernetes on your machine",
				"remove": "Removes Kubernetes from your machine",
				"start": "Starts Kubernetes on your machine ( Not supported on Ubuntu )",
				"stop": "Stops Kubernetes on your machine ( Not supported on Ubuntu )",
				"restart": "Restarts Kubernetes on your machine ( Not supported on Ubuntu )",
				"connect": "Configures and displays how to connect to Kubernetes on your machine"
			},
			"remote-installer Operations" :{
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
		}
		
		output += "\n";
		output += "Refer to README.md file for more details about the commands and their arguments.";
		output += "\n";
		
		//print and return
		console.log(output);
		return callback();
	}
};

module.exports = helpModule;