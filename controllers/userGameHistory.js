const { validationResult } = require('express-validator');
const { badRequest, internalServerError, notFound } = require('./error');
const { UserGame, UserGameHistory } = require('../database/models');
const { getDataById, sequelizeErrorNames } = require('../helper');

const getUserGameHistoryById = getDataById(UserGameHistory);

module.exports = {
    create: async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                badRequest(errors.array(), req, res);
                return;
            }

            const userGameHistory = await UserGameHistory.create({
                title: req.body.title,
                publisher: req.body.publisher,
                lastPlayed: new Date(),
                score: req.body.score,
                userGameId: req.body.userGameId,
            });

            res.status(201).json({
                statusCode: 201,
                message: 'UserGameHistory created successfully',
                data: userGameHistory,
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

            if (!errors.isEmpty()) {
                badRequest(errors.array(), req, res);
                return;
            }

            const userGameHistory = await getUserGameHistoryById(req.params.id);
            const oldUserGameHistoryData = { ...userGameHistory.dataValues };
            const userGameHistoryFields = Object.keys(userGameHistory.dataValues);
            let fieldChanged = Object.keys(req.body).filter(key => userGameHistoryFields.includes(key));

            const before = {};
            const after = {};

            fieldChanged.forEach(field => {
                before[field] = oldUserGameHistoryData[field];
                after[field] = req.body[field];
            });

            if (!userGameHistory) {
                notFound(req, res);
                return;
            }

            await userGameHistory.update(req.body);

            res.status(200).json({
                statusCode: 200,
                message: 'UserGameHistory updated successfully',
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

            if (!errors.isEmpty()) {
                badRequest(errors.array(), req, res);
                return;
            }

            const userGameHistory = await getUserGameHistoryById(req.params.id);

            if (!userGameHistory) {
                notFound(req, res);
                return;
            }

            await userGameHistory.destroy();

            res.status(200).json({
                statusCode: 200,
                message: 'UserGameHistory deleted successfully',
                data: userGameHistory,
            });
        } catch (error) {
            internalServerError(error, req, res);
        }
    },
    findOne: async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                badRequest(errors.array(), req, res);
                return;
            }

            const userGameHistory = await getUserGameHistoryById(req.params.id, [{ model: UserGame, }]);

            if (!userGameHistory) {
                notFound(req, res);
                return;
            }

            res.status(200).json({
                statusCode: 200,
                message: 'OK',
                data: userGameHistory,
            });
        } catch (error) {
            internalServerError(error, req, res);
        }
    },
    findAll: async (req, res) => {
        try {
            const userGameHistories = await UserGameHistory.findAll({
                include: [{ model: UserGame, }]
            });

            res.status(200).json({
                statusCode: 200,
                message: 'OK',
                count: userGameHistories.length,
                data: userGameHistories,
            });
        } catch (error) {
            internalServerError(error, req, res);
        }
    },
    findHistoriesByUserGameId: async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                badRequest(errors.array(), req, res);
                return;
            }
            
            const userGameHistories = await UserGameHistory.findAll({
                where: { userGameId: req.params.userGameId, },
            });

            res.status(200).json({
                statusCode: 200,
                message: 'OK',
                count: userGameHistories.length,
                data: userGameHistories,
            });
        } catch (error) {
            internalServerError(error, req, res);
        }
    }
}
