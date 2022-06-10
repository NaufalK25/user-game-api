const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const authController = require('../../controllers/auth');
const errorController = require('../../controllers/error');
const { UserGame } = require('../../database/models');

process.env.NODE_ENV = 'test';

const mockRequest = ({ body } = {}) => ({ body });
const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

const createdAt = new Date();
const updatedAt = new Date();
const userGame = {
    id: 1,
    username: 'username',
    password: 'hashedPassword',
    createdAt,
    updatedAt
}
const userGameInclude = {
    ...userGame,
    UserGameBiodatum: null,
    UserGameHistories: []
}

jest.mock('express-validator');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

beforeEach(() => {
    errorController.badRequest = jest.fn().mockImplementation(() => { });
    validationResult.mockImplementation(() => ({
        isEmpty: () => true,
        array: () => []
    }));
});
afterEach(() => {
    jest.clearAllMocks();
});

describe('Login', () => {
    beforeEach(() => {
        bcrypt.compare.mockImplementation(() => true);
        jwt.sign.mockImplementation(() => 'token');
        UserGame.findOne = jest.fn().mockImplementation(() => (userGameInclude));
    });
    test('200 OK', async () => {
        const req = mockRequest({ body: { username: 'username', password: 'hashedPassword' } });
        const res = mockResponse();

        await authController.login(req, res);

        expect(res.status).toBeCalledWith(200);
        expect(res.json).toBeCalledWith({
            statusCode: 200,
            message: 'Logged in successfully',
            token: 'token'
        });
    });
    test('400 Bad Request', async () => {
        const req = mockRequest({ body: { username: 'username', password: '' } });
        const res = mockResponse();
        const errors = [{
            value: '',
            msg: 'Password is required',
            param: 'password',
            location: 'body'
        }];

        validationResult.mockImplementation(() => ({
            isEmpty: () => false,
            array: () => errors
        }));

        await authController.login(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({
            statusCode: 400,
            errors
        });
    });
    test('400 Bad Request (Username not found)', async () => {
        const req = mockRequest({ body: { username: 'username2', password: 'hashedPassword' } });
        const res = mockResponse();

        UserGame.findOne = jest.fn().mockImplementation(() => null);

        await authController.login(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({
            statusCode: 400,
            errors: [{
                value: 'username2',
                msg: 'Username not found',
                param: 'username',
                location: 'body'
            }]
        });
    });
    test('400 Bad Request (Password is incorrect)', async () => {
        const req = mockRequest({ body: { username: 'username', password: 'hashedPassword2' } });
        const res = mockResponse();

        bcrypt.compare.mockImplementation(() => false);

        await authController.login(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({
            statusCode: 400,
            errors: [{
                value: 'hashedPassword2',
                msg: 'Password is incorrect',
                param: 'password',
                location: 'body'
            }]
        });
    });
});

describe('Register', () => {
    beforeEach(() => {
        bcrypt.hash.mockImplementation(() => 'hashedPassword');
        UserGame.create = jest.fn().mockImplementation(() => (userGame));
    });
    test('201 Created', async () => {
        const req = mockRequest({ body: { username: 'username', password: 'hashedPassword' } });
        const res = mockResponse();

        await authController.register(req, res);

        expect(res.status).toBeCalledWith(201);
        expect(res.json).toBeCalledWith({
            statusCode: 201,
            message: 'Registered successfully',
            data: userGame
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

        await authController.register(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({
            statusCode: 400,
            errors
        });
    });
});
