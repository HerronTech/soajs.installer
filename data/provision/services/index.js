'use strict';

var services = [
    {
        "name": "controller",
        "program": ["soajs"],
        "port": 4000,
        "src": {
            "provider": "github",
            "owner": "soajs",
            "repo": "soajs.controller"
        },
        "maintenance": {
            "port": {
                "type": "maintenance"
            },
            "readiness": "/heartbeat",
            "commands": [{
                "label": "Releoad Registry",
                "path": "/reloadRegistry",
                "icon": "registry"
            }, {
                "label": "Statistics Info",
                "path": "/awarenessStat",
                "icon": "awareness"
            }, {
                "label": "Releoad Provision Info",
                "path": "/loadProvision",
                "icon": "provision"
            }]
        }
    },
    {
        "name": "oauth",
        "group": "SOAJS Core Services",
        "program": ["soajs"],
        "port": 4002,
        "requestTimeout": 30,
        "requestTimeoutRenewal": 5,
        "swagger": false,
        "src": {
            "provider": "github",
            "owner": "soajs",
            "repo": "soajs.oauth"
        },
        "maintenance": {
            "commands": [{
                "label": "Releoad Provision",
                "path": "/loadProvision",
                "icon": "provision"
            }, {
                "label": "Releoad Registry",
                "path": "/reloadRegistry",
                "icon": "registry"
            }, {
                "label": "Resource Info",
                "path": "/resourceInfo",
                "icon": "info"
            }],
            "port": {
                "type": "maintenance"
            },
            "readiness": "/heartbeat"
        }
    },
    {
        "name": "urac",
        "group": "SOAJS Core Services",
        "program": ["soajs"],
        "port": 4001,
        "requestTimeout": 30,
        "requestTimeoutRenewal": 5,
        "swagger": false,
        "src": {
            "provider": "github",
            "owner": "soajs",
            "repo": "soajs.urac"
        },
        "maintenance": {
            "port": {
                "type": "maintenance"
            },
            "readiness": "/heartbeat",
            "commands": [{
                "label": "Releoad Registry",
                "path": "/reloadRegistry",
                "icon": "registry"
            }, {
                "label": "Resource Info",
                "path": "/resourceInfo",
                "icon": "info"
            }]
        }
    },
    {
        "name": "multitenant",
        "group": "SOAJS Core Services",
        "program": ["soajs"],
        "port": 4004,
        "requestTimeout": 30,
        "requestTimeoutRenewal": 5,
        "swagger": false,
        "src": {
            "provider": "github",
            "owner": "soajs",
            "repo": "soajs.multitenant"
        },
        "maintenance": {
            "port": {
                "type": "maintenance"
            },
            "readiness": "/heartbeat",
            "commands": [{
                "label": "Releoad Registry",
                "path": "/reloadRegistry",
                "icon": "registry"
            }, {
                "label": "Resource Info",
                "path": "/resourceInfo",
                "icon": "info"
            }]
        }
    },
    {
        "name": "dashboard",
        "group": "SOAJS Core Services",
        "program": ["soajs"],
        "port": 4003,
        "requestTimeout": 60,
        "requestTimeoutRenewal": 5,
        "swagger": false,
        "src": {
            "provider": "github",
            "owner": "soajs",
            "repo": "soajs.dashboard"
        },
        "maintenance": {
            "port": {
                "type": "maintenance"
            },
            "readiness": "/heartbeat",
            "commands": [{
                "label": "Releoad Registry",
                "path": "/reloadRegistry",
                "icon": "registry"
            }, {
                "label": "Resource Info",
                "path": "/resourceInfo",
                "icon": "info"
            }]
        }
    }
];

module.exports = services;