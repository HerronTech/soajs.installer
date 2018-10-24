"use strict";
var overApp = app.components;

overApp.controller('overviewCtrl', ['$scope', 'ngDataApi', '$timeout', function ($scope, ngDataApi, $timeout) {
	$scope.alerts = [];
	
	$scope.remoteProvider = {};
	
	$scope.myProviders = [
		{
			name: 'aws',
			label: 'Amazon Web Services',
			url: 'sections/home/images/aws.png'
		},
		{
			name: 'rackspace',
			label: 'Rackspace',
			url: 'sections/home/images/rackspace.png'
		},
		{
			name: 'google',
			label: 'Google Cloud',
			url: 'sections/home/images/google.png'
		},
		{
			name: 'azure',
			label: 'Microsoft Azure',
			url: 'sections/home/images/azure.png'
		},
		{
			name: 'joyent',
			label: 'Joyent',
			url: 'sections/home/images/joyent.png'
		},
		{
			name: 'custom',
			label: 'custom',
			url: 'sections/home/images/ubuntu.png'
		}
	];
	
	$scope.closeAlert = function (i) {
		$scope.alerts.splice(i, 1);
	};
	$scope.previousCheckComplete = false;
	
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
			};
		}
		//if kubernetes local is selected
		else if (!$scope.manual && $scope.local && !$scope.remote && !$scope.docker && $scope.kubernetes) {
			output = {
				"deployDriver": "container.kubernetes.local",
				"deployType": "container"
			};
		}
		//if docker remote is selected
		else if (!$scope.manual && !$scope.local && $scope.remote && $scope.docker && !$scope.kubernetes) {
			output = {
				"deployDriver": "container.docker.remote",
				"deployType": "container"
			};
		}
		//if docker remote is selected
		else if (!$scope.manual && !$scope.local && $scope.remote && !$scope.docker && $scope.kubernetes) {
			output = {
				"deployDriver": "container.kubernetes.remote",
				"deployType": "container"
			};
		}
		//if docker remote is selected
		else if (!$scope.manual && $scope.local && !$scope.remote && !$scope.docker && $scope.kubernetes) {
			return false;
		}
		else if (!$scope.manual && !$scope.local && $scope.remote && !$scope.docker && $scope.kubernetes) {
			return false;
		}
		
		output.remoteProvider = $scope.remoteProvider;
		
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
		$scope.docker  = $scope.docker ? $scope.docker : false;
		$scope.kubernetes =  $scope.kubernetes ? $scope.kubernetes : false;
		
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
	
	$scope.saveremoteprovider = function(vv){
		$scope.remoteProvider = vv;
		$scope.selectDeployment(null, false);
		setTimeout(function () {
			resizeContent();
		}, 700);
	};
	
	$scope.selectDeployment = function (type, vv) {
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
		if(vv){
			$scope.data.deployDriver = vv;
		}
		else if (vv === false){
			$scope.data.deployDriver = null;
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
			
			$scope.remoteProvider = response.remoteProvider;
			
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
            $timeout(function(){
                resizeContent();
            }, 500);
		});
	};
	
	$timeout(function () {
		$scope.loadOverview();
	}, 1500);
	
}]);