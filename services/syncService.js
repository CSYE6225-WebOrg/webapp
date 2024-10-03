import {User} from '../models/user.js';
import {checkDbConnection} from './connectionService.js';



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


  export default
    {
        syncDb
    };