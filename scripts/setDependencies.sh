#!/bin/bash

sudo groupadd csye6225
sudo adduser csye6225 --shell /usr/sbin/nologin --ingroup csye6225
sudo passwd -l csye6225
chmod 705 /tmp/systemDService.service
sudo cp /tmp/systemDService.service /etc/systemd/system/

cd /opt/cloud/ || exit

sudo chown -R csye6225:csye6225 webapp 

sudo chmod -R 755 /opt/cloud/webapp

cd /opt/cloud/webapp/ || exit

# env_values=$(cat <<END
# PORT=$PORT
# DIALECT=$DIALECT
# END
# )

# echo "$env_values" | sudo tee .env >/dev/null

# sudo chown csye6225:csye6225 .env 

echo ".env file created"
sudo npm -v
sudo npm i

echo "NPM packages installed successfully."
