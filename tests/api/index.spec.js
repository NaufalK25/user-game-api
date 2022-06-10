const { baseUrl } = require('../../config/constants');
const indexController = require('../../controllers');

const mockRequest = () => ({});
const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

describe('/', () => {
    test('200 OK', () => {
        const req = mockRequest();
        const res = mockResponse();

        indexController.root(req, res);

        expect(res.status).toBeCalledWith(200);
        expect(res.json).toBeCalledWith({
            statusCode: 200,
            message: 'Welcome to the API',
            developer: 'Muhammad Naufal Kateni',
            documentation: `${baseUrl}/docs`,
            apiLogin: `${baseUrl}/api/v1/login`,
            api: `${baseUrl}/api/v1/user_games`,
            viewLogin: `${baseUrl}/view/login`,
            view: `${baseUrl}/view/user_games`
        });
    });
});

describe('/api', () => {
    test('200 OK', () => {
        const req = mockRequest();
        const res = mockResponse();

        indexController.api(req, res);

        expect(res.status).toBeCalledWith(200);
        expect(res.json).toBeCalledWith({
            statusCode: 200,
            message: 'OK',
            versions: [{ v1: `${baseUrl}/api/v1` }]
        });
    });
});

describe('/api/v1', () => {
    test('200 OK', () => {
        const req = mockRequest();
        const res = mockResponse();

        indexController.version(req, res);

        expect(res.status).toBeCalledWith(200);
        expect(res.json).toBeCalledWith({
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
                userGameHistoriesByUserGameId: `${baseUrl}/api/v1/user_game/:userGameId/history`
            }
        });
    });
});
