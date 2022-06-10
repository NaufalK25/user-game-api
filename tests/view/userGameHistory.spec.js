const { validationResult } = require('express-validator');
const errorController = require('../../controllers/views/error');
const userGameHistoryController = require('../../controllers/views/userGameHistory');
const { baseUrl } = require('../../config/constants');
const { UserGame, UserGameHistory } = require('../../database/models');
const { generateErrorRenderObject, generateFlashObject, generateRenderObject, getEndpoint } = require('../../helper');

process.env.NODE_ENV = 'test';

const mockRequest = ({ body, params, file, originalUrl } = {}) => ({
    body,
    params,
    file,
    originalUrl,
    flash: jest.fn()
});
const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.render = jest.fn().mockReturnValue(res);
    res.redirect = jest.fn().mockReturnValue(res);
    return res;
}


const createdAt = new Date();
const updatedAt = new Date();
const lastPlayed = new Date();
const userGame = {
    id: 1,
    username: 'username',
    password: 'hashedPassword',
    roleId: 2,
    createdAt,
    updatedAt
};
const userGameBiodata = {
    id: 1,
    email: 'email@test.com',
    firstname: 'firstname',
    lastname: 'lastname',
    profilePicture: 'default-profile.png',
    country: 'country',
    age: 20,
    createdAt,
    updatedAt,
    userGameId: 1
};
const userGameHistory = {
    id: 1,
    title: 'title',
    publisher: 'publisher',
    cover: 'default-cover.jpg',
    lastPlayed,
    score: 100,
    createdAt,
    updatedAt,
    userGameId: 1
};
const userGameInclude = {
    ...userGame,
    UserGameBiodatum: { ...userGameBiodata },
    UserGameHistories: [{ ...userGameHistory }]
};

jest.mock('express-validator');

beforeEach(() => {
    validationResult.mockImplementation(() => ({
        isEmpty: () => true,
        array: () => []
    }));
    errorController.internalServerErrorPage = jest.fn().mockImplementation(() => { });
    errorController.notFoundPage = jest.fn().mockImplementation(() => { });
    UserGame.findByPk = jest.fn().mockImplementation(() => ({ ...userGameInclude }));
    UserGameHistory.findByPk = jest.fn().mockImplementation(() => ({ ...userGameHistory }));
});
afterEach(() => {
    jest.clearAllMocks();
});

describe('Create User Game History', () => {
    beforeEach(() => {
        UserGameHistory.create = jest.fn().mockImplementation(() => ({ ...userGameHistory }));
    });
    test('201 Created', async () => {
        const req = mockRequest({
            body: {
                title: 'title',
                publisher: 'publisher',
                cover: 'default-cover.jpg',
                score: 100,
                userGameId: 1
            }, params: { id: 1 }
        });
        const res = mockResponse();

        await userGameHistoryController.createUserGameHistory(req, res);

        expect(res.status).toBeCalledWith(201);
        expect(res.redirect).toBeCalledWith('/view/user_game/1')
    });
    test('400 Bad Request', async () => {
        const req = mockRequest({
            body: {
                title: '',
                publisher: 'publisher',
                cover: 'default-cover.jpg',
                score: 100,
                userGameId: 1
            }, params: { id: 1 }
        });
        const res = mockResponse();
        const errors = [{
            value: '',
            msg: 'Title is required',
            param: 'title',
            location: 'body'
        }];

        validationResult.mockImplementation(() => ({
            isEmpty: () => false,
            array: () => errors
        }));

        await userGameHistoryController.createUserGameHistory(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.render).toBeCalledWith('user-game-detail', generateRenderObject({
            title: `User Game Detail - ${userGame.username}`,
            scripts: ['../../../js/user-game-detail.js', '../../../js/global.js'],
            extras: {
                baseUrl,
                loggedInUser: req.user,
                userGame: { ...userGameInclude },
                flash: generateFlashObject(req)
            }
        }));
    });
    test('404 Not Found', async () => {
        const req = mockRequest({
            body: {
                title: 'title',
                publisher: 'publisher',
                cover: 'default-cover.jpg',
                score: 100,
                userGameId: 1
            }, params: { id: 1 }, originalUrl: '/view/user_game/1/history'
        });
        const res = mockResponse();

        UserGame.findByPk = jest.fn().mockImplementation(() => null);

        await userGameHistoryController.createUserGameHistory(req, res);

        expect(res.status).toBeCalledWith(404);
        expect(res.render).toBeCalledWith('error', generateErrorRenderObject({
            title: '404 Page Not Found',
            message: `Endpoint ${getEndpoint(req.originalUrl)} not found`
        }));
    });
});

