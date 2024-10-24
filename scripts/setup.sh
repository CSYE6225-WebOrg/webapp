#!/bin/bash



echo "installing nodejs..."
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "Installing npm"
sudo apt-get install npm -y

sudo node -v
sudo npm -v

