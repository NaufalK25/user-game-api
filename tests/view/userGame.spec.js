const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { validationResult } = require('express-validator');
const errorController = require('../../controllers/views/error');
const userGameController = require('../../controllers/views/userGame');
const { baseUrl } = require('../../config/constants');
const { UserGame, UserGameBiodata, UserGameHistory } = require('../../database/models');
const { generateErrorRenderObject, generateFlashObject, generateRenderObject, getEndpoint } = require('../../helper');

process.env.NODE_ENV = 'test';

const mockRequest = ({ body, params, originalName, user } = {}) => ({
    body,
    params,
    originalName,
    user,
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

jest.mock('bcrypt');
jest.mock('nodemailer');
jest.mock('express-validator');

beforeEach(() => {
    validationResult.mockImplementation(() => ({
        isEmpty: () => true,
        array: () => []
    }));
    errorController.internalServerErrorPage = jest.fn().mockImplementation(() => { });
    errorController.notFoundPage = jest.fn().mockImplementation(() => { });
    UserGame.findByPk = jest.fn().mockImplementation(() => ({ ...userGame }));
    UserGame.findAll = jest.fn().mockImplementation(() => ([{ ...userGameInclude }]));
});
afterEach(() => {
    jest.clearAllMocks();
});

describe('Create User Game', () => {
    beforeEach(() => {
        bcrypt.hash.mockImplementation(() => 'hashedPassword');
        nodemailer.createTransport.mockImplementation(() => ({
            sendMail: jest.fn().mockImplementation(() => Promise.resolve())
        }));
        UserGame.create = jest.fn().mockImplementation(() => ({ ...userGame }));
        UserGameBiodata.create = jest.fn().mockImplementation(() => ({ ...userGameBiodata }));
    });
    test('201 Created', async () => {
        const req = mockRequest({
            body: {
                username: 'username',
                password: 'hashedPassword',
                confirmPassword: 'hashedPassword',
                email: 'email@test.com',
                firstname: 'firstname',
                lastname: 'lastname',
                profilePicture: 'default-profile.png',
                country: 'country',
                age: 20,
                userGameId: 1
            }, user: { ...userGame }
        });
        const res = mockResponse();

        await userGameController.createUserGame(req, res);

        expect(res.status).toBeCalledWith(201);
        expect(res.redirect).toBeCalledWith('/view/user_games');
    });
    test('400 Bad Request (Validation Error)', async () => {
        const req = mockRequest({
            body: {
                username: '',
                password: 'hashedPassword',
                confirmPassword: 'hashedPassword',
                email: 'email@test.com',
                firstname: 'firstname',
                lastname: 'lastname',
                profilePicture: 'default-profile.png',
                country: 'country',
                age: 20,
                userGameId: 1
            }, user: { ...userGame }
        });
        const res = mockResponse();
        const errors = [{
            value: '',
            msg: 'Username is required',
            param: 'username',
            location: 'body'
        }]

        validationResult.mockImplementation(() => ({
            isEmpty: () => false,
            array: () => errors
        }));

        await userGameController.createUserGame(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.render).toBeCalledWith('user-game-list', generateRenderObject({
            title: 'User Game List',
            scripts: ['../js/user-game-list.js', '../js/global.js'],
            extras: {
                baseUrl,
                loggedInUser: req.user,
                userGames: [{ ...userGameInclude }],
                flash: generateFlashObject(req)
            }
        }));
    });
    test('400 Bad Request (Password does not match)', async () => {
        const req = mockRequest({
            body: {
                username: 'username',
                password: 'hashedPassword',
                confirmPassword: 'hashedPassword2',
                email: 'email@test.com',
                firstname: 'firstname',
                lastname: 'lastname',
                profilePicture: 'default-profile.png',
                country: 'country',
                age: 20,
                userGameId: 1
            }, user: { ...userGame }
        });
        const res = mockResponse();
        const errors = [{ param: 'confirmPassword', msg: 'Password confirmation does not match' }]

        await userGameController.createUserGame(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.render).toBeCalledWith('user-game-list', generateRenderObject({
            title: 'User Game List',
            scripts: ['../js/user-game-list.js', '../js/global.js'],
            extras: {
                baseUrl,
                loggedInUser: req.user,
                userGames: [{ ...userGameInclude }],
                flash: generateFlashObject(req)
            }
        }));
    });
});

describe('Update User Game', () => {
    test('200 OK', async () => {
        const req = mockRequest({ body: { username: 'username2' }, params: { id: 1 }, user: { ...userGame } });
        const res = mockResponse();

        await userGameController.updateUserGameById(req, res);

        expect(res.status).toBeCalledWith(200);
        expect(res.redirect).toBeCalledWith('/view/user_games')
    });
    test('200 OK (No Change)', async () => {
        const req = mockRequest({ body: { username: 'username' }, params: { id: 1 }, user: { ...userGame } });
        const res = mockResponse();

        await userGameController.updateUserGameById(req, res);

        expect(res.status).toBeCalledWith(200);
        expect(res.redirect).toBeCalledWith('/view/user_games')
    });
    test('400 Bad Request (Validation Error)', async () => {
        const req = mockRequest({ body: { username: '' }, params: { id: 'a' }, originalName: '/view/user_game/a' });
        const res = mockResponse();
        const errors = [{
            value: '',
            msg: 'Username is required',
            param: 'username',
            location: 'body'
        }]

        validationResult.mockImplementation(() => ({
            isEmpty: () => false,
            array: () => errors
        }));

        await userGameController.updateUserGameById(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.render).toBeCalledWith('user-game-list', generateRenderObject({
            title: 'User Game List',
            scripts: ['../js/user-game-list.js', '../js/global.js'],
            extras: {
                baseUrl,
                loggedInUser: req.user,
                userGames: [{ ...userGameInclude }],
                flash: generateFlashObject(req)
            }
        }));
    });
    test('404 Not Found (User Game Not Found)', async () => {
        const req = mockRequest({ body: { username: 'username2' }, params: { id: 1 }, originalName: '/view/user_game/1' });
        const res = mockResponse();

        UserGame.findByPk = jest.fn().mockImplementation(() => null);

        await userGameController.updateUserGameById(req, res);

        expect(res.status).toBeCalledWith(404);
        expect(res.render).toBeCalledWith('error', generateErrorRenderObject({
            title: '404 Page Not Found',
            message: `Endpoint ${getEndpoint(req.originalUrl)} not found`
        }));
    });
});

describe('Delete User Game', () => {
    beforeEach(() => {
        UserGameBiodata.findOne = jest.fn().mockImplementation(() => ({ ...userGameBiodata }));
        UserGameHistory.findAll = jest.fn().mockImplementation(() => ([{ ...userGameHistory }]));
        UserGameBiodata.destroy = jest.fn().mockImplementation(() => ({ ...userGameBiodata }));
        UserGameHistory.destroy = jest.fn().mockImplementation(() => ({ ...userGameHistory }));
    });
    test('200 OK', async () => {
        const req = mockRequest({ params: { id: 1 } });
        const res = mockResponse();

        await userGameController.deleteUserGameById(req, res);

        expect(res.status).toBeCalledWith(200);
        expect(res.redirect).toBeCalledWith('/view/user_games');
    });
    test('404 Not Found (Validation Error)', async () => {
        const req = mockRequest({ params: { id: 'a' }, originalName: '/view/user_game/a' });
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

        await userGameController.deleteUserGameById(req, res);

        expect(res.status).toBeCalledWith(404);
        expect(res.render).toBeCalledWith('error', generateErrorRenderObject({
            title: '404 Page Not Found',
            message: `Endpoint ${getEndpoint(req.originalUrl)} not found`
        }));
    });
    test('404 Not Found (User Game Not Found)', async () => {
        const req = mockRequest({ params: { id: 1 }, originalName: '/view/user_game/1' });
        const res = mockResponse();

        UserGame.findByPk = jest.fn().mockImplementation(() => null);

        await userGameController.deleteUserGameById(req, res);

        expect(res.status).toBeCalledWith(404);
        expect(res.render).toBeCalledWith('error', generateErrorRenderObject({
            title: '404 Page Not Found',
            message: `Endpoint ${getEndpoint(req.originalUrl)} not found`
        }));
    });
});

describe('Get User Game By Id', () => {
    test('200 OK', async () => {
        const req = mockRequest({ params: { id: 1 }, user: { ...userGame } });
        const res = mockResponse();

        UserGame.findByPk = jest.fn().mockImplementation(() => ({ ...userGameInclude }));

        await userGameController.getUserGameByIdPage(req, res);

        expect(res.status).toBeCalledWith(200);
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
    test('404 Not Found (Validation Error)', async () => {
        const req = mockRequest({ params: { id: 'a' }, originalName: '/view/user_game/a' });
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

        await userGameController.getUserGameByIdPage(req, res);

        expect(res.status).toBeCalledWith(404);
        expect(res.render).toBeCalledWith('error', generateErrorRenderObject({
            title: '404 Page Not Found',
            message: `Endpoint ${getEndpoint(req.originalUrl)} not found`
        }));
    });
    test('404 Not Found (User Game Not Found)', async () => {
        const req = mockRequest({ params: { id: 1 }, originalName: '/view/user_game/1' });
        const res = mockResponse();

        UserGame.findByPk = jest.fn().mockImplementation(() => null);

        await userGameController.getUserGameByIdPage(req, res);

        expect(res.status).toBeCalledWith(404);
        expect(res.render).toBeCalledWith('error', generateErrorRenderObject({
            title: '404 Page Not Found',
            message: `Endpoint ${getEndpoint(req.originalUrl)} not found`
        }));
    });
});

describe('Get All User Games Page', () => {
    test('200 OK', async () => {
        const req = mockRequest({ user: { ...userGame } });
        const res = mockResponse();

        await userGameController.getAllUserGamesPage(req, res);

        expect(res.status).toBeCalledWith(200);
        expect(res.render).toBeCalledWith('user-game-list', generateRenderObject({
            title: 'User Game List',
            scripts: ['../js/user-game-list.js', '../js/global.js'],
            extras: {
                baseUrl,
                loggedInUser: req.user,
                userGames: [{ ...userGameInclude }],
                flash: generateFlashObject(req)
            }
        }));
    });
});
