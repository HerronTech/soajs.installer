"use strict";

app.service('ngDataApi', ['$http', function ($http) {
	
	function returnAPIError(scope, opts, status, headers, config, cb) {
		console.log("Error: ngDataApi->" + opts.api);
		console.log(status, headers, config);
		return cb(new Error("Unable Fetching data from " + config.url));
	}
	
	function returnAPIResponse(scope, response, config, cb) {
		if (response && response.result === true) {
			var resp = {};
			for (var i in response) {
				resp[i] = response[i];
			}
			
			if (typeof(resp.data) !== 'object') {
				resp.data = {};
			}
			
			return cb(null, resp.data);
		}
		else {
			var str = '';
			for (var i = 0; i < response.errors.details.length; i++) {
				str += "Error[" + response.errors.details[i].code + "]: " + response.errors.details[i].message;
			}
			var errorObj = {
				message: str,
				codes: response.errors.codes,
				details: response.errors.details
			};
			if (response.errors.codes && response.errors.codes[0]) {
				errorObj.code = response.errors.codes[0];
			}
			return cb(errorObj);
		}
	}
	
	function executeRequest(scope, opts, cb) {
		var config = {
			url: opts.url,
			method: opts.method,
			params: opts.params || {},
			xsrfCookieName: opts.cookie || "",
			cache: opts.cache || false,
			timeout: opts.timeout || 60000,
			responseType: opts.responseType || 'json',
			headers: opts.headers || {},
			data: opts.data || {},
			json: true
		};
		
		if (opts.jsonp === true) {
			config.url += (config.url.indexOf('?') === -1) ? '?' : '&';
			config.url += "callback=JSON_CALLBACK";
			config.method = (config.method.toLowerCase() === 'get') ? 'jsonp' : config.method;
		}
		
		$http(config).success(function (response, status, headers, config) {
			returnAPIResponse(scope, response, config, cb);
		}).error(function (errData, status, headers, config) {
			returnAPIError(scope, opts, status, headers, config, cb);
		});
	}
	
	function getData(scope, opts, cb) {
		opts.method = 'GET';
		opts.api = 'getData';
		executeRequest(scope, opts, cb);
	}
	
	function postData(scope, opts, cb) {
		opts.method = 'POST';
		opts.api = 'sendData';
		executeRequest(scope, opts, cb);
	}
	
	function putData(scope, opts, cb) {
		opts.method = 'PUT';
		opts.api = 'putData';
		executeRequest(scope, opts, cb);
	}
	
	function delData(scope, opts, cb) {
		opts.method = 'DELETE';
		opts.api = 'delData';
		executeRequest(scope, opts, cb);
	}
	
	return {
		'get': getData,
		'post': postData,
		'put': putData,
		'del': delData
	};
}]);