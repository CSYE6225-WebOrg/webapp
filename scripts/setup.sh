#!/bin/bash

echo "installing postgresql..."
sudo apt-get install -y postgresql postgresql-contrib

echo "installing nodejs..."
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "Installing npm"
sudo apt-get install npm -y

sudo node -v
sudo npm -v


# sudo postgresql-setup --initdb

sudo sed -i 's/^local\s\+all\s\+all\s\+peer/local   all             all                                     trust/' /etc/postgresql/16/main/pg_hba.conf
sudo sed -i 's/^host\s\+all\s\+all\s\+127\.0\.0\.1\/32\s\+scram-sha-256/host    all             all             127.0.0.1\/32            trust/' /etc/postgresql/16/main/pg_hba.conf
sudo sed -i 's/^host\s\+all\s\+all\s\+::1\/128\s\+scram-sha-256/host    all             all             ::1\/128                 trust/' /etc/postgresql/16/main/pg_hba.conf

sudo systemctl start postgresql
sudo systemctl enable postgresql

psql --version