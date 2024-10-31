//Defining the app and entry point(route)
import {config} from 'dotenv';
import express from 'express';
import multer from 'multer';
import router from './routes/index.js';
import { syncDb } from './services/syncService.js';
import { checkDbConnection } from './services/connectionService.js';

config();
checkDbConnection();
syncDb();
export const app = express();


// Middleware for parsing JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {fileSize: 5 * 1024 * 1024}
});


// API routes(entry points)
app.use('/', router);

export default app;