'use strict';
//done
var mappings = [
	{
		"_type": 'template',
		"_name": 'filebeat',
		"_json": {
			"mappings": {
				"_default_": {
					"_all": {
						"enabled": true,
						"norms": {
							"enabled": false
						}
					},
					"dynamic_templates": [
						{
							"template1": {
								"mapping": {
									"doc_values": true,
									"ignore_above": 1024,
									"index": "not_analyzed",
									"type": "{dynamic_type}"
								},
								"match": "*"
							}
						}
					],
					"properties": {
						"@timestamp": {
							"type": "date"
						},
						"message": {
							"type": "string",
							"index": "analyzed"
						},
						"offset": {
							"type": "long",
							"doc_values": "true"
						},
						"bytes": {
							"type": "long"
						},
						"geoip"  : {
							"type" : "object",
							"dynamic": true,
							"properties": {
								"ip": {
									"type": "ip"
								},
								"latitude": {
									"type": "float"
								},
								"location": {
									"type": "geo_point"
								},
								"longitude": {
									"type": "float"
								}
							}
						}
					}
				}
			},
			"settings": {
				"index": {
					"refresh_interval": "5s"
				}
			},
			"template": "filebeat-*"
		}
	},
];

module.exports = mappings;