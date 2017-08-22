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
	
	$scope.fillBI = function(){
		var data = angular.copy($scope.gi);
		var options = {
			url: appConfig.url + "/installer/gi",
			method: "post",
			data: {
				"gi": data
			}
		};
		
		ngDataApi.post($scope, options, function(error, response){
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
				portal: (response && response.portal)? response.portal : "portal",
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