const errorController = require('../../controllers/error');
const { getEndpoint } = require('../../helper');

const mockRequest = ({ method, originalName } = {}) => ({ method, originalName });
const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

describe('errorController', () => {
    test('400 Bad Request', () => {
        const req = mockRequest();
        const res = mockResponse();

        errorController.badRequest([], req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith({
            statusCode: 400,
            errors: []
        });
    });
    test('401 Unauthorized', () => {
        const req = mockRequest();
        const res = mockResponse();

        errorController.unAuthorized(req, res);

        expect(res.status).toBeCalledWith(401);
        expect(res.json).toBeCalledWith({
            statusCode: 401,
            message: 'Unauthorized'
        });
    });
    test('403 Forbidden', () => {
        const req = mockRequest();
        const res = mockResponse();

        errorController.forbidden(req, res);

        expect(res.status).toBeCalledWith(403);
        expect(res.json).toBeCalledWith({
            statusCode: 403,
            message: 'Forbidden'
        });
    });
    test('404 Not Found', () => {
        const req = mockRequest({ originalName: '/api/v1/user_game' });
        const res = mockResponse();

        errorController.notFound(req, res);

        expect(res.status).toBeCalledWith(404);
        expect(res.json).toBeCalledWith({
            statusCode: 404,
            message: `Endpoint ${getEndpoint(req.originalUrl)} not found`
        });
    });
    test('405 Method Not Allowed', () => {
        const req = mockRequest({ method: 'POST', originalName: '/api/v1/user_game' });
        const res = mockResponse();

        errorController.methodNotAllowed(req, res);

        expect(res.status).toBeCalledWith(405);
        expect(res.json).toBeCalledWith({
            statusCode: 405,
            message: `Method ${req.method} not allowed at endpoint ${getEndpoint(req.originalUrl)}`
        });
    });
    test('500 Internal Server Error', () => {
        const req = mockRequest();
        const res = mockResponse();

        errorController.internalServerError('Internal Server Error', req, res);

        expect(res.status).toBeCalledWith(500);
        expect(res.json).toBeCalledWith({
            statusCode: 500,
            message: 'Internal Server Error'
        });
    });
    test('500 Internal Server Error with message', () => {
        const req = mockRequest();
        const res = mockResponse();

        errorController.internalServerError(new Error('Internal Server Error'), req, res);

        expect(res.status).toBeCalledWith(500);
        expect(res.json).toBeCalledWith({
            statusCode: 500,
            message: 'Internal Server Error'
        });
     });
})
