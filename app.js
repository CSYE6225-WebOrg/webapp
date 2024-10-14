//Defining the app and entry point(route)
import {config} from 'dotenv';
import express from 'express';
import router from './routes/index.js';
import { syncDb } from '../webapp/models/user.js';
import { checkDbConnection } from './services/connectionService.js';

config();
checkDbConnection();
  //syncDb();
export const app = express();

// Middleware for parsing JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// API routes(entry points)
app.use('/', router);

export default app;
