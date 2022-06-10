const errorController = require('../../controllers/views/error');
const { getEndpoint, generateErrorRenderObject } = require('../../helper');

const mockRequest = ({ method, originalUrl } = {}) => ({ method, originalUrl });
const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.render = jest.fn().mockReturnValue(res);
    return res;
}

describe('errorController', () => {
    test('notFoundPage', () => {
        const req = mockRequest({ originalUrl: '/view/user_game' });
        const res = mockResponse();

        errorController.notFoundPage(req, res);

        expect(res.status).toBeCalledWith(404);
        expect(res.render).toBeCalledWith('error', generateErrorRenderObject({
            title: '404 Page Not Found',
            message: `Endpoint ${getEndpoint(req.originalUrl)} not found`
        }));
    });
    test('methodNotAllowed', () => {
        const req = mockRequest({ method: 'POST', originalUrl: '/view/user_game/1' });
        const res = mockResponse();

        errorController.methodNotAllowedPage(req, res);

        expect(res.status).toBeCalledWith(405);
        expect(res.render).toBeCalledWith('error', generateErrorRenderObject({
            title: '405 Method Not Allowed',
            message: `Method ${req.method} not allowed at endpoint ${getEndpoint(req.originalUrl)}`
        }));
    });
    test('internalServerError', () => {
        const req = mockRequest();
        const res = mockResponse();

        errorController.internalServerErrorPage('Internal Server Error', req, res);

        expect(res.status).toBeCalledWith(500);
        expect(res.render).toBeCalledWith('error', generateErrorRenderObject({
            title: '500 Internal Server Error',
            message: 'Internal Server Error'
        }));
    });
});
