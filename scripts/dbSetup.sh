#!/bin/bash

sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
sudo -u postgres createdb "$DB_NAME" --owner="$DB_USER"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"

sudo -u postgres psql -c "ALTER DATABASE $DB_NAME OWNER TO $DB_USER"

echo "Restart postgres"
sudo systemctl restart postgresql