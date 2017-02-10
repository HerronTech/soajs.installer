# soajs.installer

SOAJS Installer is a web application that serves the purpose of setting up and installing SOAJS.

The installer provides an easy to use guide, and supports multiple modes of deployment: Manual and High Availability.

---

##Installation

```sh
$ npm install soajs.installer
$ cd soajs.installer
$ node .
```
---

##Deployment Modes
* Manual Deployment: Deploys SOAJS on the local machine. This mode consumes the least number of CPU and memory. 
However, it does not provide high availablity to the user.
* Cloud Deployment: Deploys SOAJS on a machine using containers. This mode requires a clustering and scheduling tool (i.e., 
kubernetes, docker). However, this mode provides high availability to the user.

##Note
Cloud deployment supports the installation of SOAJS either on a local machine, or on any remote machine.