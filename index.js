//initiating the app
const app = require('./app');

// Start the server on the defined env port
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
