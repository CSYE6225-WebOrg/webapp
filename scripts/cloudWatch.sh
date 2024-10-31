#!/bin/bash
echo "Installing cldWatch agent"
sudo wget https://amazoncloudwatch-agent.s3.amazonaws.com/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i -E ./amazon-cloudwatch-agent.deb


sudo mkdir -p /var/log/webapplogs/
sudo chown -R csye6225:csye6225 /opt/cloud/webapp
# sudo mv /tmp/cloudwatch-config.json /opt/cloud/webapp/cloudwatch-config.json
# sudo chown csye6225:csye6225 /opt/cloud/webapp/cloudwatch-config.json