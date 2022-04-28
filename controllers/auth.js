const { validationResult } = require('express-validator');
const { badRequest, internalServerError } = require('./error');
const { sequelizeErrorNames } = require('../config/constants');
const { UserGame, UserGameBiodata, UserGameHistory } = require('../database/models');
const { getDataBySpecificField } = require('../helper');

const getUserGameByUsername = getDataBySpecificField(UserGame, 'username');

module.exports = {
    login: async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) return badRequest(errors.array(), req, res);

            const userGame = await getUserGameByUsername(req.body.username, [
                { model: UserGameBiodata },
                { model: UserGameHistory }
            ]);

            if (userGame.password !== req.body.password) {
                return badRequest(
                    [{
                        value: req.body.password,
                        msg: 'Password is incorrect',
                        param: 'password',
                        location: 'body',
                    }], req, res);
            }

            res.status(200).json({
                token: 'TOKEN',
            });
        } catch (error) {
            if (sequelizeErrorNames.includes(error.name)) {
                badRequest(error, req, res);
            } else {
                internalServerError(error, req, res);
            }
        }
    },
}
