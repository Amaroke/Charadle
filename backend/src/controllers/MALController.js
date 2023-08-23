const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const MAL_API_URL = 'https://api.myanimelist.net/v2/';
const cheerio = require('cheerio');
const MAL_CLIENT_ID = process.env.MAL_CLIENT_ID;

const getUserList = async (username) => {
  try {
      const apiUrl = `${MAL_API_URL}/users/${username}/animelist`;

      const response = await axios.get(apiUrl, {
          params: {
              fields: 'list_status',
              limit: 1000,
          },
          headers: {
              'X-MAL-CLIENT-ID': MAL_CLIENT_ID,
          },
      });

      const userListData = response.data.data;
      return userListData;
  } catch (error) {
      console.error('Error while fetching user :', error);
      throw error;
  }
};


const getRandomAnime = async () => {
  try {
    const apiUrl = `${MAL_API_URL}anime/ranking`;
    
    const response = await axios.get(apiUrl, {
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

const getRandomCharacter = async (anime) => {
  try {
    const apiUrl = `${MAL_API_URL}anime/${anime}/characters`;

    const response = await axios.get(apiUrl, {
        headers: {
            'X-MAL-CLIENT-ID': MAL_CLIENT_ID,
        },
    });

    const characterData = response.data;
    return characterData;
} catch (error) {
    console.error('Error while fetching character :', error);
    throw error;
}
};

// Fonction pour récupérer l'image du personnage à partir de son ID
const getImageForCharacter = async (characterId) => {
  try {
    // Construire l'URL de la page du personnage
    const characterUrl = `https://myanimelist.net/character/${characterId}`;

    // Effectuer une requête HTTP pour obtenir le contenu HTML de la page du personnage
    const response = await axios.get(characterUrl);

    // Analyser le HTML avec Cheerio
    const $ = cheerio.load(response.data);

    // Extraire l'URL de l'image du personnage (assurez-vous de trouver le sélecteur CSS approprié)
    const imageUrl = $('img.portrait-225x350').attr('data-src');

    return imageUrl;
  } catch (error) {
    console.error('Error while fetching character image:', error);
    throw error;
  }
};

// Fonction principale pour obtenir une image de personnage aléatoire
const getRandomCharacterImage = async (anime) => {
  try {
    const characterData = await getRandomCharacter(anime);

    // Sélectionnez aléatoirement une ID à partir des données obtenues
    const randomIndex = Math.floor(Math.random() * characterData.data.length);

    const randomCharacter = characterData.data[randomIndex];
    
    // Obtenez l'ID du personnage
    const characterId = randomCharacter.node.id;
    
    // Utilisez l'ID pour obtenir l'image du personnage
    const imageUrl = await getImageForCharacter(characterId);

    return imageUrl;
  } catch (error) {
    console.error('Error while fetching random character image:', error);
    throw error;
  }
};


module.exports = {
  getRandomAnime,
  getRandomCharacter,
  getUserList
};
