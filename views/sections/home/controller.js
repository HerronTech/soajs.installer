"use strict";
var overApp = app.components;
overApp.controller('overviewCtrl', ['$scope', 'ngDataApi', '$timeout', function($scope, ngDataApi, $timeout) {
	$scope.alerts = [];
	
	$scope.closeAlert = function(i){
		$scope.alerts.splice(i, 1);
	};
	
	$scope.fillOverView = function(){
		var data = angular.copy($scope.data);
		
		if(!data.deployType){
			return false;
		}
		
		if(data.deployType !== 'manual' && (!data.deployDriver || data.deployDriver === '') ){
			return false;
		}
		
		
		var options = {
			url: appConfig.url + "/overview",
			method: "post",
			data: {
				"overview": data
			}
		};
		
		ngDataApi.post($scope, options, function(error, response){
			if(error){
				$scope.alerts.push({'type': 'danger', 'msg': error.message});
				return false;
			}
			$scope.$parent.go("#/gi");
		});
	};
	
	$scope.selectDeployment = function(type){
		if(type === 'manual'){
			$scope.style.deployType = $scope.data.deployType = "manual";
			$scope.data.deployDriver = "manual";
			$scope.manual = true;
			$scope.docker = false;
			$scope.kubernetes = false;
		}
		
		if(type === 'docker'){
			$scope.style.deployType = "docker";
			$scope.data.deployType = "container";
			$scope.manual = false;
			$scope.docker = true;
			$scope.kubernetes = false;
		}
		
		if(type === 'kubernetes'){
			$scope.style.deployType = "kubernetes";
			$scope.data.deployType = "container";
			$scope.manual = false;
			$scope.docker = false;
			$scope.kubernetes = true;
		}
	};
	
	$scope.loadOverview = function(){
		var options = {
			url: appConfig.url + "/overview",
			method: "get"
		};
		
		ngDataApi.get($scope, options, function(error, response) {
			if (error) {
				$scope.alerts.push({'type': 'danger', 'msg': error.message});
				return false;
			}
			
			$scope.style = response;
			$scope.data = {};
			$scope.data.deployDriver = $scope.style.deployer.deployDriver;
			$scope.data.deployType = $scope.style.deployer.deployType;
			$scope.osName = response.deployer.os;
			if($scope.data.deployDriver.indexOf('docker') !== -1){
				$scope.style.deployType = 'docker';
				$scope.docker = true;
				$scope.manual = false;
				$scope.kubernetes = false;
			}
			else if($scope.data.deployDriver.indexOf('kubernetes') !== -1){
				$scope.style.deployType = 'kubernetes';
				$scope.kubernetes = true;
				$scope.manual = false;
				$scope.docker = false;
			}
			else if($scope.data.deployDriver === 'manual'){
				$scope.style.deployType = 'manual';
				$scope.manual = true;
				$scope.docker = false;
				$scope.kubernetes = false;
			}
			
			if (!$scope.$$phase) {
				$scope.$apply();
			}
		});
	};
	
	$timeout(function(){
		$scope.loadOverview();
	}, 1500);
	
}]);