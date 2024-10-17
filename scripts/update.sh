#!/bin/bash

echo "Updating package lists..."
sudo apt-get update

echo "Upgrading installed packages..."
sudo apt-get upgrade -y

echo "Cleaning up..."
sudo apt-get clean