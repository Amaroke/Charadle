const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const MAL_API_URL = 'https://api.myanimelist.net/v2/anime/ranking';

const MAL_CLIENT_ID = process.env.MAL_CLIENT_ID;

const getRandomAnime = async () => {
  try {
    const response = await axios.get(MAL_API_URL, {
      params: {
        ranking_type: 'all',
        limit: 500,
      },
      headers: {
        'X-MAL-CLIENT-ID': MAL_CLIENT_ID,
      },
    });
    const animeData = response.data.data;
    const randomIndex = Math.floor(Math.random() * animeData.length);
    return animeData[randomIndex].node.title;
  } catch (error) {
    console.error('Error while fetching random anime :', error);
    throw error;
  }
};

module.exports = {
  getRandomAnime,
};
