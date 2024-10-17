#!/bin/bash

sudo cp /tmp/systemDService.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable systemDService
sudo systemctl start systemDService