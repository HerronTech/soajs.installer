"use strict";
var overApp = app.components;

overApp.controller('overviewCtrl', ['$scope', 'ngDataApi', '$timeout', function ($scope, ngDataApi, $timeout) {
	$scope.alerts = [];
	
	$scope.closeAlert = function (i) {
		$scope.alerts.splice(i, 1);
	};
	
	$scope.previousCheckComplete = false;
	$scope.deploymentExists = null;
	$scope.findCustomFile = function (previousDeploymentInfo, deploymentExists, cb) {
		if (deploymentExists) {
			$scope.deploymentExists = (previousDeploymentInfo !== null && previousDeploymentInfo !== undefined);
			var output = "<h4>Previous deployment detected</h4><hr />";
			output += "<table class='bulletin' width='100%' border='0' >";
			output += "<thead><tr><th>Deployment Type</th><th>Deployment Driver</th><th>Cluster</th></tr></thead><tbody>";
			
			output += "<tr>";
			if (previousDeploymentInfo.deployType === "manual") {
				output += "<td class='caps'>manual</td>";
				output += "<td class='caps'>manual</td>";
			}
			else if (previousDeploymentInfo.deployType.split(".")[0] === "container") {
				output += "<td class='caps'>" + previousDeploymentInfo.deployType.split(".")[2] + " cloud deployment</td>";
				output += "<td class='caps'>" + previousDeploymentInfo.deployType.split(".")[1] + "</td>";
			}
			
			previousDeploymentInfo.servers.forEach(function (server) {
				output += "<td><span class='caps'><b>Host:</b></span> " + server.host + " / <span class='caps'><b>Port:</b></span> " + server.port;
				
				if (previousDeploymentInfo.servers[0].host === "dashboard-soajsdata") {
					output += "<br /><em>The database cluster is a container withing the same cloud.</em>"
				}
				
				output += "</td>";
			});
			
			output += "</tr>";
			output += "</tbody></table>";
			output += "<br /><p>If you decide to proceed with the installation and once you run the generated deployment script in the last step, you will override this deployment with a new one.</p>";
			$scope.previousDeployment = output;
			return cb();
		}
	};
	
	$scope.fillOverView = function () {
		var output = {};
		//check if no deplyment type is clicked
		if (!$scope.manual && !$scope.local && !$scope.remote) {
			return false;
		}
		//check if a container deployment is clicked but no deployment driver is clicked.
		else if ($scope.local && !($scope.docker || $scope.kubernetes) || $scope.remote && !($scope.docker || $scope.kubernetes)) {
			return false;
		}
		//if manual deployment is selected
		else if ($scope.manual && !$scope.local && !$scope.remote) {
			output = {
				"deployDriver": "manual",
				"deployType": "manual"
			}
			
		}
		//if docker local is selected
		else if (!$scope.manual && $scope.local && !$scope.remote && $scope.docker && !$scope.kubernetes) {
			output = {
				"deployDriver": "container.docker.local",
				"deployType": "container"
			}
		}
		//if kubernetes local is selected
		else if (!$scope.manual && $scope.local && !$scope.remote && !$scope.docker && $scope.kubernetes) {
			output = {
				"deployDriver": "container.kubernetes.local",
				"deployType": "container"
			}
		}
		//if docker remote is selected
		else if (!$scope.manual && !$scope.local && $scope.remote && $scope.docker && !$scope.kubernetes) {
			output = {
				"deployDriver": "container.docker.remote",
				"deployType": "container"
			}
		}
		//if docker remote is selected
		else if (!$scope.manual && !$scope.local && $scope.remote && !$scope.docker && $scope.kubernetes) {
			output = {
				"deployDriver": "container.kubernetes.remote",
				"deployType": "container"
			}
		}
		
		var options = {
			url: appConfig.url + "/overview",
			method: "post",
			data: {
				"overview": output
			}
		};
		
		ngDataApi.post($scope, options, function (error) {
			if (error) {
				$scope.alerts.push({'type': 'danger', 'msg': error.message});
				return false;
			}
			$scope.$parent.go("#/gi");
		});
	};
	
	$scope.selectLocation = function (type) {
		
		if (type === 'manual') {
			$scope.manual = true;
			$scope.local = false;
			$scope.remote = false;
		}
		if (type === 'local') {
			$scope.manual = false;
			$scope.local = true;
			$scope.remote = false;
		}
		if (type === 'remote') {
			$scope.manual = false;
			$scope.local = false;
			$scope.remote = true;
		}
		setTimeout(function () {
			resizeContent();
		}, 500);
	};
	
	$scope.selectDeployment = function (type) {
		
		if (type === null) {
			$scope.docker = false;
			$scope.kubernetes = false;
		}
		if (type === 'docker') {
			$scope.docker = true;
			$scope.kubernetes = false;
		}
		if (type === 'kubernetes') {
			$scope.docker = false;
			$scope.kubernetes = true;
		}
	};
	
	$scope.loadOverview = function () {
		var options = {
			url: appConfig.url + "/overview",
			method: "get"
		};
		
		ngDataApi.get($scope, options, function (error, response) {
			if (error) {
				$scope.alerts.push({'type': 'danger', 'msg': error.message});
				return false;
			}
			
			$scope.style = response;
			$scope.data = {};
			if ($scope.style.deployer) {
				$scope.data.deployDriver = $scope.style.deployer.deployDriver;
				$scope.data.deployType = $scope.style.deployer.deployType;
			}
			$scope.osName = response.deployer.os;
			if (!$scope.data.deployDriver) {
				$scope.manual = false;
				$scope.docker = false;
				$scope.kubernetes = false;
				$scope.local = false;
				$scope.remote = false;
			}
			else if ($scope.data.deployDriver === 'manual') {
				$scope.manual = true;
				$scope.docker = false;
				$scope.kubernetes = false;
				$scope.local = false;
				$scope.remote = false;
			}
			else if ($scope.data.deployDriver.indexOf('kubernetes') !== -1 && $scope.data.deployDriver.indexOf('local') !== -1) {
				$scope.manual = false;
				$scope.docker = false;
				$scope.kubernetes = true;
				$scope.local = true;
				$scope.remote = false;
			}
			else if ($scope.data.deployDriver.indexOf('kubernetes') !== -1 && $scope.data.deployDriver.indexOf('remote') !== -1) {
				$scope.manual = false;
				$scope.docker = false;
				$scope.kubernetes = true;
				$scope.local = false;
				$scope.remote = true;
			}
			else if ($scope.data.deployDriver.indexOf('docker') !== -1 && $scope.data.deployDriver.indexOf('local') !== -1) {
				$scope.manual = false;
				$scope.docker = true;
				$scope.kubernetes = false;
				$scope.local = true;
				$scope.remote = false;
			}
			else if ($scope.data.deployDriver.indexOf('docker') !== -1 && $scope.data.deployDriver.indexOf('remote') !== -1) {
				$scope.manual = false;
				$scope.docker = true;
				$scope.kubernetes = false;
				$scope.local = false;
				$scope.remote = true;
			}
			if (!$scope.$$phase) {
				$scope.$apply();
			}
			$scope.previousCheckComplete = true;
			//check for existing deployments.
			$scope.findCustomFile(response.previousDeploymentInfo, response.previousDeployment, function(){
				
				$timeout(function(){
					resizeContent();
				}, 500);
			});
		});
	};
	
	$timeout(function () {
		$scope.loadOverview();
	}, 1500);
	
}]);