const { validationResult } = require('express-validator');
const { baseUrl } = require('../../config/constants');
const errorController = require('../../controllers/error');
const userGameBiodataController = require('../../controllers/userGameBiodata');
const { UserGameBiodata } = require('../../database/models');
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
const userGame = {
    id: 1,
    username: 'username',
    password: 'hashedPassword',
    roleId: 2,
    createdAt,
    updatedAt
};
const userGameBiodataInclude = {
    ...userGameBiodata,
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
    UserGameBiodata.findByPk = jest.fn().mockImplementation(() => ({ ...userGameBiodata }));
})
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
            }
        });
        const res = mockResponse();

        await userGameBiodataController.create(req, res);

        expect(res.status).toBeCalledWith(201);
        expect(res.json).toBeCalledWith({
            statusCode: 201,
            message: 'UserGameBiodata created successfully',
            data: { ...userGameBiodata, profilePicture: `${baseUrl}/uploads/profiles/default-profile.png` }
        });
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
            }
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

        await userGameBiodataController.create(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({
            statusCode: 400,
            errors
        });
    });
});

describe('Update User Game Biodata', () => {
    beforeEach(() => {
        UserGameBiodata.update = jest.fn().mockImplementation(() => ({ ...userGameBiodata }));
    });
    test('200 OK', async () => {
        const req = mockRequest({ body: { firstname: 'firstname2', lastname: 'lastname2' }, params: { id: 1 } });
        const res = mockResponse();

        UserGameBiodata.findByPk = jest.fn().mockImplementation(() => ({ dataValues: { ...userGameBiodata } }));

        await userGameBiodataController.update(req, res);

        expect(res.status).toBeCalledWith(200);
        expect(res.json).toBeCalledWith({
            statusCode: 200,
            message: 'UserGameBiodata updated successfully',
            data: {
                before: { firstname: 'firstname', lastname: 'lastname' },
                after: { firstname: 'firstname2', lastname: 'lastname2' }
            }
        });
    });
    test('400 Bad Request', async () => {
        const req = mockRequest({ body: { firstname: '' }, params: { id: 1 } });
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

        await userGameBiodataController.update(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({
            statusCode: 400,
            errors
        });
    });
    test('404 Not Found', async () => {
        const req = mockRequest({ params: { id: 1 }, originalUrl: '/api/v1/user_game/biodata/1' });
        const res = mockResponse();

        UserGameBiodata.findByPk = jest.fn().mockImplementation(() => null);

        await userGameBiodataController.update(req, res);

        expect(res.status).toBeCalledWith(404);
        expect(res.json).toBeCalledWith({
            statusCode: 404,
            message: `Endpoint ${getEndpoint(req.originalUrl)} not found`
        });
    });
});

describe('Delete User Game Biodata', () => {
    beforeEach(() => {
        UserGameBiodata.destroy = jest.fn().mockImplementation(() => ({ ...userGameBiodata }));
    });
    test('200 OK', async () => {
        const req = mockRequest({ params: { id: 1 } });
        const res = mockResponse();

        await userGameBiodataController.destroy(req, res);

        expect(res.status).toBeCalledWith(200);
        expect(res.json).toBeCalledWith({
            statusCode: 200,
            message: 'UserGameBiodata deleted successfully',
            data: { ...userGameBiodata, profilePicture: `${baseUrl}/uploads/profiles/default-profile.png` }
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

        await userGameBiodataController.destroy(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({
            statusCode: 400,
            errors
        });
    });
    test('404 Not Found', async () => {
        const req = mockRequest({ params: { id: 1 }, originalUrl: '/api/v1/user_game/biodata/1' });
        const res = mockResponse();

        UserGameBiodata.findByPk = jest.fn().mockImplementation(() => null);

        await userGameBiodataController.destroy(req, res);

        expect(res.status).toBeCalledWith(404);
        expect(res.json).toBeCalledWith({
            statusCode: 404,
            message: `Endpoint ${getEndpoint(req.originalUrl)} not found`
        });
    });
});

describe('Get User Game Biodata By Id', () => {
    test('200 OK', async () => {
        const req = mockRequest({ params: { id: 1 } });
        const res = mockResponse();

        UserGameBiodata.findByPk = jest.fn().mockImplementation(() => ({ ...userGameBiodataInclude }));

        await userGameBiodataController.findOne(req, res);

        expect(res.status).toBeCalledWith(200);
        expect(res.json).toBeCalledWith({
            statusCode: 200,
            message: 'OK',
            data: { ...userGameBiodataInclude, profilePicture: `${baseUrl}/uploads/profiles/default-profile.png` }
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

        await userGameBiodataController.findOne(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({
            statusCode: 400,
            errors
        });
    });
    test('404 Not Found', async () => {
        const req = mockRequest({ params: { id: 1 }, originalUrl: '/api/v1/user_game/biodata/1' });
        const res = mockResponse();

        UserGameBiodata.findByPk = jest.fn().mockImplementation(() => null);

        await userGameBiodataController.findOne(req, res);

        expect(res.status).toBeCalledWith(404);
        expect(res.json).toBeCalledWith({
            statusCode: 404,
            message: `Endpoint ${getEndpoint(req.originalUrl)} not found`
        });
    });
});

describe('Get All User Game Biodatas', () => {
    beforeEach(() => {
        UserGameBiodata.findAll = jest.fn().mockImplementation(() => [{ ...userGameBiodataInclude }]);
    });
    test('200 OK', async () => {
        const req = mockRequest();
        const res = mockResponse();

        await userGameBiodataController.findAll(req, res);

        expect(res.status).toBeCalledWith(200);
        expect(res.json).toBeCalledWith({
            statusCode: 200,
            message: 'OK',
            count: 1,
            data: [{ ...userGameBiodataInclude, profilePicture: `${baseUrl}/uploads/profiles/default-profile.png` }]
        });
    });
});

describe('Get User Game Biodata By User Game Id', () => {
    beforeEach(() => {
        UserGameBiodata.findOne = jest.fn().mockImplementation(() => ({ ...userGameBiodata }));
    });
    test('200 OK', async () => {
        const req = mockRequest({ params: { userGameId: 1 } });
        const res = mockResponse();

        await userGameBiodataController.findBiodataByUserGameId(req, res);

        expect(res.status).toBeCalledWith(200);
        expect(res.json).toBeCalledWith({
            statusCode: 200,
            message: 'OK',
            data: { ...userGameBiodata, profilePicture: `${baseUrl}/uploads/profiles/default-profile.png` }
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

        await userGameBiodataController.findBiodataByUserGameId(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({
            statusCode: 400,
            errors
        });
    });
});
