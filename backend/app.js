const express = require('express');
const app = express();
const animeController = require('./src/controllers/MALController');

app.get('/random-anime', async (req, res) => {
  try {
    const randomAnime = await animeController.getRandomAnime();
    res.json(randomAnime);
  } catch (error) {
    console.error('Error while fetching random anime:', error);
    res.status(500).json({ error: 'Error retrieving random anime' });
  }
});

app.get('/random-character/:anime', async (req, res) => {
  try {
    const anime = req.params.anime;
    const randomCharacter = await animeController.getRandomCharacterImage(anime);
    res.json(randomCharacter);
  } catch (error) {
    console.error('Error while fetching random character:', error);
    res.status(500).json({ error: 'Error retrieving random character' });
  }
});

app.get('/user/:username', async (req, res) => {
  try {
    const username = req.params.username;
    const user = await userController.getUserList(username);
    res.json(user);
  } catch (error) {
    console.error('Error while fetching user:', error);
    res.status(500).json({ error: 'Error retrieving user' });
  }
});

app.get('*', (req, res) => {
  res.status(404).json({ error: 'Resource not found' });
});


app.listen(5000, () => {
  console.log('Running on port 5000.');
});

module.exports = app;
