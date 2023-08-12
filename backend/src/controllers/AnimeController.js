const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const MAL_API_URL = 'https://api.myanimelist.net/v2/anime/ranking';

const MAL_CLIENT_ID = process.env.MAL_CLIENT_ID;

const getRandomAnime = async () => {
  try {
    // Faites une requête à l'API MyAnimeList pour obtenir un anime aléatoire.
    const response = await axios.get(MAL_API_URL, {
      params: {
        ranking_type: 'all', // Requête vide pour obtenir un anime totalement aléatoire
        limit: 500,
      },
      headers: {
        'X-MAL-CLIENT-ID': MAL_CLIENT_ID,
      },
    });

    // Extract the "data" field from the response
    const animeData = response.data.data;
    const randomIndex = Math.floor(Math.random() * animeData.length);
    return animeData[randomIndex].node.title;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'anime aléatoire :', error);
    throw error;
  }
};

module.exports = {
    getRandomAnime,
};
