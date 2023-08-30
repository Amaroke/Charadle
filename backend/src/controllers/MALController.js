const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();
const cheerio = require('cheerio');
const MAL_API_URL = 'https://api.myanimelist.net/v2/';
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
    const animeID = userAnimeList[randomIndex].node.id;
    const animeURL = `https://myanimelist.net/anime/${animeID}`;
    const axiosGet = await axios.get(animeURL);
    const $ = cheerio.load(axiosGet.data);
    const englishName = $('p.title-english').text();
    let title;
    if (englishName != '') {
      title = topAnimeList[randomIndex].node.title + ' - ' + englishName;
    } else {
      title = topAnimeList[randomIndex].node.title;
    }
    const animeData = {
      id: animeID,
      title: title
    };
    return animeData;

  } catch (error) {
    console.error('Error while fetching random anime from user list :', error);
    throw error;
  }
};

const getRandomTopAnime = async (top) => {
  try {
    const apiUrl = `${MAL_API_URL}anime/ranking`;

    const response = await axios.get(apiUrl, {
      params: {
        ranking_type: 'bypopularity',
        limit: top,
      },
      headers: {
        'X-MAL-CLIENT-ID': MAL_CLIENT_ID,
      },
    });

    const topAnimeList = response.data.data;
    const randomIndex = Math.floor(Math.random() * topAnimeList.length);
    const animeID = topAnimeList[randomIndex].node.id;
    const animeURL = `https://myanimelist.net/anime/${animeID}`;
    const axiosGet = await axios.get(animeURL);
    const $ = cheerio.load(axiosGet.data);
    const englishName = $('p.title-english').text();
    let title;
    if (englishName != '') {
      title = topAnimeList[randomIndex].node.title + ' - ' + englishName;
    } else {
      title = topAnimeList[randomIndex].node.title;
    }
    const animeData = {
      id: animeID,
      title: title
    };
    return animeData;

  } catch (error) {
    console.error('Error while fetching random anime :', error);
    throw error;
  }
};

const getRandomCharacterInformations = async (anime, difficulty) => {
  try {
    const randomCharacters = await getRandomCharacters(anime);
    let characterId;

    if (difficulty === 'expert') {
      const randomIndex = Math.floor(Math.random() * randomCharacters.data.length);
      const randomCharacterData = randomCharacters.data[randomIndex];
      characterId = randomCharacterData.node.id;
    } else {
      const mainCharacters = randomCharacters.data.filter(character => character.role === 'Main');
      const randomIndex = Math.floor(Math.random() * mainCharacters.length);
      const randomCharacterData = mainCharacters[randomIndex];
      characterId = randomCharacterData.node.id;
    }

    const imageUrl = await getCharacterInformations(characterId);
    return imageUrl;

  } catch (error) {
    console.error('Error while fetching random character image:', error);
    throw error;
  }
};

const getRandomCharacters = async (anime) => {
  try {
    const apiUrl = `${MAL_API_URL}anime/${anime}/characters`;

    const response = await axios.get(apiUrl, {
      headers: {
        'X-MAL-CLIENT-ID': MAL_CLIENT_ID,
      },
    });

    const randomCharacters = response.data;
    return randomCharacters;

  } catch (error) {
    console.error('Error while fetching random character :', error);
    throw error;
  }
};

const getCharacterInformations = async (characterId) => {
  try {
    const characterUrl = `https://myanimelist.net/character/${characterId}`;
    const response = await axios.get(characterUrl);
    const $ = cheerio.load(response.data);
    const imageUrl = $('img.portrait-225x350').attr('data-src');
    const name = $('h2.normal_header').text();
    const allNames = $('h1.title-name').text();

    const characterInformations = {
      imageUrl: imageUrl,
      name: name,
      allNames: allNames
    };

    return characterInformations;
  } catch (error) {
    console.error('Error while fetching character image:', error);
    throw error;
  }
};

module.exports = {
  getRandomUserAnime,
  getRandomTopAnime,
  getRandomCharacterInformations,
};
