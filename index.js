//initiating the app
import {app} from './app.js';

// Start the server on the defined env port
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
