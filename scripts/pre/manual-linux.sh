#!/bin/bash

TERRAFORM_VERSION=0.11.7

# install MongoDB & Nginx
sudo apt-get update && sudo apt-get install -y mongodb nginx curl unzip
sudo service mongodb start
sudo service nginx stop

# install terraform
curl -o terraform.zip https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_amd64.zip
unzip terraform.zip -d terraform
mv terraform/* /usr/bin/ && rm -r terraform/ && rm terraform.zip

ps aux | grep mongo
ps aux | grep nginx
