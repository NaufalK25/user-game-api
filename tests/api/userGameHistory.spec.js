const { validationResult } = require('express-validator');
const { baseUrl } = require('../../config/constants');
const errorController = require('../../controllers/error');
const userGameHistoryController = require('../../controllers/userGameHistory');
const { UserGameHistory } = require('../../database/models');
const { getEndpoint } = require('../../helper');

process.env.NODE_ENV = 'test';

const mockRequest = ({ body, params, file, originalUrl } = {}) => ({ body, params, file, originalUrl });
const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

const createdAt = new Date();
const updatedAt = new Date();
const lastPlayed = new Date();
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
const userGame = {
    id: 1,
    username: 'username',
    password: 'hashedPassword',
    roleId: 2,
    createdAt,
    updatedAt
};
const userGameHistoryInclude = {
    ...userGameHistory,
    UserGame: { ...userGame }
}

jest.mock('express-validator');

beforeEach(() => {
    validationResult.mockImplementation(() => ({
        isEmpty: () => true,
        array: () => []
    }));
    errorController.badRequest = jest.fn().mockImplementation(() => { });
    errorController.internalServerError = jest.fn().mockImplementation(() => { });
    errorController.notFound = jest.fn().mockImplementation(() => { });
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
                score: 100,
                userGameId: 1
            }
        });
        const res = mockResponse();

        await userGameHistoryController.create(req, res);

        expect(res.status).toBeCalledWith(201);
        expect(res.json).toBeCalledWith({
            statusCode: 201,
            message: 'UserGameHistory created successfully',
            data: { ...userGameHistory, cover: `${baseUrl}/uploads/games/default-cover.jpg` }
        });
    });
    test('400 Bad Request', async () => {
        const req = mockRequest({
            body: {
                title: '',
                publisher: 'publisher',
                score: 100,
                userGameId: 1
            }
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

        await userGameHistoryController.create(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({
            statusCode: 400,
            errors
        });
    });
});

describe('Update User Game History', () => {
    beforeEach(() => {
        UserGameHistory.update = jest.fn().mockImplementation(() => ({ ...userGameHistory }));
    });
    test('200 OK', async () => {
        const req = mockRequest({ body: { title: 'title2' }, params: { id: 1 } });
        const res = mockResponse();

        UserGameHistory.findByPk = jest.fn().mockImplementation(() => ({ dataValues: { ...userGameHistory } }));

        await userGameHistoryController.update(req, res);

        expect(res.status).toBeCalledWith(200);
        expect(res.json).toBeCalledWith({
            statusCode: 200,
            message: 'UserGameHistory updated successfully',
            data: {
                before: { title: 'title' },
                after: { title: 'title2' }
            }
        });
    });
    test('400 Bad Request', async () => {
        const req = mockRequest({ body: { title: '' }, params: { id: 1 } });
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

        await userGameHistoryController.update(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({
            statusCode: 400,
            errors
        });
    });
    test('404 Not Found', async () => {
        const req = mockRequest({ params: { id: 1 }, originalUrl: '/api/v1/user_game/history/1' });
        const res = mockResponse();

        UserGameHistory.findByPk = jest.fn().mockImplementation(() => null);

        await userGameHistoryController.update(req, res);

        expect(res.status).toBeCalledWith(404);
        expect(res.json).toBeCalledWith({
            statusCode: 404,
            message: `Endpoint ${getEndpoint(req.originalUrl)} not found`
        });
    });
});

describe('Delete User Game History', () => {
    beforeEach(() => {
        UserGameHistory.destroy = jest.fn().mockImplementation(() => ({ ...userGameHistory }));
    });
    test('200 OK', async () => {
        const req = mockRequest({ params: { id: 1 } });
        const res = mockResponse();

        await userGameHistoryController.destroy(req, res);

        expect(res.status).toBeCalledWith(200);
        expect(res.json).toBeCalledWith({
            statusCode: 200,
            message: 'UserGameHistory deleted successfully',
            data: { ...userGameHistory, cover: `${baseUrl}/uploads/games/default-cover.jpg` }
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

        await userGameHistoryController.destroy(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({
            statusCode: 400,
            errors
        });
    });
    test('404 Not Found', async () => {
        const req = mockRequest({ params: { id: 1 }, originalUrl: '/api/v1/user_game/history/1' });
        const res = mockResponse();

        UserGameHistory.findByPk = jest.fn().mockImplementation(() => null);

        await userGameHistoryController.destroy(req, res);

        expect(res.status).toBeCalledWith(404);
        expect(res.json).toBeCalledWith({
            statusCode: 404,
            message: `Endpoint ${getEndpoint(req.originalUrl)} not found`
        });
    });
});

describe('Get User Game History By Id', () => {
    test('200 OK', async () => {
        const req = mockRequest({ params: { id: 1 } });
        const res = mockResponse();

        UserGameHistory.findByPk = jest.fn().mockImplementation(() => ({ ...userGameHistoryInclude }));

        await userGameHistoryController.findOne(req, res);

        expect(res.status).toBeCalledWith(200);
        expect(res.json).toBeCalledWith({
            statusCode: 200,
            message: 'OK',
            data: { ...userGameHistoryInclude, cover: `${baseUrl}/uploads/games/default-cover.jpg` }
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

        await userGameHistoryController.findOne(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({
            statusCode: 400,
            errors
        });
    });
    test('404 Not Found', async () => {
        const req = mockRequest({ params: { id: 1 }, originalUrl: '/api/v1/user_game/history/1' });
        const res = mockResponse();

        UserGameHistory.findByPk = jest.fn().mockImplementation(() => null);

        await userGameHistoryController.findOne(req, res);

        expect(res.status).toBeCalledWith(404);
        expect(res.json).toBeCalledWith({
            statusCode: 404,
            message: `Endpoint ${getEndpoint(req.originalUrl)} not found`
        });
    });
});

describe('Get All User Game Histories', () => {
    beforeEach(() => {
        UserGameHistory.findAll = jest.fn().mockImplementation(() => [{ ...userGameHistoryInclude }]);
    });
    test('200 OK', async () => {
        const req = mockRequest();
        const res = mockResponse();

        await userGameHistoryController.findAll(req, res);

        expect(res.status).toBeCalledWith(200);
        expect(res.json).toBeCalledWith({
            statusCode: 200,
            message: 'OK',
            count: 1,
            data: [{ ...userGameHistoryInclude, cover: `${baseUrl}/uploads/games/default-cover.jpg` }]
        });
    });
});

describe('Get User Game History By User Game Id', () => {
    beforeEach(() => {
        UserGameHistory.findAll = jest.fn().mockImplementation(() => ([{ ...userGameHistory }]));
    });
    test('200 OK', async () => {
        const req = mockRequest({ params: { userGameId: 1 } });
        const res = mockResponse();

        await userGameHistoryController.findHistoriesByUserGameId(req, res);

        expect(res.status).toBeCalledWith(200);
        expect(res.json).toBeCalledWith({
            statusCode: 200,
            message: 'OK',
            count: 1,
            data: [{ ...userGameHistory, cover: `${baseUrl}/uploads/games/default-cover.jpg` }]
        });
    });
    test('400 Bad Request', async () => {
        const req = mockRequest({ params: { userGameId: 'a' } });
        const res = mockResponse();
        const errors = [{
            value: 'a',
            msg: 'UserGameId must be an integer',
            param: 'userGameId',
            location: 'params'
        }];

        validationResult.mockImplementation(() => ({
            isEmpty: () => false,
            array: () => errors
        }));

        await userGameHistoryController.findHistoriesByUserGameId(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({
            statusCode: 400,
            errors
        });
    });
});
