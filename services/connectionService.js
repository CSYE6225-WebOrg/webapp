import { Sequelize } from 'sequelize';
import { config } from "dotenv";
config();

// Create Sequelize instance for PostgreSQL
// Database connection details are read from .env file
export const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT || 'postgres',
    logging: false,  // Disable SQL query logging
  }
);


// Function to test database connectivity for controller to utilize
export const checkDbConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection to the database has been established successfully.');
    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    return false;
  }
};


  

export default {
  sequelize,
  checkDbConnection
};