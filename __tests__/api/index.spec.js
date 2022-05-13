const request = require('supertest');
const app = require('../../app');
const { baseUrl } = require('../../config/constants');
const { internalServerError } = require('../../controllers/error');
const { getEndpoint } = require('../../helper');

process.env.NODE_ENV = 'test';

const mockRequest = ({ body = {}, params = {} } = {}) => ({ body, params });
const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('Error', () => {
    it('404 Not Found', async () => {
        const res = await request(app).get('/api/v1/usergames');
        expect(res.statusCode).toBe(404);
        expect(res.body.statusCode).toBe(404);
        expect(res.body.message).toBe(`Endpoint ${getEndpoint('/api/v1/usergames')} not found`);
    });
    it('500 Internal Server Error', done => {
        const req = mockRequest();
        const res = mockResponse();
        internalServerError(err = { message: 'Internal Server Error' }, req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            statusCode: 500,
            message: 'Internal Server Error'
        });
        done();
    });
});

describe('/api/v1', () => {
    it('GET', async () => {
        const res = await request(app).get('/api/v1');
        expect(res.statusCode).toBe(200);
        expect(res.body.statusCode).toBe(200);
        expect(res.body.message).toBe('OK');
        expect(res.body.version).toBe('v1');
        expect(res.body.endpoints).toBeInstanceOf(Object);
        for (const endpoint in res.body.endpoints) {
            expect(typeof res.body.endpoints[endpoint]).toBe('string');
        }
    });
    it('POST', async () => {
        const res = await request(app).post('/api/v1');
        expect(res.statusCode).toBe(405);
        expect(res.body.statusCode).toBe(405);
        expect(res.body.message).toBe(`Method POST not allowed at endpoint ${getEndpoint('/api/v1')}`);
    });
    it('PUT', async () => {
        const res = await request(app).put('/api/v1');
        expect(res.statusCode).toBe(405);
        expect(res.body.statusCode).toBe(405);
        expect(res.body.message).toBe(`Method PUT not allowed at endpoint ${getEndpoint('/api/v1')}`);
    })
    it('PATCH', async () => {
        const res = await request(app).patch('/api/v1');
        expect(res.statusCode).toBe(405);
        expect(res.body.statusCode).toBe(405);
        expect(res.body.message).toBe(`Method PATCH not allowed at endpoint ${getEndpoint('/api/v1')}`);
    })
    it('DELETE', async () => {
        const res = await request(app).delete('/api/v1');
        expect(res.statusCode).toBe(405);
        expect(res.body.statusCode).toBe(405);
        expect(res.body.message).toBe(`Method DELETE not allowed at endpoint ${getEndpoint('/api/v1')}`);
    })
});

describe('/api', () => {
    it('GET', async () => {
        const res = await request(app).get('/api');
        expect(res.statusCode).toBe(200);
        expect(res.body.statusCode).toBe(200);
        expect(res.body.message).toBe('OK');
        expect(res.body.versions).toBeInstanceOf(Array);
        for (const version of res.body.versions) {
            expect(version).toBeInstanceOf(Object);
        }
    });
    it('POST', async () => {
        const res = await request(app).post('/api');
        expect(res.statusCode).toBe(405);
        expect(res.body.statusCode).toBe(405);
        expect(res.body.message).toBe(`Method POST not allowed at endpoint ${getEndpoint('/api')}`);
    });
    it('PUT', async () => {
        const res = await request(app).put('/api');
        expect(res.statusCode).toBe(405);
        expect(res.body.statusCode).toBe(405);
        expect(res.body.message).toBe(`Method PUT not allowed at endpoint ${getEndpoint('/api')}`);
    })
    it('PATCH', async () => {
        const res = await request(app).patch('/api');
        expect(res.statusCode).toBe(405);
        expect(res.body.statusCode).toBe(405);
        expect(res.body.message).toBe(`Method PATCH not allowed at endpoint ${getEndpoint('/api')}`);
    })
    it('DELETE', async () => {
        const res = await request(app).delete('/api');
        expect(res.statusCode).toBe(405);
        expect(res.body.statusCode).toBe(405);
        expect(res.body.message).toBe(`Method DELETE not allowed at endpoint ${getEndpoint('/api')}`);
    })
});

describe('/', () => {
    it('GET', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toBe(200);
        expect(res.body.statusCode).toBe(200);
        expect(res.body.message).toBe('Welcome to the API');
        expect(res.body.developer).toBe('Muhammad Naufal Kateni');
        expect(res.body.documentation).toBe(`${baseUrl}/api-docs`);
        expect(res.body.apiLogin).toBe(`${baseUrl}/api/v1/login`);
        expect(res.body.api).toBe(`${baseUrl}/api/v1/user_games`);
        expect(res.body.viewLogin).toBe(`${baseUrl}/view/login`);
        expect(res.body.view).toBe(`${baseUrl}/view/user_games`);
    });
    it('POST', async () => {
        const res = await request(app).post('/');
        expect(res.statusCode).toBe(405);
        expect(res.body.statusCode).toBe(405);
        expect(res.body.message).toBe(`Method POST not allowed at endpoint ${getEndpoint('/')}`);
    });
    it('PUT', async () => {
        const res = await request(app).put('/');
        expect(res.statusCode).toBe(405);
        expect(res.body.statusCode).toBe(405);
        expect(res.body.message).toBe(`Method PUT not allowed at endpoint ${getEndpoint('/')}`);
    })
    it('PATCH', async () => {
        const res = await request(app).patch('/');
        expect(res.statusCode).toBe(405);
        expect(res.body.statusCode).toBe(405);
        expect(res.body.message).toBe(`Method PATCH not allowed at endpoint ${getEndpoint('/')}`);
    })
    it('DELETE', async () => {
        const res = await request(app).delete('/');
        expect(res.statusCode).toBe(405);
        expect(res.body.statusCode).toBe(405);
        expect(res.body.message).toBe(`Method DELETE not allowed at endpoint ${getEndpoint('/')}`);
    })
});
