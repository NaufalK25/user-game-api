const { validationResult } = require('express-validator');
const { badRequest } = require('./error');
const { UserGame, UserGameBiodata, UserGameHistory } = require('../database/models');
const { getDataBySpecificField } = require('../helper');

const getUserGameByUsername = getDataBySpecificField(UserGame, 'username');

module.exports = {
    login: async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) return badRequest(errors.array(), req, res);

        const userGame = await getUserGameByUsername(req.body.username, [
            { model: UserGameBiodata },
            { model: UserGameHistory }
        ]);

        if (!userGame) {
            return badRequest([{
                value: req.body.username,
                msg: 'Username not found',
                param: 'username',
                location: 'body'
            }], req, res);
        }
        if (userGame.password !== req.body.password) {
            return badRequest(
                [{
                    value: req.body.password,
                    msg: 'Incorrect password',
                    param: 'password',
                    location: 'body'
                }], req, res);
        }

        res.status(200).json({ token: 'TOKEN' });
    }
}
