import winston from "winston";
import fs from 'fs';
import path from 'path';
// Create a Winston logger instance
const logDirectory = "/var/log/webapplogs/";
if (process.env.NODE_ENV === "PROD" && !fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

const logger = winston.createLogger({
  transports:
    process.env.NODE_ENV == "PROD"
      ? [
          new winston.transports.File({
            filename: "/var/log/webapplogs/csye6225.log",
            level: "debug", // Setting logging level to include debug logs
          }),
        ]
      : [
        new winston.transports.File({
          filename: "csye6225.log",
          level: "debug", // Setting logging level to include debug logs
        }),
      ],
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
});

export default logger;