const request = require('supertest');
const app = require('../../app');
const { getEndpoint } = require('../../helper');

process.env.NODE_ENV = 'test';

describe('POST /login', () => {
    it('200 OK', async () => {
        const res = await request(app).post('/api/v1/login').send({
            username: 'johntest',
            password: 'john123'
        });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(typeof res.body.token).toBe('string');
    });
    it('400 Bad Request (Empty Body)', async () => {
        const res = await request(app).post('/api/v1/login').send({});
        expect(res.statusCode).toBe(400);
        expect(res.body.statusCode).toBe(400);
        expect(res.body.errors).toBeInstanceOf(Array);
        for (const error of res.body.errors) {
            expect(error).toBeInstanceOf(Object);
            expect(error).toHaveProperty('msg');
            expect(error).toHaveProperty('param');
            expect(error).toHaveProperty('location');
        }
    });
    it('400 Bad Request (Username Not Found)', async () => {
        const res = await request(app).post('/api/v1/login').send({
            username: 'john',
            password: 'john123'
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.statusCode).toBe(400);
        expect(res.body.errors).toBeInstanceOf(Array);
        for (const error of res.body.errors) {
            expect(error).toBeInstanceOf(Object);
            expect(error).toHaveProperty('msg');
            expect(error).toHaveProperty('param');
            expect(error).toHaveProperty('location');
        }
    });
    it('400 Bad Request (Incorrect Password)', async () => {
        const res = await request(app).post('/api/v1/login').send({
            username: 'johntest',
            password: 'john1234'
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.statusCode).toBe(400);
        expect(res.body.errors).toBeInstanceOf(Array);
        for (const error of res.body.errors) {
            expect(error).toBeInstanceOf(Object);
            expect(error).toHaveProperty('msg');
            expect(error).toHaveProperty('param');
            expect(error).toHaveProperty('location');
        }
    });
});

describe('/login Method Not Allowed', () => {
    it('GET /login', async () => {
        const res = await request(app).get('/api/v1/login');
        expect(res.statusCode).toBe(405);
        expect(res.body.statusCode).toBe(405);
        expect(res.body.message).toBe(`Method GET not allowed at endpoint ${getEndpoint('/api/v1/login')}`);
    });
    it('PUT /login', async () => {
        const res = await request(app).put('/api/v1/login');
        expect(res.statusCode).toBe(405);
        expect(res.body.statusCode).toBe(405);
        expect(res.body.message).toBe(`Method PUT not allowed at endpoint ${getEndpoint('/api/v1/login')}`);
    });
    it('PATCH /login', async () => {
        const res = await request(app).patch('/api/v1/login');
        expect(res.statusCode).toBe(405);
        expect(res.body.statusCode).toBe(405);
        expect(res.body.message).toBe(`Method PATCH not allowed at endpoint ${getEndpoint('/api/v1/login')}`);
    });
    it('DELETE /login', async () => {
        const res = await request(app).delete('/api/v1/login');
        expect(res.statusCode).toBe(405);
        expect(res.body.statusCode).toBe(405);
        expect(res.body.message).toBe(`Method DELETE not allowed at endpoint ${getEndpoint('/api/v1/login')}`);
    });
});
