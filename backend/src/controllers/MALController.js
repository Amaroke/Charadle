const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const MAL_API_URL = 'https://api.myanimelist.net/v2/';
const cheerio = require('cheerio');
const MAL_CLIENT_ID = process.env.MAL_CLIENT_ID;

const getRandomUserAnime = async (username) => {
  try {
    const apiUrl = `${MAL_API_URL}users/${username}/animelist`;

    const response = await axios.get(apiUrl, {
      params: {
        fields: 'list_status',
        limit: 1000,
        status: 'completed',
      },
      headers: {
        'X-MAL-CLIENT-ID': MAL_CLIENT_ID,
      },
    });

    const userAnimeList = response.data.data;
    const randomIndex = Math.floor(Math.random() * userAnimeList.length);
    return userAnimeList[randomIndex].node.id + ' ' + userAnimeList[randomIndex].node.title;

  } catch (error) {
    console.error('Error while fetching random anime from user list :', error);
    throw error;
  }
};

const getRandomTopAnime = async () => {
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
    return animeData[randomIndex].node.id + ' ' + animeData[randomIndex].node.title;

  } catch (error) {
    console.error('Error while fetching random anime :', error);
    throw error;
  }
};

const getRandomCharacterImageName = async (anime) => {
  try {
    const randomCharacter = await getRandomCharacter(anime);
    const randomIndex = Math.floor(Math.random() * randomCharacter.data.length);
    const randomCharacterData = randomCharacter.data[randomIndex];
    const characterId = randomCharacterData.node.id;
    const imageUrl = await getImageNameForCharacter(characterId);
    return imageUrl;

  } catch (error) {
    console.error('Error while fetching random character image:', error);
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

    const randomCharacter = response.data;
    return randomCharacter;

  } catch (error) {
    console.error('Error while fetching random character :', error);
    throw error;
  }
};

const getImageNameForCharacter = async (characterId) => {
  try {
    const characterUrl = `https://myanimelist.net/character/${characterId}`;
    const response = await axios.get(characterUrl);
    const $ = cheerio.load(response.data);
    const imageUrl = $('img.portrait-225x350').attr('data-src');
    const name = $('h2.normal_header').text();

    const characterImageName = {
      imageUrl: imageUrl,
      name: name
    };
    
    return characterImageName;
  } catch (error) {
    console.error('Error while fetching character image:', error);
    throw error;
  }
};

module.exports = {
  getRandomUserAnime,
  getRandomTopAnime,
  getRandomCharacterImageName,
};
