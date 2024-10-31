import { DataTypes } from 'sequelize';
import { sequelize, checkDbConnection } from "../services/connectionService.js";

checkDbConnection();

export const Image = sequelize.define("Image", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  file_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  upload_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  user_id: {
    type: DataTypes.UUID,
    unique: true,
    allowNull: false,
    references: {
      model: 'users', // Assumes a User model table named 'Users'
      key: 'id'
    }
  }
}, {
  timestamps: false, // Disable automatic timestamps
  tableName: 'images' // Specify table name if different from model name
});

export default Image;
