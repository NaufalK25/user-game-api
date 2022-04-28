const { validationResult } = require('express-validator');
const { badRequest, internalServerError, notFound } = require('./error');
const { sequelizeErrorNames } = require('../config/constants');
const { UserGame, UserGameBiodata, UserGameHistory } = require('../database/models');
const { getDataBySpecificField } = require('../helper');

const getUserGameById = getDataBySpecificField(UserGame, 'id');

module.exports = {
    create: async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) return badRequest(errors.array(), req, res);

            const userGame = await UserGame.create(req.body);

            res.status(201).json({
                statusCode: 201,
                message: 'UserGame created successfully',
                data: userGame,
            });
        } catch (error) {
            if (sequelizeErrorNames.includes(error.name)) {
                badRequest(error, req, res);
            } else {
                internalServerError(error, req, res);
            }
        }
    },
    update: async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) return badRequest(errors.array(), req, res);

            const userGame = await getUserGameById(req.params.id);
            const oldUserGameData = { ...userGame.dataValues };
            const userGameFields = Object.keys(userGame.dataValues);
            let fieldChanged = Object.keys(req.body).filter(key => userGameFields.includes(key));

            const before = {};
            const after = {};

            fieldChanged.forEach(field => {
                before[field] = oldUserGameData[field];
                after[field] = req.body[field];
            });

            if (!userGame) return notFound(req, res);

            await userGame.update(req.body);

            res.status(200).json({
                statusCode: 200,
                message: 'UserGame updated successfully',
                data: {
                    before,
                    after,
                }
            });
        } catch (error) {
            if (sequelizeErrorNames.includes(error.name)) {
                badRequest(error, req, res);
            } else {
                internalServerError(error, req, res);
            }
        }
    },
    destroy: async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) return badRequest(errors.array(), req, res);

            const userGame = await getUserGameById(req.params.id);

            if (!userGame) return notFound(req, res);

            await userGame.destroy();

            res.status(200).json({
                statusCode: 200,
                message: 'UserGame deleted successfully',
                data: userGame,
            });
        } catch (error) {
            internalServerError(error, req, res);
        }
    },
    findOne: async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) return badRequest(errors.array(), req, res);

            const userGame = await getUserGameById(req.params.id, [
                { model: UserGameBiodata, },
                { model: UserGameHistory, }
            ]);

            if (!userGame) return notFound(req, res);

            res.status(200).json({
                statusCode: 200,
                message: 'OK',
                data: userGame,
            });
        } catch (error) {
            internalServerError(error, req, res);
        }
    },
    findAll: async (req, res) => {
        try {
            const userGames = await UserGame.findAll({
                include: [
                    { model: UserGameBiodata, },
                    { model: UserGameHistory, }
                ]
            });

            res.status(200).json({
                statusCode: 200,
                message: 'OK',
                count: userGames.length,
                data: userGames,
            });
        } catch (error) {
            internalServerError(error, req, res);
        }
    },
}
