'use strict';

var fs = require('fs');

var machineIP = process.env.SOAJS_MACHINE_IP || '127.0.0.1';
var machinePort = process.env.SOAJS_MACHINE_PORT || 8443;

var dataLayer = {
    mongo: {
        external: process.env.SOAJS_MONGO_OBJECTROCKET || process.env.SOAJS_MONGO_EXTERNAL || false,
        srvCount: 1
    },
    elasticsearch: {
        external: process.env.SOAJS_ELASTIC_EXTERNAL || false
    }
};

if (dataLayer.mongo.external) {
    dataLayer.mongo.url = process.env.SOAJS_MONGO_OBJECTROCKET_URL || process.env.SOAJS_MONGO_EXTERNAL_URL;
    dataLayer.mongo.port = process.env.SOAJS_MONGO_OBJECTROCKET_URL_PORT || process.env.SOAJS_MONGO_EXTERNAL_PORT;
    dataLayer.mongo.username = process.env.SOAJS_MONGO_USERNAME;
    dataLayer.mongo.password = process.env.SOAJS_MONGO_PASSWORD;
    dataLayer.mongo.ssl = process.env.SOAJS_MONGO_SSL;
    dataLayer.mongo.authDb = process.env.SOAJS_MONGO_AUTH_DB;
}

if (dataLayer.elasticsearch.external) {
    dataLayer.elasticsearch.url = process.env.SOAJS_ELASTIC_EXTERNAL_URL;
    dataLayer.elasticsearch.port = process.env.SOAJS_ELASTIC_EXTERNAL_PORT;
    dataLayer.elasticsearch.username = process.env.SOAJS_ELASTIC_USERNAME;
    dataLayer.elasticsearch.password = process.env.SOAJS_ELASTIC_PASSWORD;
}

var config = {

    dataLayer: dataLayer,

    coreDB: {
        "name": "core_provision",
        "prefix": "",
        "servers": [
            {
                "host": ((dataLayer.mongo.external) ? dataLayer.mongo.url : machineIP),
                "port": 31000
            }
        ],
        "credentials": ((dataLayer.mongo.username && dataLayer.mongo.password) ? { username: dataLayer.mongo.username, password: dataLayer.mongo.password } : null),
        "URLParam": {
            "maxPoolSize": 2,
            "ssl": ((dataLayer.mongo.ssl) ? dataLayer.mongo.ssl : null)
        },
        "extraParam": {
            "db": {
                "authSource": ((dataLayer.mongo.authDb) ? dataLayer.mongo.authDb : null),
                "bufferMaxEntries": 0
            }
        }
    },

    dockerCollName: 'docker',

    defaultMasterDomain: 'soajs.org',
    servicesPath: __dirname + '/services/',
    mappingsPath: __dirname + '/mappings/',

    paths: {
        services: {
            dir: __dirname + '/services/',
            fileType: 'js'
        }
    },

    machineIP: machineIP,
    machinePort: machinePort,
    certsPath: process.env.SOAJS_KUBE_CERTS_PATH || process.env.HOME + '/.minikube',

    defaultMongoPort: 27017,

    objectRocket: process.env.SOAJS_MONGO_OBJECTROCKET,

    mongoServices: {
        dashboard: {
            name: 'dashboard-soajsdata',
            ips: []
        },
        dev: {
            name: 'dev-soajsData',
            ips: []
        }
    },

    deployGroups: ['db', 'core', 'nginx'],

    kubeConfig: {
        url: 'https://' + machineIP + ':' + machinePort,
        namespace: 'default'
    },

    swarmConfig: {
        tokens: {}
    }
};

module.exports = config;
