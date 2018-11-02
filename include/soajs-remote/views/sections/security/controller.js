"use strict";
var securityApp = app.components;
securityApp.controller('securityCtrl', ['$scope', 'ngDataApi', '$modal', 'uuid', function($scope, ngDataApi, $modal, uuid) {
	$scope.alerts = [];
	
	$scope.goBack = function(){
		$scope.$parent.go("#/gi");
	};
	
	$scope.closeAlert = function(i){
		$scope.alerts.splice(i, 1);
	};
	
	$scope.skip = function(){
		$scope.security = $scope.defaultValues;
		$scope.fillSecurity();
	};
	
	$scope.fillSecurity = function(){
		var data = angular.copy($scope.security);
		var options = {
			url: appConfig.url + "/installer/security",
			method: "post",
			data: {
				"security": data
			}
		};
		
		ngDataApi.post($scope, options, function(error, response){
			if(error){
				$scope.alerts.push({'type': 'danger', 'msg': error.message});
				return false;
			}
			
			$scope.$parent.go("#/resources");
		});
	};
	
	$scope.loadSecurity = function(){
		var options = {
			url: appConfig.url + "/installer/security",
			method: "get"
		};
		
		ngDataApi.get($scope, options, function(error, response) {
			if (error) {
				$scope.alerts.push({'type': 'danger', 'msg': error.message});
				return false;
			}
			
			$scope.security = {};
			if(response){
				for(var i in response){
					$scope.security[i] = response[i];
				}
			}
			
			if(!$scope.security.key || $scope.security.key.trim() === ''){
				$scope.security.key = uuid.v4();
			}
			
			if(!$scope.security.cookie || $scope.security.cookie.trim() === ''){
				$scope.security.cookie = uuid.v4();
			}
			
			if(!$scope.security.session || $scope.security.session.trim() === ''){
				$scope.security.session = uuid.v4();
			}
			
			$scope.defaultValues = angular.copy($scope.security);
			resizeContent();
		});
	};
	
	$scope.loadSecurity();
}]);