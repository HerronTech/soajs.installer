'use strict';
var app = angular.module('mainApp', ['ui.bootstrap', 'ngRoute', 'ngSanitize', 'ui.select']);

app.config([
	'$routeProvider',
	'$controllerProvider',
	'$compileProvider',
	'$filterProvider',
	'$provide',
	'$sceDelegateProvider',
	function ($routeProvider, $controllerProvider, $compileProvider, $filterProvider, $provide, $sceDelegateProvider) {

		app.compileProvider = $compileProvider;
		navigation.forEach(function (navigationEntry) {
			if (navigationEntry.scripts && navigationEntry.scripts.length > 0) {
				$routeProvider.when(navigationEntry.url.replace('#', ''), {
					templateUrl: navigationEntry.tplPath,
					resolve: {
						load: ['$q', '$rootScope', function ($q, $rootScope) {
							var deferred = $q.defer();
							require(navigationEntry.scripts, function () {
								$rootScope.$apply(function () {
									deferred.resolve();
								});
							});
							return deferred.promise;
						}]
					}
				});
			}
			else {
				if (navigationEntry.tplPath && navigationEntry.tplPath !== '') {
					$routeProvider.when(navigationEntry.url.replace('#', ''), {
						templateUrl: navigationEntry.tplPath
					});
				}
			}
		});

		$routeProvider.otherwise({
			redirectTo: navigation[0].url.replace('#', '')
		});

		app.components = {
			controller: $controllerProvider.register,
			service: $provide.service
		};
	}
]);

app.controller('mainCtrl', ['$scope', '$location', '$routeParams', '$timeout', function ($scope, $location, $routeParams, $timeout) {
	
	$scope.go = function (path) {
		if (path) {
			$location.path(path.replace("#", ""));
		}
	};
	
	$scope.$on('$routeChangeSuccess', function (event, current, previous) {

		$scope.currentLocation = $location.path();
		if(previous || ['/gi','/security', '/clusters','/deployment'].indexOf($scope.currentLocation) !== -1 ){
			$scope.playSimulation(true);
			if($scope.currentLocation.replace("/", "") === ""){
				$scope.activateMenu("home");
			}
			else{
				$scope.activateMenu($scope.currentLocation.replace("/", ""));
			}
		}
		else{
			if(document.cookie === 'soajsInstall=true'){
				$scope.playSimulation(true);
				$scope.activateMenu("home");
			}
		}

		for (var entry = 0; entry < navigation.length; entry++) {
			var urlOnly = navigation[entry].url.replace('/:anchor?', '').replace("/:section?", '');
			if (urlOnly === '#' + $scope.currentLocation) {
				if (navigation[entry].title && navigation[entry].title !== '') {
					jQuery('head title').html(navigation[entry].title);
				}

				if (navigation[entry].keywords && navigation[entry].keywords !== '') {
					jQuery('head meta[name=keywords]').attr('content', navigation[entry].keywords);
				}

				if (navigation[entry].description && navigation[entry].description !== '') {
					jQuery('head meta[name=description]').attr('content', navigation[entry].description);
				}
			}
		}
	});

	$scope.playSimulation = function(fast){
		document.cookie = "soajsInstall=true";
		var t2 = (fast) ? 100 : 1500;
		var t3 = (fast) ? 1000 : 2100;
		var t4 = (fast) ? 500 : 2100;
		hideContent();
		moveMenuUp();

		$timeout(function(){
			showTopMenu();
		},t2);

		$timeout(function(){
			showBody();
		},t3);

		$timeout(function(){
			showFooter();
		},t4);

	};

	$scope.activateMenu = function(id){
		jQuery('li.menuItem').removeClass('active');
		if(id && id !== ''){
			jQuery('#'+id).addClass('active');
		}
	};
}]);

function moveMenuUp(){
	jQuery("#big").fadeOut();
	jQuery("#menu").addClass("animate");
	jQuery("#menu2").hide();
	window.setTimeout(function(){
		jQuery("#menu .area .title").addClass("title2");
		jQuery("#menu .area .title").addClass('activeMainButton');
	}, 400);
}

function showTopMenu(){
	jQuery("#menu .area .title").fadeIn();
	jQuery("#topMenu").fadeIn();
}

function hideContent(){
	jQuery("#content").hide();
	jQuery("#footer").hide();
}

function showBody(){
	jQuery("#content").fadeIn();
	resizeContent();
}

function resizeContent(){
	var documentHeight = document.body.scrollHeight;
	var screenHeight = window.innerHeight;
	var biggerHeight = (documentHeight >= screenHeight) ? documentHeight : screenHeight;
	var menuHeight = parseInt(jQuery("#menu").css('height'));
	
	biggerHeight -= menuHeight;
	jQuery("#content").height(biggerHeight + "px");
}

function showFooter(){
	jQuery("#footer").fadeIn();
}

function syntaxHighlight(json) {
	if (typeof json != 'string') {
		json = JSON.stringify(json, undefined, 2);
	}
	json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
		var cls = 'number';
		if (/^"/.test(match)) {
			if (/:$/.test(match)) {
				cls = 'key';
			} else {
				cls = 'string';
			}
		} else if (/true|false/.test(match)) {
			cls = 'boolean';
		} else if (/null/.test(match)) {
			cls = 'null';
		}
		return '<span class="' + cls + '">' + match + '</span>';
	});
}

app.directive('topMenu', function () {
	return {
		restrict: 'E',
		templateUrl: 'app/templates/topMenu.html'
	}
});

app.directive('ngConfirmClick', [
	function () {
		return {
			priority: -1,
			restrict: 'A',
			link: function (scope, element, attrs) {
				element.bind('click', function (e) {
					var message = attrs.ngConfirmClick;
					if (message && !confirm(message)) {
						e.stopImmediatePropagation();
						e.preventDefault();
					}
				});
			}
		}
	}
]);
