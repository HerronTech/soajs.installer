# soajs.installer

The SOAJS installer is a ready to use application that facilitates installing the SOAJS Console on your machine as well as installing docker swarm and kubernetes and connecting to them.

The installer also extends the functionality of the SOAJS Console after the later is installed and empowers it with the ability to start and stop SOAJS Ready Made Services under manual development environments.

The installer is also equipped with a remote cloud deployer that allow you to deploy the SOAJS Console using container technology on any remote container cluster running Docker Swarm or Kubernetes.

## Package Content
This package contains:
- MongoDB Server 
- NodeJS
- NPM
- Docker 
- Kubernetes
- Remote Cloud SOAJS installer
 

## Installation
After you download and unzip the installer, simply run the **INSTALL** script which creates symbolic links to the executable files in your /usr/bin (ubuntu) or /usr/local/bin (osx) directory.
```
# run the installation script
> cd soajs.installer
> ./INSTALL
```
Once the installation is complete, you can invoke both **node** and **soajs** executables from your terminal regardless of the location you are in.
Ex:
```
# go to your home directory
> cd ~

# start mongodb server using soajs installer
> soajs mongo start

# install soajs console
> soajs console install [% destination_folder %]
```

## Usage
The installer is equipped with multiple commands that you can become familiar with by opening its manual.
```
# Open the installer manual
> soajs --help
``` 

#### Compatibility
The installer is compatible with **Mac OSX** and **Ubuntu** distributions.