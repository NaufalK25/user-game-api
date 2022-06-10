const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { v4 } = require('uuid');
const { validationResult } = require('express-validator');
const authController = require('../../controllers/views/auth');
const errorController = require('../../controllers/views/error');
const passport = require('../../middlewares/passportLocal');
const { baseUrl } = require('../../config/constants');
const { UserGame, UserGameBiodata } = require('../../database/models');
const { generateErrorRenderObject, generateFlashObject, generateRenderObject } = require('../../helper');

process.env.NODE_ENV = 'test';

const mockRequest = ({ body, params, query, user } = {}) => ({
    body,
    params,
    query,
    user,
    logout: jest.fn(),
    login: jest.fn(),
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

jest.mock('bcrypt');
jest.mock('nodemailer');
jest.mock('uuid');
jest.mock('express-validator');

beforeEach(() => {
    bcrypt.hash.mockImplementation(() => 'hashedPassword');
    nodemailer.createTransport.mockImplementation(() => ({
        sendMail: jest.fn().mockImplementation(() => Promise.resolve())
    }));
    validationResult.mockImplementation(() => ({
        isEmpty: () => true,
        array: () => []
    }));
    errorController.internalServerErrorPage = jest.fn().mockImplementation(() => { });
});
afterEach(() => {
    jest.clearAllMocks();
});

describe('Logout', () => { });

describe('Login', () => { });

describe('Register', () => {
    beforeEach(() => {
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
            }
        });
        const res = mockResponse();

        await authController.register(req, res);

        expect(res.status).toBeCalledWith(201);
        expect(res.redirect).toBeCalledWith('/view/login');
    });
    test('400 Bad Request', async () => {
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
            }
        });
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
        expect(res.render).toBeCalledWith('register', generateRenderObject({
            title: 'Register',
            scripts: ['../../js/global.js'],
            extras: { flash: generateFlashObject(req) }
        }));
    });
    test('400 Bad Request (Password Confirmation Does Not Match)', async () => {
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
            }
        });
        const res = mockResponse();

        await authController.register(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.render).toBeCalledWith('register', generateRenderObject({
            title: 'Register',
            scripts: ['../../js/global.js'],
            extras: { flash: generateFlashObject(req) }
        }));
    });
});

describe('Send Email', () => {
    beforeEach(() => {
        v4.mockImplementation(() => 'token');
        UserGameBiodata.findOne = jest.fn().mockImplementation(() => ({ ...userGameBiodata }));
    });
    test('200 OK', async () => {
        const req = mockRequest({ body: { email: 'email@test.com' } });
        const res = mockResponse();

        await authController.sendEmail(req, res);

        expect(res.status).toBeCalledWith(200);
        expect(res.redirect).toBeCalledWith('/view/login');
    });
    test('404 Not Found (Email Not Found)', async () => {
        const req = mockRequest({ body: { email: 'email@test.com' } });
        const res = mockResponse();

        UserGameBiodata.findOne = jest.fn().mockImplementation(() => null);

        await authController.sendEmail(req, res);

        expect(res.status).toBeCalledWith(404);
        expect(res.redirect).toBeCalledWith('/view/login');
    });
});

