'use strict';
process.env.SOAJS_SOLO = true;
process.env.SOAJS_SRVIP = "localhost";

var path = require("path");
var express = require('express');
var soajs = require("soajs");
var config = require("./config.js");
var routes = require("./routes/");

var installer = new soajs.server.service(config);
var utilLog = require('util');

installer.init(function () {
	
	//overview
	installer.get('/overview', routes.getOverview);
	installer.post('/overview', routes.postOverview);
	
	//General Information APIs
	installer.get('/installer/gi', routes.getGi);
	installer.post('/installer/gi', routes.postGi);

	//Security APIs
	installer.get('/installer/security', routes.getSecurity);
	installer.post('/installer/security', routes.postSecurity);

	//Clusters APIs
	installer.get('/installer/clusters', routes.getClusters);
	installer.post('/installer/clusters', routes.postClusters);
	installer.post('/installer/esClusters', routes.postEsClusters);

	//Deployment APIs
	installer.get('/installer/deployment', routes.getDeployment);
	installer.post('/installer/deployment', routes.postDeployment);

	//Launch Installer
	installer.get('/installer/go', routes.installSOAJS);
	
	//Show Installation Progress
	installer.get('/progress/info', routes.progressInfo);
	installer.get('/progress', routes.progress);
	
	//bind the ui
	installer.app.use(express.static(path.join(__dirname, './views')));
	
	//start the service
	installer.start();
	setTimeout(function(){
		utilLog.log('Application Started, Open this link in your browser [ http://localhost:1337/ ]');
	}, 500);
});