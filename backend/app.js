// app.js
const express = require('express');
const app = express();
const animeController = require('./src/controllers/AnimeController');
const userController = require('./src/controllers/UserController');

app.get('/random-anime', async (req, res) => {
  try {
    const randomAnime = await animeController.getRandomAnime();
    res.json(randomAnime);
  } catch (error) {
    console.error('Error while fetching random anime:', error);
    res.status(500).json({ error: 'Error retrieving random anime' });
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

app.listen(5000, () => {
  console.log('Running on port 5000.');
});

module.exports = app;
