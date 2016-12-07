"use strict;"
module.exports = {
  "servers": [
    {
      "host": "dashboard-soajsdata",
      "port": 32017
    }
  ],
  "credentials": {},
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
  "streaming": {},
  "name": "core_provision",
  "prefix": "kube_"
};