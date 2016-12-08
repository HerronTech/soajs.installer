#!/bin/bash

# Install Xcode command-line tools, this is recommended for brew
xcode-select --install

# Install Brew
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
brew update
brew upgrade
brew services

# Install NodeJS, MongoDB, Nginx
brew install node mongodb nginx
brew services start mongodb
brew services stop nginx

ps aux | grep mongo
ps aux | grep nginx