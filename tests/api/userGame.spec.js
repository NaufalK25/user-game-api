const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const errorController = require('../../controllers/error');
const userGameController = require('../../controllers/userGame');
const { UserGame, UserGameBiodata, UserGameHistory } = require('../../database/models');
const { getEndpoint } = require('../../helper');

process.env.NODE_ENV = 'test';

const mockRequest = ({ body, params, originalUrl } = {}) => ({ body, params, originalUrl });
const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
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
jest.mock('bcrypt');

beforeEach(() => {
    validationResult.mockImplementation(() => ({
        isEmpty: () => true,
        array: () => []
    }));
    bcrypt.hash.mockImplementation(() => 'hashedPassword');
    errorController.badRequest = jest.fn().mockImplementation(() => { });
    errorController.internalServerError = jest.fn().mockImplementation(() => { });
    errorController.notFound = jest.fn().mockImplementation(() => { });
    UserGame.findByPk = jest.fn().mockImplementation(() => ({ ...userGame }));
});
afterEach(() => {
    jest.clearAllMocks();
});

describe('Create User Game', () => {
    beforeEach(() => {
        UserGame.create = jest.fn().mockImplementation(() => ({ ...userGame }));
    });
    test('201 Created', async () => {
        const req = mockRequest({ body: { username: 'username', password: 'hashedPassword' } });
        const res = mockResponse();

        await userGameController.create(req, res);

        expect(res.status).toBeCalledWith(201);
        expect(res.json).toBeCalledWith({
            statusCode: 201,
            message: 'UserGame created successfully',
            data: { ...userGame }
        });
    });
    test('400 Bad Request', async () => {
        const req = mockRequest({ body: { username: '', password: 'hashedPassword' } });
        const res = mockResponse();
        const errors = [{
            value: '',
            msg: 'Username is required',
            param: 'username',
            location: 'body'
        }];

        validationResult.mockImplementation(() => ({
            isEmpty: () => false,
            array: () => errors
        }));

        await userGameController.create(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({
            statusCode: 400,
            errors
        });
    });
});

describe('Update User Game', () => {
    beforeEach(() => {
        UserGame.update = jest.fn().mockImplementation(() => ({ ...userGame }));
    });
    test('200 OK', async () => {
        const req = mockRequest({ body: { username: 'username2', password: 'hashedPassword2' }, params: { id: 1 } });
        const res = mockResponse();

        UserGame.findByPk = jest.fn().mockImplementation(() => ({ dataValues: { ...userGame } }));
        bcrypt.hash.mockImplementation(() => 'hashedPassword');

        await userGameController.update(req, res);

        expect(res.status).toBeCalledWith(200);
        expect(res.json).toBeCalledWith({
            statusCode: 200,
            message: 'UserGame updated successfully',
            data: {
                before: { username: 'username', password: 'hashedPassword' },
                after: { username: 'username2', password: 'hashedPassword' },
            }
        });
    });
    test('400 Bad Request', async () => {
        const req = mockRequest({ body: { username: '' }, params: { id: 1 } });
        const res = mockResponse();
        const errors = [{
            value: '',
            msg: 'Username is required',
            param: 'username',
            location: 'body'
        }];

        validationResult.mockImplementation(() => ({
            isEmpty: () => false,
            array: () => errors
        }));

        await userGameController.update(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({
            statusCode: 400,
            errors
        });
    });
    test('404 Not Founf', async () => {
        const req = mockRequest({ params: { id: 1 }, originalUrl: '/api/v1/user_game/1' });
        const res = mockResponse();

        UserGame.findByPk = jest.fn().mockImplementation(() => null);

        await userGameController.update(req, res);

        expect(res.status).toBeCalledWith(404);
        expect(res.json).toBeCalledWith({
            statusCode: 404,
            message: `Endpoint ${getEndpoint(req.originalUrl)} not found`
        });
    });
});

describe('Delete User Game', () => {
    beforeEach(() => {
        UserGameBiodata.findOne = jest.fn().mockImplementation(() => ({ ...userGameBiodata }));
        UserGameHistory.findAll = jest.fn().mockImplementation(() => ([{ ...userGameHistory }]));
        UserGameBiodata.destroy = jest.fn().mockImplementation(() => ({ ...userGameBiodata }));
        UserGameHistory.destroy = jest.fn().mockImplementation(() => ({ ...userGameHistory }));
        UserGame.destroy = jest.fn().mockImplementation(() => ({ ...userGame }));
    });
    test('200 OK', async () => {
        const req = mockRequest({ params: { id: 1 } });
        const res = mockResponse();

        await userGameController.destroy(req, res);

        expect(res.status).toBeCalledWith(200);
        expect(res.json).toBeCalledWith({
            statusCode: 200,
            message: 'UserGame deleted successfully',
            data: { ...userGame }
        });
    });
    test('400 Bad Request', async () => {
        const req = mockRequest({ params: { id: 'a' } });
        const res = mockResponse();
        const errors = [{
            value: 'a',
            msg: 'Id must be an integer',
            param: 'id',
            location: 'params'
        }];

        validationResult.mockImplementation(() => ({
            isEmpty: () => false,
            array: () => errors
        }));

        await userGameController.destroy(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({
            statusCode: 400,
            errors
        });
    });
    test('404 Not Found', async () => {
        const req = mockRequest({ params: { id: 1 }, originalUrl: '/api/v1/user_game/1' });
        const res = mockResponse();

        UserGame.findByPk = jest.fn().mockImplementation(() => null);

        await userGameController.destroy(req, res);

        expect(res.status).toBeCalledWith(404);
        expect(res.json).toBeCalledWith({
            statusCode: 404,
            message: `Endpoint ${getEndpoint(req.originalUrl)} not found`
        });
    });
});

describe('Get User Game By Id', () => {
    test('200 OK', async () => {
        const req = mockRequest({ params: { id: 1 } });
        const res = mockResponse();

        UserGame.findByPk = jest.fn().mockImplementation(() => ({ ...userGameInclude }));

        await userGameController.findOne(req, res);

        expect(res.status).toBeCalledWith(200);
        expect(res.json).toBeCalledWith({
            statusCode: 200,
            message: 'OK',
            data: { ...userGameInclude }
        });
    });
    test('400 Bad Request', async () => {
        const req = mockRequest({ params: { id: 'a' } });
        const res = mockResponse();
        const errors = [{
            value: 'a',
            msg: 'Id must be an integer',
            param: 'id',
            location: 'params'
        }];

        validationResult.mockImplementation(() => ({
            isEmpty: () => false,
            array: () => errors
        }));

        await userGameController.findOne(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({
            statusCode: 400,
            errors
        });
    });
    test('404 Not Found', async () => {
        const req = mockRequest({ params: { id: 1 }, originalUrl: '/api/v1/user_game/1' });
        const res = mockResponse();

        UserGame.findByPk = jest.fn().mockImplementation(() => null);

        await userGameController.findOne(req, res);

        expect(res.status).toBeCalledWith(404);
        expect(res.json).toBeCalledWith({
            statusCode: 404,
            message: `Endpoint ${getEndpoint(req.originalUrl)} not found`
        });
    });
});

describe('Get All User Games', () => {
    beforeEach(() => {
        UserGame.findAll = jest.fn().mockImplementation(() => ([{ ...userGameInclude }]));
    });
    test('200 OK', async () => {
        const req = mockRequest();
        const res = mockResponse();

        await userGameController.findAll(req, res);

        expect(res.status).toBeCalledWith(200);
        expect(res.json).toBeCalledWith({
            statusCode: 200,
            message: 'OK',
            count: 1,
            data: [{ ...userGameInclude }]
        });
    });
});
