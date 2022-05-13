const request = require('supertest');
const app = require('../../app');
const { UserGame, UserGameHistory } = require('../../database/models');
const { getDataBySpecificField, getEndpoint } = require('../../helper');

process.env.NODE_ENV = 'test';
const getUserGameHistoryLastId = async () => {
    let userGameHistory = await UserGameHistory.findOne({ order: [['id', 'DESC']] });
    if (UserGameHistory.length < 3) {
        const userGame = await UserGame.findOne({ order: [['id', 'DESC']] });
        const userGameResponse = await request(app).post('/api/v1/user_games').send({
            username: `testdelete${+userGame.id + 1}`,
            password: 'testdelete'
        });
        const userGameId = userGameResponse.body.data?.id || 1;
        await request(app).post('/api/v1/user_games/histories').send({
            title: 'testdelete',
            publisher: 'testdelete',
            score: 100,
            userGameId
        });
        userGameHistory = await UserGameHistory.findOne({ order: [['id', 'DESC']] });
    }
    return +userGameHistory.id;
}

describe('GET /user_games/histories', () => {
    it('200 OK', async () => {
        const userGameHistories = await UserGameHistory.findAll({ include: [{ model: UserGame }] });
        const res = await request(app).get('/api/v1/user_games/histories');
        expect(res.statusCode).toBe(200);
        expect(res.body.statusCode).toBe(200);
        expect(res.body.message).toBe('OK');
        expect(res.body.count).toBe(userGameHistories.length);

        const responseData = res.body.data;
        expect(responseData).toBeInstanceOf(Array);
        expect(responseData).toHaveLength(userGameHistories.length);
        for (let i = 0; i < userGameHistories.length; i++) {
            for (const key in userGameHistories[i].dataValues) {
                expect(responseData[i]).toHaveProperty(key);
                expect(JSON.stringify(responseData[i][key])).toBe(JSON.stringify(userGameHistories[i].dataValues[key]));

                const userGame = responseData[i].UserGame;
                if (userGame) {
                    expect(userGame).toBeInstanceOf(Object);
                    for (const key in userGameHistories[i].UserGame.dataValues) {
                        expect(userGame).toHaveProperty(key);
                        expect(JSON.stringify(userGame[key])).toBe(JSON.stringify(userGameHistories[i].UserGame.dataValues[key]));
                    }
                } else {
                    expect(userGame).toBeNull();
                }
            }
        }
    });
});

