const request = require('supertest');
const app = require('../../app');
const { UserGame, UserGameBiodata } = require('../../database/models');
const { getDataBySpecificField, getEndpoint } = require('../../helper');

process.env.NODE_ENV = 'test';
const getUserGameBiodataLastId = async () => {
    let userGameBiodata = await UserGameBiodata.findOne({ order: [['id', 'DESC']] });
    if (UserGameBiodata.length < 3) {
        const userGame = await UserGame.findOne({ order: [['id', 'DESC']] });
        const userGameResponse = await request(app).post('/api/v1/user_games').send({
            username: `testdelete${+userGame.id + 1}`,
            password: 'testdelete'
        });
        const userGameId = userGameResponse.body.data.id;
        await request(app).post('/api/v1/user_games/biodatas').send({
            email: `testdelete${userGameId}@gmail.com`,
            firstname: 'Test',
            lastname: `Delete ${userGameId}`,
            country: 'USA',
            age: 20,
            userGameId
        });
        userGameBiodata = await UserGameBiodata.findOne({ order: [['id', 'DESC']] });
    }
    return +userGameBiodata.id;
}

describe('GET /user_games/biodatas', () => {
    it('200 OK', async () => {
        const userGameBiodatas = await UserGameBiodata.findAll({ include: [{ model: UserGame }] });
        const res = await request(app).get('/api/v1/user_games/biodatas');
        expect(res.statusCode).toBe(200);
        expect(res.body.statusCode).toBe(200);
        expect(res.body.message).toBe('OK');
        expect(res.body.count).toBe(userGameBiodatas.length);

        const responseData = res.body.data;
        expect(responseData).toBeInstanceOf(Array);
        expect(responseData).toHaveLength(userGameBiodatas.length);
        for (let i = 0; i < userGameBiodatas.length; i++) {
            for (const key in userGameBiodatas[i].dataValues) {
                expect(responseData[i]).toHaveProperty(key);
                expect(JSON.stringify(responseData[i][key])).toBe(JSON.stringify(userGameBiodatas[i].dataValues[key]));

                const userGame = responseData[i].UserGame;
                if (userGame) {
                    expect(userGame).toBeInstanceOf(Object);
                    for (const key in userGameBiodatas[i].UserGame.dataValues) {
                        expect(userGame).toHaveProperty(key);
                        expect(JSON.stringify(userGame[key])).toBe(JSON.stringify(userGameBiodatas[i].UserGame.dataValues[key]));
                    }
                } else {
                    expect(userGame).toBeNull();
                }
            }
        }
    });
});