describe('Update User Game History', () => {
    beforeEach(() => {
        UserGameHistory.update = jest.fn().mockImplementation(() => ({ ...userGameHistory }));
    });
    test('200 OK', async () => {
        const req = mockRequest({
            body: { title: 'title2' },
            params: { id: 1 },
            user: { ...userGame }
        });
        const res = mockResponse();

        await userGameHistoryController.updateUserGameHistoryById(req, res);

        expect(res.status).toBeCalledWith(200);
        expect(res.redirect).toBeCalledWith('/view/user_game/1');
    });
    test('400 OK Bad Request', async () => {
        const req = mockRequest({ body: { title: '' }, params: { id: 1 }, user: { ...userGame } });
        const res = mockResponse();
        const errors = [{
            value: '',
            msg: 'Title is required',
            param: 'title',
            location: 'body'
        }];

        validationResult.mockImplementation(() => ({
            isEmpty: () => false,
            array: () => errors
        }));

        await userGameHistoryController.updateUserGameHistoryById(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.render).toBeCalledWith('user-game-detail', generateRenderObject({
            title: `User Game Detail - ${userGame.username}`,
            scripts: ['../../../js/user-game-detail.js', '../../../js/global.js'],
            extras: {
                baseUrl,
                loggedInUser: req.user,
                userGame: { ...userGameInclude },
                flash: generateFlashObject(req)
            }
        }));
    });
    test('404 OK (User Game Not Found)', async () => {
        const req = mockRequest({ body: { userGameHistoryId: 1 }, params: { id: 1 }, originalUrl: '/view/user_game/1/history' });
        const res = mockResponse();

        UserGame.findByPk = jest.fn().mockImplementation(() => null);

        await userGameHistoryController.updateUserGameHistoryById(req, res);

        expect(res.status).toBeCalledWith(404);
        expect(res.render).toBeCalledWith('error', generateErrorRenderObject({
            title: '404 Page Not Found',
            message: `Endpoint ${getEndpoint(req.originalUrl)} not found`
        }));
    });
    test('404 OK (User Game History Not Found)', async () => {
        const req = mockRequest({ body: { userGameHistoryId: 1 }, params: { id: 1 }, originalUrl: '/view/user_game/1/history' });
        const res = mockResponse();

        UserGameHistory.findByPk = jest.fn().mockImplementation(() => null);

        await userGameHistoryController.updateUserGameHistoryById(req, res);

        expect(res.status).toBeCalledWith(404);
        expect(res.render).toBeCalledWith('error', generateErrorRenderObject({
            title: '404 Page Not Found',
            message: `Endpoint ${getEndpoint(req.originalUrl)} not found`
        }));
    });
});

describe('Delete User Game History', () => {
    beforeEach(() => {
        UserGame.findByPk = jest.fn().mockImplementation(() => ({ ...userGame }));
        UserGameHistory.destroy = jest.fn().mockImplementation(() => ({ ...userGameHistory }));
    });
    test('200 OK', async () => {
        const req = mockRequest({ body: { userGameHistoryId: 1 }, params: { id: 1 } });
        const res = mockResponse();

        await userGameHistoryController.deleteUserGameHistoryById(req, res);

        expect(res.status).toBeCalledWith(200);
        expect(res.redirect).toBeCalledWith('/view/user_game/1')
    });
    test('404 Not Found (Validation Error)', async () => {
        const req = mockRequest({ body: { userGameHistoryId: 1 }, params: { id: 'a' }, originalUrl: '/view/user_game/a/history' });
        const res = mockResponse();
        const errors = [{
            value: 'a',
            msg: 'Id must be an integer',
            param: 'id',
            location: 'params'
        }]

        validationResult.mockImplementation(() => ({
            isEmpty: () => false,
            array: () => errors
        }));

        await userGameHistoryController.deleteUserGameHistoryById(req, res);

        expect(res.status).toBeCalledWith(404);
        expect(res.render).toBeCalledWith('error', generateErrorRenderObject({
            title: '404 Page Not Found',
            message: `Endpoint ${getEndpoint(req.originalUrl)} not found`
        }));
    });
    test('404 Not Found (User Game Not Found)', async () => {
        const req = mockRequest({ body: { userGameHistoryId: 1 }, params: { id: 1 }, originalUrl: '/view/user_game/1/history' });
        const res = mockResponse();

        UserGame.findByPk = jest.fn().mockImplementation(() => null);

        await userGameHistoryController.deleteUserGameHistoryById(req, res);

        expect(res.status).toBeCalledWith(404);
        expect(res.render).toBeCalledWith('error', generateErrorRenderObject({
            title: '404 Page Not Found',
            message: `Endpoint ${getEndpoint(req.originalUrl)} not found`
        }));
    });
    test('404 Not Found (User Game History Not Found)', async () => {
        const req = mockRequest({ body: { userGameHistoryId: 1 }, params: { id: 1 }, originalUrl: '/view/user_game/1/history' });
        const res = mockResponse();

        UserGameHistory.findByPk = jest.fn().mockImplementation(() => null);

        await userGameHistoryController.deleteUserGameHistoryById(req, res);

        expect(res.status).toBeCalledWith(404);
        expect(res.render).toBeCalledWith('error', generateErrorRenderObject({
            title: '404 Page Not Found',
            message: `Endpoint ${getEndpoint(req.originalUrl)} not found`
        }));
    });
});
