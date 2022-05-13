const request = require('supertest');
const app = require('../../app');
const { UserGame, UserGameBiodata, UserGameHistory } = require('../../database/models');
const { getDataBySpecificField, getEndpoint } = require('../../helper');

process.env.NODE_ENV = 'test';
const getUserGameLastId = async () => {
    let userGame = await UserGame.findOne({ order: [['id', 'DESC']] });
    if (UserGame.length < 3) {
        await request(app).post('/api/v1/user_games').send({
            username: `testdelete${userGame.id + 1}`,
            password: 'testdelete'
        });
        userGame = await UserGame.findOne({ order: [['id', 'DESC']] });
    }
    return +userGame.id;
}

describe('GET /user_games', () => {
    it('200 OK', async () => {
        const userGames = await UserGame.findAll({
            include: [
                { model: UserGameBiodata },
                { model: UserGameHistory }
            ]
        });
        const res = await request(app).get('/api/v1/user_games');
        expect(res.statusCode).toBe(200);
        expect(res.body.statusCode).toBe(200);
        expect(res.body.message).toBe('OK');
        expect(res.body.count).toBe(userGames.length);

        const responseData = res.body.data;
        expect(responseData).toBeInstanceOf(Array);
        expect(responseData).toHaveLength(userGames.length);
        for (let i = 0; i < userGames.length; i++) {
            for (const key in userGames[i].dataValues) {
                expect(responseData[i]).toHaveProperty(key);
                expect(JSON.stringify(responseData[i][key])).toBe(JSON.stringify(userGames[i].dataValues[key]));
            }

            const biodata = responseData[i].UserGameBiodatum;
            const histories = responseData[i].UserGameHistories;
            if (biodata) {
                expect(biodata).toBeInstanceOf(Object);
                for (const key in userGames[i].UserGameBiodatum.dataValues) {
                    expect(biodata).toHaveProperty(key);
                    expect(JSON.stringify(biodata[key])).toBe(JSON.stringify(userGames[i].UserGameBiodatum.dataValues[key]));
                }
            } else {
                expect(biodata).toBeNull();
            }

            expect(histories).toBeInstanceOf(Array);
            expect(histories).toHaveLength(userGames[i].UserGameHistories.length);
            if (histories.length > 0 && histories.length === userGames[i].UserGameHistories.length) {
                for (let j = 0; j < histories.length; j++) {
                    expect(histories[j]).toBeInstanceOf(Object);
                    for (const key in userGames[i].UserGameHistories[j].dataValues) {
                        expect(histories[j]).toHaveProperty(key);
                        expect(JSON.stringify(histories[j][key])).toBe(JSON.stringify(userGames[i].UserGameHistories[j].dataValues[key]));
                    }
                }
            }
        }
    });
});

