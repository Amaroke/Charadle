// Add Express
const express = require("express");
// Initialize Express
const app = express();
const wordController = require('./src/controllers/CharacterController');

// Create GET request
app.get("/", (req, res) => {
  res.send("Express on Vercel");
});

app.get('/random-word', wordController.getRandomWord);

// Initialize server
app.listen(5000, () => {
  console.log("Running on port 5000.");
});
// Export the Express API
module.exports = app;

