"use strict";
var giApp = app.components;
giApp.controller('giCtrl', ['$scope', 'ngDataApi', function($scope, ngDataApi) {
	$scope.alerts = [];
	
	$scope.closeAlert = function(i){
		$scope.alerts.splice(i, 1);
	};
	
	$scope.skip = function(){
		$scope.$parent.go("#/security");
	};
	
	$scope.goBack = function(){
		$scope.$parent.go("#/");
	};
	
	//Check whether each part of the domain is not longer than 63 characters,
	//Allow internationalized domain names
	$scope.domainRegex= '^((?=[a-z0-9-]{1,63}\\.)(xn--)?[a-z0-9]+(-[a-z0-9]+)*\\.)+[a-z]{2,63}$';
	
	$scope.fillBI = function(){
		var data = angular.copy($scope.gi);
		var options = {
			url: appConfig.url + "/installer/gi",
			method: "post",
			data: {
				"gi": data
			}
		};
		
		ngDataApi.post($scope, options, function(error){
			if(error){
				$scope.alerts.push({'type': 'danger', 'msg': error.message});
				return false;
			}
			$scope.$parent.go("#/security");
		});
	};
	
	$scope.loadBI = function(){
		var options = {
			url: appConfig.url + "/installer/gi",
			method: "get"
		};
		
		ngDataApi.get($scope, options, function(error, response) {
			if (error) {
				$scope.alerts.push({'type': 'danger', 'msg': error.message});
				return false;
			}
			
			$scope.gi = {
				domain: (response && response.domain)? response.domain : "soajs.org",
				api: (response && response.api)? response.api : "dashboard-api",
				site: (response && response.site)? response.site : "dashboard",
				wrkDir: (response && response.wrkDir)? response.wrkDir : "/opt",
				email: (response && response.email)? response.email : "me@localhost.com",
				username: (response && response.username)? response.username : "owner",
				password: (response && response.password)? response.password : "password"
			};
			$scope.disableWrkDir = response ? response.disableWrkDir : false;
		});
	};
	$scope.loadBI();
}]);