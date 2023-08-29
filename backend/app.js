const express = require('express');
const cors = require("cors");
const app = express();
const MALController = require('./src/controllers/MALController');

app.use(cors());

app.get('/randomUserAnime/:user', async (req, res) => {
  try {
    const user = req.params.user;
    const randomUserAnime = await MALController.getRandomUserAnime(user);
    res.json(randomUserAnime);
  } catch (error) {
    console.error('Error while fetching random user anime:', error);
    res.status(500).json({ error: 'Error retrieving random anime from user list' });
  }
});

app.get('/randomTopAnime/:top', async (req, res) => {
  try {
    const top = req.params.top;
    const randomTopAnime = await MALController.getRandomTopAnime(top);
    res.json(randomTopAnime);
  } catch (error) {
    console.error('Error while fetching random top anime:', error);
    res.status(500).json({ error: 'Error retrieving random anime from top list' });
  }
});

app.get('/randomCharacterInformations/:anime/:difficulty', async (req, res) => {
  try {
    const anime = req.params.anime;
    const difficulty = req.params.difficulty;
    const randomCharacterInformations = await MALController.getRandomCharacterInformations(anime, difficulty);
    res.json(randomCharacterInformations);
  } catch (error) {
    console.error('Error while fetching random character image:', error);
    res.status(500).json({ error: 'Error retrieving random character image' });
  }
});

app.get('*', (req, res) => {
  res.status(404).json({ error: 'Resource not found' });
});

app.listen(5000, () => {
  console.log('Running on port 5000.');
});

module.exports = app;
