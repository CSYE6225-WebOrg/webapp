import { DataTypes } from "sequelize";
import { sequelize, checkDbConnection } from "../services/connectionService.js";

export const Token = sequelize.define('Token', 
{
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4, // Auto generate UUIDs
    primaryKey: true,
    allowNull: false,    
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users', // Assumes a User model table named 'Users'
      key: 'id'
    },
    field: 'user_id', 
  },
  token: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'expires_at', 
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at', 
  },
}, {
  tableName: 'tokens',
  timestamps: false,
  hooks: {
    beforeCreate: (token) => {
      token.created_at = new Date();
    },
  },
});

export default Token;
