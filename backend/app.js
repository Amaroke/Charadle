// app.js
const express = require('express');
const app = express();
const wordController = require('./src/controllers/CharacterController');
const animeController = require('./src/controllers/AnimeController'); // Import the Anime controller


app.get('/', (req, res) => {
  res.send('Express on Vercel');
});

app.get('/random-word', wordController.getRandomWord);

app.get('/random-anime', async (req, res) => {
  try {
    console.log('Fetching random anime...');
    const randomAnime = await animeController.getRandomAnime();
    res.json(randomAnime);
  } catch (error) {
    console.error('Error while fetching random anime:', error);
    res.status(500).json({ error: 'Error retrieving random anime' });
  }
});

app.listen(5000, () => {
  console.log('Running on port 5000.');
});

module.exports = app;