describe('POST /user_games/biodatas', () => {
    it('201 Created', async () => {
        const userGame = await UserGame.findOne({ order: [['id', 'DESC']] });
        const userGameResponse = await request(app).post('/api/v1/user_games').send({
            username: `testcreate${+userGame.id + 1}`,
            password: 'testcreate'
        });
        const userGameId = userGameResponse.body.data.id;
        const userGameBiodataLastId = await getUserGameBiodataLastId();
        const randomEmail = `testcreate${userGameBiodataLastId + 1}@gmail.com`;
        const res = await request(app).post('/api/v1/user_games/biodatas').send({
            email: randomEmail,
            firstname: 'Test',
            lastname: `Create ${userGameId}`,
            country: 'USA',
            age: 20,
            userGameId
        });
        expect(res.statusCode).toBe(201);
        expect(res.body.statusCode).toBe(201);
        expect(res.body.message).toBe('UserGameBiodata created successfully');

        const responseData = res.body.data;
        const userGameBiodata = await getDataBySpecificField(UserGameBiodata, 'email')(randomEmail);
        for (const key in userGameBiodata.dataValues) {
            expect(responseData).toHaveProperty(key);
            expect(JSON.stringify(responseData[key])).toBe(JSON.stringify(userGameBiodata.dataValues[key]));
        }
    });
    it('400 Bad Request', async () => {
        const res = await request(app).post('/api/v1/user_games/biodatas').send({
            email: '',
            firstname: 0,
            country: true,
            age: '20',
            userGameId: false
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
    it('400 Bad Request (Email Already Exists)', async () => {
        const res = await request(app).post('/api/v1/user_games/biodatas').send({
            email: 'johntest@gmail.com',
            firstname: 'John',
            country: 'Test',
            age: 25,
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

describe('/user_games/biodatas Method Not Allowed', () => {
    it('PUT /user_games/biodatas', async () => {
        const res = await request(app).put('/api/v1/user_games/biodatas');
        expect(res.statusCode).toBe(405);
        expect(res.body.statusCode).toBe(405);
        expect(res.body.message).toBe(`Method PUT not allowed at endpoint ${getEndpoint('/api/v1/user_games/biodatas')}`);
    });
    it('PATCH /user_games/biodatas', async () => {
        const res = await request(app).patch('/api/v1/user_games/biodatas');
        expect(res.statusCode).toBe(405);
        expect(res.body.statusCode).toBe(405);
        expect(res.body.message).toBe(`Method PATCH not allowed at endpoint ${getEndpoint('/api/v1/user_games/biodatas')}`);
    });
    it('DELETE /user_games/biodatas', async () => {
        const res = await request(app).delete('/api/v1/user_games/biodatas');
        expect(res.statusCode).toBe(405);
        expect(res.body.statusCode).toBe(405);
        expect(res.body.message).toBe(`Method DELETE not allowed at endpoint ${getEndpoint('/api/v1/user_games/biodatas')}`);
    });
});

describe('GET /user_game/biodata/:id', () => {
    it('200 OK', async () => {
        const res = await request(app).get('/api/v1/user_game/biodata/1');
        expect(res.statusCode).toBe(200);
        expect(res.body.statusCode).toBe(200);
        expect(res.body.message).toBe('OK');

        const responseData = res.body.data;
        expect(responseData).toBeInstanceOf(Object);
        const userGameBiodata = await getDataBySpecificField(UserGameBiodata, 'id')(1, [{ model: UserGame }]);
        for (const key in userGameBiodata.dataValues) {
            expect(responseData).toHaveProperty(key);
            expect(JSON.stringify(responseData[key])).toBe(JSON.stringify(userGameBiodata.dataValues[key]));

            const userGame = responseData.UserGame;
            if (userGame) {
                expect(userGame).toBeInstanceOf(Object);
                for (const key in userGameBiodata.UserGame.dataValues) {
                    expect(userGame).toHaveProperty(key);
                    expect(JSON.stringify(userGame[key])).toBe(JSON.stringify(userGameBiodata.UserGame.dataValues[key]));
                }
            } else {
                expect(userGame).toBeNull();
            }
        }
    });
    it('400 Bad Request', async () => {
        const res = await request(app).get('/api/v1/user_game/biodata/a');
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
        const res = await request(app).get('/api/v1/user_game/biodata/0');
        expect(res.statusCode).toBe(404);
        expect(res.body.statusCode).toBe(404);
        expect(res.body.message).toBe(`Endpoint ${getEndpoint('/api/v1/user_game/biodata/0')} not found`);
    });
});

describe('PATCH /user_game/biodata/:id', () => {
    it('200 OK', async () => {
        const updatedData = {
            lastname: 'Test 123',
            age: 27
        };
        const userGameBiodata = await getDataBySpecificField(UserGameBiodata, 'id')(1);
        const res = await request(app).patch('/api/v1/user_game/biodata/1').send(updatedData);
        expect(res.statusCode).toBe(200);
        expect(res.body.statusCode).toBe(200);
        expect(res.body.message).toBe('UserGameBiodata updated successfully');

        const responseData = res.body.data;
        expect(responseData).toBeInstanceOf(Object);
        expect(responseData).toHaveProperty('before');
        expect(responseData).toHaveProperty('after');
        for (const key of Object.keys(updatedData)) {
            expect(responseData.before).toHaveProperty(key);
            expect(responseData.after).toHaveProperty(key);
            expect(responseData.before[key]).toBe(userGameBiodata[key]);
            expect(responseData.after[key]).toBe(updatedData[key]);
        }
    });
    it('400 Bad Request (param)', async () => {
        const res = await request(app).patch('/api/v1/user_game/biodata/a');
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
        const res = await request(app).patch('/api/v1/user_game/biodata/1').send({ email: 'johntest@gmail.com' })
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
        const res = await request(app).patch('/api/v1/user_game/biodata/0');
        expect(res.statusCode).toBe(404);
        expect(res.body.statusCode).toBe(404);
        expect(res.body.message).toBe(`Endpoint ${getEndpoint('/api/v1/user_game/biodata/0')} not found`);
    });
});

describe('DELETE /user_game/biodata/:id', () => {
    it('200 OK', async () => {
        const lastId = await getUserGameBiodataLastId();
        const userGameBiodata = await getDataBySpecificField(UserGameBiodata, 'id')(lastId);
        const res = await request(app).delete(`/api/v1/user_game/biodata/${lastId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.statusCode).toBe(200);
        expect(res.body.message).toBe('UserGameBiodata deleted successfully');

        const responseData = res.body.data;
        expect(responseData).toBeInstanceOf(Object);
        for (const key in userGameBiodata.dataValues) {
            expect(responseData).toHaveProperty(key);
            expect(JSON.stringify(responseData[key])).toBe(JSON.stringify(userGameBiodata.dataValues[key]));
        }
    });
    it('400 Bad Request', async () => {
        const res = await request(app).delete('/api/v1/user_game/biodata/a');
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
        const res = await request(app).delete('/api/v1/user_game/biodata/0');
        expect(res.statusCode).toBe(404);
        expect(res.body.statusCode).toBe(404);
        expect(res.body.message).toBe(`Endpoint ${getEndpoint('/api/v1/user_game/biodata/0')} not found`);
    });
});

describe('/user_game/biodata/:id Method Not Allowed', () => {
    it('POST /user_game/biodata/:id', async () => {
        const res = await request(app).post('/api/v1/user_game/biodata/1');
        expect(res.statusCode).toBe(405);
        expect(res.body.statusCode).toBe(405);
        expect(res.body.message).toBe(`Method POST not allowed at endpoint ${getEndpoint('/api/v1/user_game/biodata/1')}`);
    });
    it('PUT /user_game/biodata/:id', async () => {
        const res = await request(app).put('/api/v1/user_game/biodata/1');
        expect(res.statusCode).toBe(405);
        expect(res.body.statusCode).toBe(405);
        expect(res.body.message).toBe(`Method PUT not allowed at endpoint ${getEndpoint('/api/v1/user_game/biodata/1')}`);
    });
});

describe('GET /user_game/:userGameId/biodata', () => {
    it('200 OK', async () => {
        const res = await request(app).get('/api/v1/user_game/1/biodata');
        expect(res.statusCode).toBe(200);
        expect(res.body.statusCode).toBe(200);
        expect(res.body.message).toBe('OK');
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.data.length).toBe(1);

        const responseData = res.body.data[0];
        expect(responseData).toBeInstanceOf(Object);
        const userGameBiodata = await getDataBySpecificField(UserGameBiodata, 'userGameId')(1);
        for (const key in userGameBiodata.dataValues) {
            expect(responseData).toHaveProperty(key);
            expect(JSON.stringify(responseData[key])).toBe(JSON.stringify(userGameBiodata.dataValues[key]));
        }
    });
    it('400 Bad Request', async () => {
        const res = await request(app).get('/api/v1/user_game/a/biodata');
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

describe('/user_game/:userGameId/biodata Method Not Allowed', () => {
    it('POST /user_game/:userGameId/biodata', async () => {
        const res = await request(app).post('/api/v1/user_game/1/biodata');
        expect(res.statusCode).toBe(405);
        expect(res.body.statusCode).toBe(405);
        expect(res.body.message).toBe(`Method POST not allowed at endpoint ${getEndpoint('/api/v1/user_game/1/biodata')}`);
    });
    it('PUT /user_game/:userGameId/biodata', async () => {
        const res = await request(app).put('/api/v1/user_game/1/biodata');
        expect(res.statusCode).toBe(405);
        expect(res.body.statusCode).toBe(405);
        expect(res.body.message).toBe(`Method PUT not allowed at endpoint ${getEndpoint('/api/v1/user_game/1/biodata')}`);
    });
    it('PATCH /user_game/:userGameId/biodata', async () => {
        const res = await request(app).patch('/api/v1/user_game/1/biodata');
        expect(res.statusCode).toBe(405);
        expect(res.body.statusCode).toBe(405);
        expect(res.body.message).toBe(`Method PATCH not allowed at endpoint ${getEndpoint('/api/v1/user_game/1/biodata')}`);
    });
    it('DELETE /user_game/:userGameId/biodata', async () => {
        const res = await request(app).delete('/api/v1/user_game/1/biodata');
        expect(res.statusCode).toBe(405);
        expect(res.body.statusCode).toBe(405);
        expect(res.body.message).toBe(`Method DELETE not allowed at endpoint ${getEndpoint('/api/v1/user_game/1/biodata')}`);
    });
});
