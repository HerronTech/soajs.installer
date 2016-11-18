"use strict";

module.exports = {
	type: 'service',
	prerequisites: {
		cpu: '',
		memory: ''
	},
	serviceVersion: 1,
	serviceName: "installer",
	serviceGroup: "SOAJS Installer",
	requestTimeout: 30,
	requestTimeoutRenewal: 5,
	servicePort: 1337,
	extKeyRequired: false,
	"errors": {},
	"schema": {
		'get': {
			'/overview' :{
				"_apiInfo":{
					"l": "Load Overview"
				}
			},
			'/installer/gi' :{
				"_apiInfo":{
					"l": "Load General Information"
				}
			},
			'/installer/security' :{
				"_apiInfo":{
					"l": "load Security Information"
				}
			},
			'/installer/clusters' :{
				"_apiInfo":{
					"l": "Load Clusters Information"
				}
			},
			'/installer/deployment' :{
				"_apiInfo":{
					"l": "Load Deployment Information"
				}
			},
			'/installer/go' :{
				"_apiInfo":{
					"l": "Proceed with Installing SOAJS"
				}
			}
		},
		'post': {
			'/overview' :{
				"_apiInfo":{
					"l": "Fill Overview"
				},
				'overview': {
					"source":['body.overview'],
					"required": false,
					'validation':{
						"type": "object",
						"properties": {
							"deployType" : {"type": "string", "required": true, "enum": ["manual", "container"]},
							"deployDriver": {
								"type": "string",
								"required": true,
								"enum": ["manual", "container.docker.local", "container.docker.remote", "container.kubernetes.local", "container.kubernetes.remote"]
							}
						},
						"additionalProperties": false
					}
				}
			},
			'/installer/gi' :{
				"_apiInfo":{
					"l": "Override General Information"
				},
				'gi': {
					"source":['body.gi'],
					"required": false,
					'validation':{
						"type": "object",
						"properties": {
							"api": {"type": "string", "required": false},
							"site": {"type": "string", "required": false},
							"domain": {"type": "string", "required": false, "format": "hostname"},
							"wrkDir": {"type": "string", "required": false, "pattern": /^\/[_a-zA-Z\/][_a-zA-Z0-9\/:]*$/},
							"username": {"type": "string", "required": false},
							"email": {"type": "string", "required": false, "format": "email"},
							"password": {"type": "string", "required": false}
						},
						"additionalProperties": false
					}
				}
			},
			'/installer/security' :{
				"_apiInfo":{
					"l": "Override Security Information"
				},
				'security':{
					'source': ['body.security'],
					'required': false,
					'validation':{
						"type": "object",
						"properties": {
							"key": {"type": "string", "required": false},
							"cookie": {"type": "string", "required": false},
							"session": {"type": "string", "required": false}
						},
						"additionalProperties": false
					}
				}
			},
			'/installer/clusters' :{
				"_apiInfo":{
					"l": "Override Clusters Information"
				},
				"clusters": {
					"source": ["body.clusters"],
					"required": false,
					"validation":{
						"type": "object",
						"properties": {
							"prefix": {"type": "string"},
							"servers": {
								"type": "array",
								"required": false,
								"items": {
									"host": {"type": "string", "required": true},
									"port": {"type": "number", "required": true, "min": 0},
								},
								"minItems": 1,
								"uniqueItems": true
							},
							"credentials": {
								"type": "object",
								"properties": {
									"username": {"type": "string"},
									"password": {"type": "string"}
								}
							},
							"URLParam": {"type": "object", "properties": {}},
							"extraParam": {"type": "object", "properties": {}},
							"streaming": {"type": "object", "properties": {}},
						},
						"additionalProperties": false
					}
				}
			},
			'/installer/deployment' :{
				"_apiInfo":{
					"l": "Override Deployment Information"
				},
				"deployment": {
					"source":["body.deployment"],
					"required": true,
					"validation":{
						"type": "object",
						// "properties": {
						// 	"containerDir": {"type": "string", "required": false},
						// 	"containerHost": {"type": "string", "required": false, "format": "ipv4"},
						// 	"deployDockerNodes": {"type": "array", "required": false, "items": {"type": "string"}},
						// 	"mongoExt": {"type": "boolean", "required": false}
						// },
						// "additionalProperties": false
					}
				}
			}
		}
	}
};