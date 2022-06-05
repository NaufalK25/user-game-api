const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { badRequest } = require('./error');
const { jwtSecret } = require('../config/constants');
const { UserGame, UserGameBiodata, UserGameHistory } = require('../database/models');

module.exports = {
    login: async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) return badRequest(errors.array(), req, res);

        const { username, password } = req.body;
        const userGame = await UserGame.findOne({ where: { username }, include: [
            { model: UserGameBiodata },
            { model: UserGameHistory }
        ]});

        if (!userGame) {
            return badRequest([{
                value: username,
                msg: 'Username not found',
                param: 'username',
                location: 'body'
            }], req, res);
        }

        const checkPassword = await bcrypt.compare(password, userGame.password);

        if (!checkPassword) {
            return badRequest([{
                value: password,
                msg: 'Password is incorrect',
                param: 'password',
                location: 'body'
            }], req, res);
        }

        const token = jwt.sign({ id: userGame.id }, jwtSecret, { expiresIn: '1h' });

        res.status(200).json({
            statusCode: 200,
            message: 'Logged in successfully',
            token
        });
    },
    register: async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) return badRequest(errors.array(), req, res);

        const userGame = await UserGame.create({
            username: req.body.username,
            password: await bcrypt.hash(req.body.password, 10)
        });

        res.status(201).json({
            statusCode: 201,
            message: 'Registered successfully',
            data: userGame
        });
    }
}
