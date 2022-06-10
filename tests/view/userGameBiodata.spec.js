const { validationResult } = require('express-validator');
const errorController = require('../../controllers/views/error');
const userGameBiodataController = require('../../controllers/views/userGameBiodata');
const { baseUrl } = require('../../config/constants');
const { UserGame, UserGameBiodata } = require('../../database/models');
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
    UserGameBiodata.findByPk = jest.fn().mockImplementation(() => ({ ...userGameBiodata }));
});
afterEach(() => {
    jest.clearAllMocks();
});

describe('Create User Game Biodata', () => {
    beforeEach(() => {
        UserGameBiodata.create = jest.fn().mockImplementation(() => ({ ...userGameBiodata }));
    });
    test('201 Created', async () => {
        const req = mockRequest({
            body: {
                email: 'email@test.com',
                firstname: 'firstname',
                lastname: 'lastname',
                country: 'country',
                age: 20,
                userGameId: 1
            }, params: { id: 1 }
        });
        const res = mockResponse();

        await userGameBiodataController.createUserGameBiodata(req, res);

        expect(res.status).toBeCalledWith(201);
        expect(res.redirect).toBeCalledWith('/view/user_game/1')
    });
    test('400 Bad Request', async () => {
        const req = mockRequest({
            body: {
                email: '',
                firstname: 'firstname',
                lastname: 'lastname',
                country: 'country',
                age: 20,
                userGameId: 1
            }, params: { id: 1 }
        });
        const res = mockResponse();
        const errors = [{
            value: '',
            msg: 'Email is required',
            param: 'email',
            location: 'body'
        }];

        validationResult.mockImplementation(() => ({
            isEmpty: () => false,
            array: () => errors
        }));

        await userGameBiodataController.createUserGameBiodata(req, res);

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
                email: 'email@test.com',
                firstname: 'firstname',
                lastname: 'lastname',
                country: 'country',
                age: 20,
                userGameId: 1
            }, params: { id: 1 }, originalUrl: '/view/user_game/1/biodata'
        });
        const res = mockResponse();

        UserGame.findByPk = jest.fn().mockImplementation(() => null);

        await userGameBiodataController.createUserGameBiodata(req, res);

        expect(res.status).toBeCalledWith(404);
        expect(res.render).toBeCalledWith('error', generateErrorRenderObject({
            title: '404 Page Not Found',
            message: `Endpoint ${getEndpoint(req.originalUrl)} not found`
        }));
    });
});

describe('Update User Game Biodata', () => {
    beforeEach(() => {
        UserGameBiodata.update = jest.fn().mockImplementation(() => ({ ...userGameBiodata }));
    });
    test('200 OK', async () => {
        const req = mockRequest({
            body: { firstname: 'fristname2' },
            params: { id: 1 },
            user: { ...userGame }
        });
        const res = mockResponse();

        await userGameBiodataController.updateUserGameBiodataById(req, res);

        expect(res.status).toBeCalledWith(200);
        expect(res.redirect).toBeCalledWith('/view/user_game/1');
    });
    test('400 OK Bad Request', async () => {
        const req = mockRequest({ body: { firstname: '' }, params: { id: 1 }, user: { ...userGame } });
        const res = mockResponse();
        const errors = [{
            value: '',
            msg: 'Firstname is required',
            param: 'firstname',
            location: 'body'
        }];

        validationResult.mockImplementation(() => ({
            isEmpty: () => false,
            array: () => errors
        }));

        await userGameBiodataController.updateUserGameBiodataById(req, res);

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
        const req = mockRequest({ body: { userGameBiodataId: 1 }, params: { id: 1 }, originalUrl: '/view/user_game/1/biodata' });
        const res = mockResponse();

        UserGame.findByPk = jest.fn().mockImplementation(() => null);

        await userGameBiodataController.updateUserGameBiodataById(req, res);

        expect(res.status).toBeCalledWith(404);
        expect(res.render).toBeCalledWith('error', generateErrorRenderObject({
            title: '404 Page Not Found',
            message: `Endpoint ${getEndpoint(req.originalUrl)} not found`
        }));
    });
    test('404 OK (User Game Biodata Not Found)', async () => {
        const req = mockRequest({ body: { userGameBiodataId: 1 }, params: { id: 1 }, originalUrl: '/view/user_game/1/biodata' });
        const res = mockResponse();

        UserGameBiodata.findByPk = jest.fn().mockImplementation(() => null);

        await userGameBiodataController.updateUserGameBiodataById(req, res);

        expect(res.status).toBeCalledWith(404);
        expect(res.render).toBeCalledWith('error', generateErrorRenderObject({
            title: '404 Page Not Found',
            message: `Endpoint ${getEndpoint(req.originalUrl)} not found`
        }));
    });
});

describe('Delete User Game Biodata', () => {
    beforeEach(() => {
        UserGame.findByPk = jest.fn().mockImplementation(() => ({ ...userGame }));
        UserGameBiodata.destroy = jest.fn().mockImplementation(() => ({ ...userGameBiodata }));
    });
    test('200 OK', async () => {
        const req = mockRequest({ body: { userGameBiodataId: 1 }, params: { id: 1 } });
        const res = mockResponse();

        await userGameBiodataController.deleteUserGameBiodataById(req, res);

        expect(res.status).toBeCalledWith(200);
        expect(res.redirect).toBeCalledWith('/view/user_game/1')
    });
    test('404 Not Found (Validation Error)', async () => {
        const req = mockRequest({ body: { userGameBiodataId: 1 }, params: { id: 'a' }, originalUrl: '/view/user_game/a/biodata' });
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

        await userGameBiodataController.deleteUserGameBiodataById(req, res);

        expect(res.status).toBeCalledWith(404);
        expect(res.render).toBeCalledWith('error', generateErrorRenderObject({
            title: '404 Page Not Found',
            message: `Endpoint ${getEndpoint(req.originalUrl)} not found`
        }));
    });
    test('404 Not Found (User Game Not Found)', async () => {
        const req = mockRequest({ body: { userGameBiodataId: 1 }, params: { id: 1 }, originalUrl: '/view/user_game/1/biodata' });
        const res = mockResponse();

        UserGame.findByPk = jest.fn().mockImplementation(() => null);

        await userGameBiodataController.deleteUserGameBiodataById(req, res);

        expect(res.status).toBeCalledWith(404);
        expect(res.render).toBeCalledWith('error', generateErrorRenderObject({
            title: '404 Page Not Found',
            message: `Endpoint ${getEndpoint(req.originalUrl)} not found`
        }));
    });
    test('404 Not Found (User Game Biodata Not Found)', async () => {
        const req = mockRequest({ body: { userGameBiodataId: 1 }, params: { id: 1 }, originalUrl: '/view/user_game/1/biodata' });
        const res = mockResponse();

        UserGameBiodata.findByPk = jest.fn().mockImplementation(() => null);

        await userGameBiodataController.deleteUserGameBiodataById(req, res);

        expect(res.status).toBeCalledWith(404);
        expect(res.render).toBeCalledWith('error', generateErrorRenderObject({
            title: '404 Page Not Found',
            message: `Endpoint ${getEndpoint(req.originalUrl)} not found`
        }));
    });
});