describe('POST /user_games/histories', () => {
    it('201 Created', async () => {
        const userGame = await UserGame.findOne({ order: [['id', 'DESC']] });
        const userGameResponse = await request(app).post('/api/v1/user_games').send({
            username: `testcreate${+userGame.id + 1}`,
            password: 'testcreate'
        });
        const userGameId = userGameResponse.body.data?.id || 1;
        const userGameHistoryLastId = await getUserGameHistoryLastId();
        const randomTitle = `testcreate${userGameHistoryLastId + 1}`;
        const res = await request(app).post('/api/v1/user_games/histories').send({
            title: randomTitle,
            publisher: 'testcreate',
            score: 100,
            userGameId
        });
        expect(res.statusCode).toBe(201);
        expect(res.body.statusCode).toBe(201);
        expect(res.body.message).toBe('UserGameHistory created successfully');

        const responseData = res.body.data;
        const userGameHistory = await getDataBySpecificField(UserGameHistory, 'title')(randomTitle);
        for (const key in userGameHistory.dataValues) {
            expect(responseData).toHaveProperty(key);
            expect(JSON.stringify(responseData[key])).toBe(JSON.stringify(userGameHistory.dataValues[key]));
        }
    });
    it('400 Bad Request', async () => {
        const res = await request(app).post('/api/v1/user_games/histories').send({
            title: '',
            publisher: '',
            score: '100',
            userGameId: 1
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

describe('/user_games/histories Method Not Allowed', () => {
    it('PUT /user_games/histories', async () => {
        const res = await request(app).put('/api/v1/user_games/histories');
        expect(res.statusCode).toBe(405);
        expect(res.body.statusCode).toBe(405);
        expect(res.body.message).toBe(`Method PUT not allowed at endpoint ${getEndpoint('/api/v1/user_games/histories')}`);
    });
    it('PATCH /user_games/histories', async () => {
        const res = await request(app).patch('/api/v1/user_games/histories');
        expect(res.statusCode).toBe(405);
        expect(res.body.statusCode).toBe(405);
        expect(res.body.message).toBe(`Method PATCH not allowed at endpoint ${getEndpoint('/api/v1/user_games/histories')}`);
    });
    it('DELETE /user_games/histories', async () => {
        const res = await request(app).delete('/api/v1/user_games/histories');
        expect(res.statusCode).toBe(405);
        expect(res.body.statusCode).toBe(405);
        expect(res.body.message).toBe(`Method DELETE not allowed at endpoint ${getEndpoint('/api/v1/user_games/histories')}`);
    });
});

describe('GET /user_game/history/:id', () => {
    it('200 OK', async () => {
        const res = await request(app).get('/api/v1/user_game/history/1');
        expect(res.statusCode).toBe(200);
        expect(res.body.statusCode).toBe(200);
        expect(res.body.message).toBe('OK');

        const responseData = res.body.data;
        expect(responseData).toBeInstanceOf(Object);
        const userGameHistory = await getDataBySpecificField(UserGameHistory, 'id')(1, [{ model: UserGame }]);
        for (const key in userGameHistory.dataValues) {
            expect(responseData).toHaveProperty(key);
            expect(JSON.stringify(responseData[key])).toBe(JSON.stringify(userGameHistory.dataValues[key]));

            const userGame = responseData.UserGame;
            if (userGame) {
                expect(userGame).toBeInstanceOf(Object);
                for (const key in userGameHistory.UserGame.dataValues) {
                    expect(userGame).toHaveProperty(key);
                    expect(JSON.stringify(userGame[key])).toBe(JSON.stringify(userGameHistory.UserGame.dataValues[key]));
                }
            } else {
                expect(userGame).toBeNull();
            }
        }
    });
    it('400 Bad Request', async () => {
        const res = await request(app).get('/api/v1/user_game/history/a');
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
    it('404 Not Found', async () => {
        const res = await request(app).get('/api/v1/user_game/history/0');
        expect(res.statusCode).toBe(404);
        expect(res.body.statusCode).toBe(404);
        expect(res.body.message).toBe(`Endpoint ${getEndpoint('/api/v1/user_game/history/0')} not found`);
    });
});

describe('PATCH /user_game/history/:id', () => {
    it('200 OK', async () => {
        const updatedData = {
            title: 'GTA V',
            publisher: 'Rockstar Games'
        };
        const userGameHistory = await getDataBySpecificField(UserGameHistory, 'id')(1);
        const res = await request(app).patch('/api/v1/user_game/history/1').send(updatedData);
        expect(res.statusCode).toBe(200);
        expect(res.body.statusCode).toBe(200);
        expect(res.body.message).toBe('UserGameHistory updated successfully');

        const responseData = res.body.data;
        expect(responseData).toBeInstanceOf(Object);
        expect(responseData).toHaveProperty('before');
        expect(responseData).toHaveProperty('after');
        for (const key of Object.keys(updatedData)) {
            expect(responseData.before).toHaveProperty(key);
            expect(responseData.after).toHaveProperty(key);
            expect(responseData.before[key]).toBe(userGameHistory[key]);
            expect(responseData.after[key]).toBe(updatedData[key]);
        }
    });
    it('400 Bad Request (param)', async () => {
        const res = await request(app).patch('/api/v1/user_game/history/a');
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
    it('400 Bad Request (body)', async () => {
        const res = await request(app).patch('/api/v1/user_game/history/1').send({ score: 'a' })
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
    it('404 Not Found', async () => {
        const res = await request(app).patch('/api/v1/user_game/history/0');
        expect(res.statusCode).toBe(404);
        expect(res.body.statusCode).toBe(404);
        expect(res.body.message).toBe(`Endpoint ${getEndpoint('/api/v1/user_game/history/0')} not found`);
    });
});

describe('DELETE /user_game/biodata/:id', () => {
    it('200 OK', async () => {
        const lastId = await getUserGameHistoryLastId();
        const userGameHistory = await getDataBySpecificField(UserGameHistory, 'id')(lastId);
        const res = await request(app).delete(`/api/v1/user_game/history/${lastId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.statusCode).toBe(200);
        expect(res.body.message).toBe('UserGameHistory deleted successfully');

        const responseData = res.body.data;
        expect(responseData).toBeInstanceOf(Object);
        for (const key in userGameHistory.dataValues) {
            expect(responseData).toHaveProperty(key);
            expect(JSON.stringify(responseData[key])).toBe(JSON.stringify(userGameHistory.dataValues[key]));
        }
    });
    it('400 Bad Request', async () => {
        const res = await request(app).delete('/api/v1/user_game/history/a');
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
    it('404 Not Found', async () => {
        const res = await request(app).delete('/api/v1/user_game/history/0');
        expect(res.statusCode).toBe(404);
        expect(res.body.statusCode).toBe(404);
        expect(res.body.message).toBe(`Endpoint ${getEndpoint('/api/v1/user_game/history/0')} not found`);
    });
});

describe('/user_game/history/:id Method Not Allowed', () => {
    it('POST /user_game/history/:id', async () => {
        const res = await request(app).post('/api/v1/user_game/history/1');
        expect(res.statusCode).toBe(405);
        expect(res.body.statusCode).toBe(405);
        expect(res.body.message).toBe(`Method POST not allowed at endpoint ${getEndpoint('/api/v1/user_game/history/1')}`);
    });
    it('PUT /user_game/history/:id', async () => {
        const res = await request(app).put('/api/v1/user_game/history/1');
        expect(res.statusCode).toBe(405);
        expect(res.body.statusCode).toBe(405);
        expect(res.body.message).toBe(`Method PUT not allowed at endpoint ${getEndpoint('/api/v1/user_game/history/1')}`);
    });
});

describe('GET /user_game/:userGameId/history', () => {
    it('200 OK', async () => {
        const userGameHistories = await UserGameHistory.findAll({ where: { userGameId: 1 } });
        const res = await request(app).get('/api/v1/user_game/1/history');
        expect(res.statusCode).toBe(200);
        expect(res.body.statusCode).toBe(200);
        expect(res.body.message).toBe('OK');
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.data.length).toBe(userGameHistories.length);

        for (let i = 0; i < userGameHistories.length; i++) {
            const userGameHistory = userGameHistories[i];
            const responseData = res.body.data[i];
            expect(responseData).toBeInstanceOf(Object);
            for (const key in userGameHistory.dataValues) {
                expect(responseData).toHaveProperty(key);
                expect(JSON.stringify(responseData[key])).toBe(JSON.stringify(userGameHistory.dataValues[key]));
            }
        }
    });
    it('400 Bad Request', async () => {
        const res = await request(app).get('/api/v1/user_game/a/history');
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

describe('/user_game/:userGameId/history Method Not Allowed', () => {
    it('POST /user_game/:userGameId/history', async () => {
        const res = await request(app).post('/api/v1/user_game/1/history');
        expect(res.statusCode).toBe(405);
        expect(res.body.statusCode).toBe(405);
        expect(res.body.message).toBe(`Method POST not allowed at endpoint ${getEndpoint('/api/v1/user_game/1/history')}`);
    });
    it('PUT /user_game/:userGameId/history', async () => {
        const res = await request(app).put('/api/v1/user_game/1/history');
        expect(res.statusCode).toBe(405);
        expect(res.body.statusCode).toBe(405);
        expect(res.body.message).toBe(`Method PUT not allowed at endpoint ${getEndpoint('/api/v1/user_game/1/history')}`);
    });
    it('PATCH /user_game/:userGameId/history', async () => {
        const res = await request(app).patch('/api/v1/user_game/1/history');
        expect(res.statusCode).toBe(405);
        expect(res.body.statusCode).toBe(405);
        expect(res.body.message).toBe(`Method PATCH not allowed at endpoint ${getEndpoint('/api/v1/user_game/1/history')}`);
    });
    it('DELETE /user_game/:userGameId/history', async () => {
        const res = await request(app).delete('/api/v1/user_game/1/history');
        expect(res.statusCode).toBe(405);
        expect(res.body.statusCode).toBe(405);
        expect(res.body.message).toBe(`Method DELETE not allowed at endpoint ${getEndpoint('/api/v1/user_game/1/history')}`);
    });
});
