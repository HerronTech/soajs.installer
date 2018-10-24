"use strict";
var securityApp = app.components;
securityApp.controller('securityCtrl', ['$scope', 'ngDataApi', '$modal', function($scope, ngDataApi, $modal) {
	$scope.alerts = [];
	
	$scope.goBack = function(){
		$scope.$parent.go("#/gi");
	};
	
	$scope.closeAlert = function(i){
		$scope.alerts.splice(i, 1);
	};
	
	$scope.skip = function(){
		$scope.$parent.go("#/resources");
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
			
			if(response.extKey){
				var currentScope = $scope;
				var keyModal = $modal.open({
					templateUrl: 'keyModal.tmpl',
					size: 'lg',
					backdrop: true,
					keyboard: true,
					controller: function ($scope) {
						$scope.newExtKey = response.extKey;
						$scope.proceedToClusters = function () {
							keyModal.close();
							currentScope.$parent.go("#/resources");
						};
					}
				});
			}
			else{
				$scope.$parent.go("#/resources");
			}
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
			
			resizeContent();
		});
	};
	$scope.loadSecurity();
}]);