describe('Forgot Password', () => {
    beforeEach(() => {
        UserGame.findByPk = jest.fn().mockImplementation(() => ({ ...userGame }));
        UserGame.update = jest.fn().mockImplementation(() => ({ ...userGame }));
    });
    test('200 OK', async () => {
        const req = mockRequest({ body: { id: 1, password: 'hashedPassword', confirmPassword: 'hashedPassword' } });
        const res = mockResponse();

        await authController.forgotPassword(req, res);

        expect(res.status).toBeCalledWith(200);
        expect(res.redirect).toBeCalledWith('/view/login');
    });
    test('400 Bad Request', async () => {
        const req = mockRequest({ body: { id: 1, password: '', confirmPassword: 'hashedPassword' } });
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

        await authController.forgotPassword(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.render).toBeCalledWith('forgot-password', generateRenderObject({
            title: 'Forgot Password',
            scripts: ['../../js/global.js'],
            extras: {
                id: req.body.id,
                flash: generateFlashObject(req)
            }
        }));
    });
    test('400 Bad Request (Password Confirmation Does Not Match)', async () => {
        const req = mockRequest({ body: { id: 1, password: 'hashedPassword', confirmPassword: 'hashedPassword2' } });
        const res = mockResponse();

        await authController.forgotPassword(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.render).toBeCalledWith('forgot-password', generateRenderObject({
            title: 'Forgot Password',
            scripts: ['../../js/global.js'],
            extras: {
                id: req.body.id,
                flash: generateFlashObject(req)
            }
        }));
    });
    test('404 Not Found (User Game Id Does Not Exist)', async () => {
        const req = mockRequest({ body: { id: 1, password: 'hashedPassword', confirmPassword: 'hashedPassword' } });
        const res = mockResponse();

        UserGame.findByPk = jest.fn().mockImplementation(() => null);

        await authController.forgotPassword(req, res);

        expect(res.status).toBeCalledWith(404);
        expect(res.redirect).toBeCalledWith('/view/login');
    });
});

describe('Get Send Email Page', () => {
    test('200 OK', () => {
        const req = mockRequest();
        const res = mockResponse();

        authController.getSendEmailPage(req, res);

        expect(res.status).toBeCalledWith(200);
        expect(res.render).toBeCalledWith('send-email', generateRenderObject({
            title: 'Send Email',
            scripts: ['../../js/global.js'],
            extras: { flash: generateFlashObject(req) }
        }));
    });
});

describe('Get Forgot Password Page', () => {
    test('200 OK', () => {
        const req = mockRequest({ query: { id: 1, token: 'token' } });
        const res = mockResponse();

        authController.tokens[1] = 'token';

        authController.getForgotPasswordPage(req, res);

        expect(res.status).toBeCalledWith(200);
        expect(res.render).toBeCalledWith('forgot-password', generateRenderObject({
            title: 'Forgot Password',
            scripts: ['../../js/global.js'],
            extras: {
                id: req.query.id,
                flash: generateFlashObject(req)
            }
        }));
    });
    test('400 Bad Request', () => {
        const req = mockRequest({ query: { id: 'a', token: 'token' } });
        const res = mockResponse();
        const errors = [{
            value: 'a',
            msg: 'Id must be an integer',
            param: 'id',
            location: 'query'
        }];

        validationResult.mockImplementation(() => ({
            isEmpty: () => false,
            array: () => errors
        }));

        authController.getForgotPasswordPage(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.redirect).toBeCalledWith('/view/login');
    });
    test('400 Bad Request (Invalid Token)', () => {
        const req = mockRequest({ query: { id: 1, token: 'token2' } });
        const res = mockResponse();

        authController.getForgotPasswordPage(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.redirect).toBeCalledWith('/view/login');
    });
});

describe('Get Login Page', () => {
    test('200 OK', () => {
        const req = mockRequest();
        const res = mockResponse();

        authController.getLoginPage(req, res);

        expect(res.status).toBeCalledWith(200);
        expect(res.render).toBeCalledWith('login', generateRenderObject({
            title: 'Login',
            scripts: ['../../js/global.js'],
            extras: { flash: generateFlashObject(req) }
        }));
    });
});

describe('Get Register Page', () => {
    test('200 OK', () => {
        const req = mockRequest();
        const res = mockResponse();

        authController.getRegisterPage(req, res);

        expect(res.status).toBeCalledWith(200);
        expect(res.render).toBeCalledWith('register', generateRenderObject({
            title: 'Register',
            scripts: ['../../js/global.js'],
            extras: { flash: generateFlashObject(req) }
        }));
    });
});
