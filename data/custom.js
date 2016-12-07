"use strict";
module.exports = {
  "deployment": {
    "deployType": "container",
    "deployDriver": "container.kubernetes.local",
    "deployDockerNodes": [],
    "containerHost": "192.168.99.100",
    "imagePrefix": "soajsorg",
    "nginxPort": 80,
    "nginxSecurePort": 443,
    "dockerReplica": 1,
    "kubernetes": {
      "containerPort": 8443,
      "containerDir": "/Users/Nicolas/.minikube"
    }
  },
  "gi": {
    "domain": "soajs.org",
    "api": "dashboard-api",
    "site": "dashboard",
    "wrkDir": "/opt",
    "email": "me@localhost.com",
    "username": "owner",
    "password": "password"
  },
  "clusters": {
    "prefix": "kube_",
    "servers": [
      {
        "host": "127.0.0.1",
        "port": 27017
      }
    ],
    "credentials": {
      "username": "",
      "password": ""
    },
    "URLParam": {
      "connectTimeoutMS": 0,
      "socketTimeoutMS": 0,
      "maxPoolSize": 5,
      "wtimeoutMS": 0,
      "slaveOk": true
    },
    "extraParam": {
      "db": {
        "native_parser": true,
        "bufferMaxEntries": 0
      },
      "server": {}
    },
    "streaming": {}
  }
};