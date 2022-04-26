require('dotenv').config();

const port = process.env.PORT || 3000;
const baseUrl = process.env.BASE_URL || `http://localhost:${port}`;

const root = (req, res) => {
    res.status(200).json({
        statusCode: 200,
        message: 'Welcome to the API',
        developer: 'Muhammad Naufal Kateni',
        documentation: `${baseUrl}/api-docs`,
        baseUrl: `${baseUrl}/api/v1/user_games`,
    });
};

const api = (req, res) => {
    res.status(200).json({
        statusCode: 200,
        message: 'OK',
        versions: [
            {
                v1: `${baseUrl}/api/v1`,
            },
        ],
    });
};

const version = (req, res) => {
    res.status(200).json({
        statusCode: 200,
        message: 'OK',
        version: 'v1',
        endpoints: {
            userGames: `${baseUrl}/api/v1/user_games`,
            userGame: `${baseUrl}/api/v1/user_game/:id'`,
            userGameBiodatas: `${baseUrl}/api/v1/user_games/biodatas`,
            userGameBiodata: `${baseUrl}/api/v1/user_game/biodata/:id`,
            userGameBiodataByUserGameId: `${baseUrl}/api/v1/user_game/:userGameId/biodata`,
            userGameHistories: `${baseUrl}/api/v1/user_games/histories`,
            userGameHistory: `${baseUrl}/api/v1/user_game/history/:id`,
            userGameHistoriesByUserGameId: `${baseUrl}/api/v1/user_game/:userGameId/history`,
        },
    });
 };

 module.exports = {
     root,
     api,
     version,
 }
