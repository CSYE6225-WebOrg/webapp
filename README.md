# Cloud Native Web Application
- This is a Node.js REST API built with Express and PostgreSQL using Sequelize ORM. The API provides a health check endpoint (/healthz) that checks the connection to a PostgreSQL database and returns appropriate HTTP status codes. 

## Prerequisites for running the API
- Before building and deploying the application locally, ensure that the following tools are installed:
  
1. Node.js: Install Node.js
   - Verify node and npm versions using following commands.
      - node -v
      - npm -v
  
2. PostgreSQL: Install PostgreSQL
   - Create a PostgreSQL database and user with the required permissions using cmd or pgAdmin4:
      - psql -U postgres
      - CREATE DATABASE your_database_name;
      - CREATE USER your_postgres_user WITH ENCRYPTED PASSWORD 'your_password';
      - GRANT ALL PRIVILEGES ON DATABASE your_database_name TO your_postgres_user;

3. dotenv, Express, Sequelize and other dependencies
   - Install while initiating the app.
  
## Steps to run the API

1. Clone the repository
   ```
   git clone https://github.com/CSYE6225-WebOrg/webapp.git
   cd health-check-api
   ```
2. Initiate Node project
   ```
   npm init -y
   ```
3. Install dependencies like Express, Sequelize(pg, pg-hstore), dotenv, jest, babel
   ```
   npm install express sequelize pg pg-hstore dotenv
   npm install --save-dev jest supertest @babel/core @babel/preset-env babel-jest
   ```
4. Create a .env file and add the following parameters.
   ```
   PORT=port for api to run on
   DB_NAME=db_name
   DB_USER=your_user
   DB_PASSWORD=your_password
   DB_HOST=localhost
   DB_PORT=DB server port
   DB_DIALECT=postgres
   ```
5. Run the app using following commands.
    ```
    npm run dev
    ```
6. Hit api using curl or configure postman or Bruno
    ```
    curl -X GET http://localhost:8080/healthz

    ```
7. Run the test module using following command.
   ```
   npm test
   ```

## API Endpoints
- API Endpoints
- Health Check Endpoint
    ```
    URL: /healthz
    Method: GET
    Description: Checks the database connection and returns:
        200 OK if the database connection is successful.
        503 Service Unavailable if the database connection fails.
    ```
- Error Handling
    ```
    400 Bad Request: If the request contains an unexpected payload.
    405 Method Not Allowed: If an unsupported method (e.g., POST, PUT) is used on the /healthz endpoint.
    ```