describe('POST /user_games', () => {
    it('201 Created', async () => {
        const randomUsername = `testcreate${await getUserGameLastId() + 1}`;
        const res = await request(app).post('/api/v1/user_games').send({
            username: randomUsername,
            password: 'testcreate'
        });
        expect(res.statusCode).toBe(201);
        expect(res.body.statusCode).toBe(201);
        expect(res.body.message).toBe('UserGame created successfully');

        const responseData = res.body.data;
        const userGame = await getDataBySpecificField(UserGame, 'username')(randomUsername);
        for (const key in userGame.dataValues) {
            expect(responseData).toHaveProperty(key);
            expect(JSON.stringify(responseData[key])).toBe(JSON.stringify(userGame.dataValues[key]));
        }
    });
    it('400 Bad Request', async () => {
        const res = await request(app).post('/api/v1/user_games').send({ username: '' });
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
    it('400 Bad Request (Username Already Exists)', async () => {
        const res = await request(app).post('/api/v1/user_games').send({
            username: 'bob',
            password: '123'
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

describe('/user_games Method Not Allowed', () => {
    it('PUT /user_games', async () => {
        const res = await request(app).put('/api/v1/user_games');
        expect(res.statusCode).toBe(405);
        expect(res.body.statusCode).toBe(405);
        expect(res.body.message).toBe(`Method PUT not allowed at endpoint ${getEndpoint('/api/v1/user_games')}`);
    });
    it('PATCH /user_games', async () => {
        const res = await request(app).patch('/api/v1/user_games');
        expect(res.statusCode).toBe(405);
        expect(res.body.statusCode).toBe(405);
        expect(res.body.message).toBe(`Method PATCH not allowed at endpoint ${getEndpoint('/api/v1/user_games')}`);
    });
    it('DELETE /user_games', async () => {
        const res = await request(app).delete('/api/v1/user_games');
        expect(res.statusCode).toBe(405);
        expect(res.body.statusCode).toBe(405);
        expect(res.body.message).toBe(`Method DELETE not allowed at endpoint ${getEndpoint('/api/v1/user_games')}`);
    });
});

describe('GET /user_game/:id', () => {
    it('200 OK', async () => {
        const userGame = await getDataBySpecificField(UserGame, 'id')(1, [
            { model: UserGameBiodata },
            { model: UserGameHistory }
        ]);
        const res = await request(app).get('/api/v1/user_game/1');
        expect(res.statusCode).toBe(200);
        expect(res.body.statusCode).toBe(200);
        expect(res.body.message).toBe('OK');

        const responseData = res.body.data;
        expect(responseData).toBeInstanceOf(Object);
        for (const key in userGame.dataValues) {
            expect(responseData).toHaveProperty(key);
            expect(JSON.stringify(responseData[key])).toBe(JSON.stringify(userGame.dataValues[key]));
        }

        const biodata = responseData.UserGameBiodatum;
        const histories = responseData.UserGameHistories;
        if (biodata) {
            expect(biodata).toBeInstanceOf(Object);
            for (const key in userGame.UserGameBiodatum.dataValues) {
                expect(biodata).toHaveProperty(key);
                expect(JSON.stringify(biodata[key])).toBe(JSON.stringify(userGame.UserGameBiodatum.dataValues[key]));
            }
        } else {
            expect(biodata).toBeNull();
        }

        expect(histories).toBeInstanceOf(Array);
        expect(histories).toHaveLength(userGame.UserGameHistories.length);
        if (histories.length > 0 && histories.length === userGame.UserGameHistories.length) {
            for (let i = 0; i < histories.length; i++) {
                expect(histories[i]).toBeInstanceOf(Object);
                for (const key in userGame.UserGameHistories[i].dataValues) {
                    expect(histories[i]).toHaveProperty(key);
                    expect(JSON.stringify(histories[i][key])).toBe(JSON.stringify(userGame.UserGameHistories[i].dataValues[key]));
                }
            }
        }
    });
    it('400 Bad Request', async () => {
        const res = await request(app).get('/api/v1/user_game/a');
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
        const res = await request(app).get('/api/v1/user_game/0');
        expect(res.statusCode).toBe(404);
        expect(res.body.statusCode).toBe(404);
        expect(res.body.message).toBe(`Endpoint ${getEndpoint('/api/v1/user_game/0')} not found`);
    });
});

describe('PATCH /user_game/:id', () => {
    it('200 OK', async () => {
        const updatedData = { password: 'john123' }
        const userGame = await getDataBySpecificField(UserGame, 'id')(1);
        const res = await request(app).patch('/api/v1/user_game/1').send(updatedData);
        expect(res.statusCode).toBe(200);
        expect(res.body.statusCode).toBe(200);
        expect(res.body.message).toBe('UserGame updated successfully');

        const responseData = res.body.data;
        expect(responseData).toBeInstanceOf(Object);
        expect(responseData).toHaveProperty('before');
        expect(responseData).toHaveProperty('after');
        for (const key of Object.keys(updatedData)) {
            expect(responseData.before).toHaveProperty(key);
            expect(responseData.after).toHaveProperty(key);
            expect(responseData.before[key]).toBe(userGame[key]);
            expect(responseData.after[key]).toBe(updatedData[key]);
        }
    });
    it('400 Bad Request (param)', async () => {
        const res = await request(app).patch('/api/v1/user_game/a');
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
        const res = await request(app).patch('/api/v1/user_game/1').send({ username: 'bob' })
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
        const res = await request(app).patch('/api/v1/user_game/0');
        expect(res.statusCode).toBe(404);
        expect(res.body.statusCode).toBe(404);
        expect(res.body.message).toBe(`Endpoint ${getEndpoint('/api/v1/user_game/0')} not found`);
    });
});

describe('DELETE /user_game/:id', () => {
    it('200 OK', async () => {
        const lastId = await getUserGameLastId();
        const userGame = await getDataBySpecificField(UserGame, 'id')(lastId);
        const res = await request(app).delete(`/api/v1/user_game/${lastId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.statusCode).toBe(200);
        expect(res.body.message).toBe('UserGame deleted successfully');

        const responseData = res.body.data;
        expect(responseData).toBeInstanceOf(Object);
        for (const key in userGame.dataValues) {
            expect(responseData).toHaveProperty(key);
            expect(JSON.stringify(responseData[key])).toBe(JSON.stringify(userGame.dataValues[key]));
        }
    });
    it('400 Bad Request', async () => {
        const res = await request(app).delete('/api/v1/user_game/a');
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
        const res = await request(app).delete('/api/v1/user_game/0');
        expect(res.statusCode).toBe(404);
        expect(res.body.statusCode).toBe(404);
        expect(res.body.message).toBe(`Endpoint ${getEndpoint('/api/v1/user_game/0')} not found`);
    });
});

describe('/user_game/:id Method Not Allowed', () => {
    it('POST /user_game/:id', async () => {
        const res = await request(app).post('/api/v1/user_game/1');
        expect(res.statusCode).toBe(405);
        expect(res.body.statusCode).toBe(405);
        expect(res.body.message).toBe(`Method POST not allowed at endpoint ${getEndpoint('/api/v1/user_game/1')}`);
    });
    it('PUT /user_game/:id', async () => {
        const res = await request(app).put('/api/v1/user_game/1');
        expect(res.statusCode).toBe(405);
        expect(res.body.statusCode).toBe(405);
        expect(res.body.message).toBe(`Method PUT not allowed at endpoint ${getEndpoint('/api/v1/user_game/1')}`);
    });
});
