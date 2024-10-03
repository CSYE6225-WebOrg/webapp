import { DataTypes } from "sequelize";
import { sequelize, checkDbConnection } from "../services/connectionService.js";

// Define the User model
checkDbConnection();

export const User = sequelize.define("User",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // Auto generate UUIDs
        primaryKey: true,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
          isEmail: true, // Email field check
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        //password field is not returned in responses
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'first_name', 
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'last_name', 
      },
      account_created: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'account_created',
        
      },
      account_updated: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'account_updated',
        
      },
    },
    {
      tableName: 'users',
      timestamps: false, 
      hooks: {
        beforeUpdate: (user) => {
          user.account_updated = new Date();
        },
        beforeCreate: (user) => {
          user.account_created = new Date();
          user.account_updated = new Date();
        },
      },
    }
  );

    //sync the database connection
    export const syncDb = async () => {
      try {
        await checkDbConnection();
        await User.sync();
        console.log("User model synced successfully.");
      } catch (error) {
        console.error("Error syncing User model:", error);
      }
    };
  

  export default User;