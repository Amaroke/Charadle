const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const MAL_API_URL = 'https://api.myanimelist.net/v2/users/';

const MAL_CLIENT_ID = process.env.MAL_CLIENT_ID;

const getUserList = async (username) => {
    try {
        const apiUrl = `${MAL_API_URL}${username}/animelist`;

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

module.exports = {
    getUserList,
};
