"use strict";
var overApp = app.components;

overApp.controller('overviewCtrl', ['$scope', 'ngDataApi', '$timeout', function ($scope, ngDataApi, $timeout) {
	$scope.alerts = [];
	$scope.remote = true;
	$scope.remoteTechnology = {};
	
	$scope.myTechnologies = [
		{
			name: "docker",
			label: "Docker Swarm",
			url: 'images/docker_logo.png'
		},
		{
			name: "kubernetes",
			label: "Kubernetes",
			url: 'images/kubernetes_logo.png'
		}
	];
	
	$scope.saveRemoteTechnology = function(vv){
		$scope.remoteTechnology = vv;
		$scope.selectDeployment(vv.name);
		setTimeout(function () {
			resizeContent();
		}, 700);
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
	
	$scope.myProviders = [
		{
			name: 'aws',
			label: 'Amazon Web Services',
			url: 'sections/home/images/aws.png',
			docker: 'https://soajsorg.atlassian.net/wiki/spaces/IN/pages/63697737/AWS+Docker',
			kubernetes: 'https://soajsorg.atlassian.net/wiki/spaces/IN/pages/63697794/AWS+Kubernetes'
		},
		{
			name: 'rackspace',
			label: 'Rackspace',
			url: 'sections/home/images/rackspace.png',
			docker: 'https://soajsorg.atlassian.net/wiki/spaces/IN/pages/63698725/Rackspace+Docker',
			kubernetes: 'https://soajsorg.atlassian.net/wiki/spaces/IN/pages/63698935/Rackspace+Kubernetes'
		},
		{
			name: 'google',
			label: 'Google Cloud',
			url: 'sections/home/images/google.png',
			docker: 'https://soajsorg.atlassian.net/wiki/spaces/IN/pages/63698493/Google+Docker',
			kubernetes: 'https://soajsorg.atlassian.net/wiki/spaces/IN/pages/63698553/Google+Kubernetes'
		},
		{
			name: 'azure',
			label: 'Microsoft Azure',
			url: 'sections/home/images/azure.png',
			docker: 'https://soajsorg.atlassian.net/wiki/spaces/IN/pages/64293754/Azure+Docker',
			kubernetes: 'https://soajsorg.atlassian.net/wiki/spaces/IN/pages/64293936/Azure+Kubernetes'
		},
		{
			name: 'joyent',
			label: 'Joyent',
			url: 'sections/home/images/joyent.png',
			docker: 'https://soajsorg.atlassian.net/wiki/spaces/IN/pages/64294622/Joyent+Triton+Docker',
			kubernetes: 'https://soajsorg.atlassian.net/wiki/spaces/IN/pages/64294695/Joyent+Triton+Kubernetes'
		},
		{
			name: 'custom',
			label: 'custom',
			url: 'sections/home/images/ubuntu.png',
			docker: 'https://soajsorg.atlassian.net/wiki/spaces/IN/pages/142180428/Custom+with+Docker',
			kubernetes: 'https://soajsorg.atlassian.net/wiki/spaces/IN/pages/142344284/Custom+with+Kubernetes'
		}
	];
	
	$scope.previousCheckComplete = (Object.keys($scope.remoteTechnology).length > 0);
	
	$scope.fillOverView = function () {
		var output = {};
		//check if no deplyment type is clicked
		//check if a container deployment is clicked but no deployment driver is clicked.
		if (!$scope.docker && !$scope.kubernetes) {
			return false;
		}
		
		//if docker remote is selected
		else if ($scope.docker && !$scope.kubernetes) {
			output = {
				"deployDriver": "container.docker.remote",
				"deployType": "container"
			};
		}
		//if docker remote is selected
		else if (!$scope.docker && $scope.kubernetes) {
			output = {
				"deployDriver": "container.kubernetes.remote",
				"deployType": "container"
			};
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
			
			if (!$scope.data.deployDriver) {
				$scope.docker = false;
				$scope.kubernetes = false;
			}
			else if ($scope.data.deployDriver.includes('kubernetes')) {
				$scope.docker = false;
				$scope.kubernetes = true;
				$scope.remoteTechnology = $scope.myTechnologies[1];
			}
			else if ($scope.data.deployDriver.includes('docker')) {
				$scope.docker = true;
				$scope.kubernetes = false;
				$scope.remoteTechnology = $scope.myTechnologies[0];
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