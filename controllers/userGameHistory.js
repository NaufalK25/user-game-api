const { validationResult } = require('express-validator');
const { badRequest, notFound } = require('./error');
const { UserGame, UserGameHistory } = require('../database/models');
const { getDataBySpecificField } = require('../helper');

const getUserGameHistoryById = getDataBySpecificField(UserGameHistory, 'id');

module.exports = {
    create: async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) return badRequest(errors.array(), req, res);

        const userGameHistory = await UserGameHistory.create({
            title: req.body.title,
            publisher: req.body.publisher,
            lastPlayed: new Date(),
            score: req.body.score,
            userGameId: req.body.userGameId
        });

        res.status(201).json({
            statusCode: 201,
            message: 'UserGameHistory created successfully',
            data: userGameHistory
        });
    },
    update: async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) return badRequest(errors.array(), req, res);

        const userGameHistory = await getUserGameHistoryById(req.params.id);

        if (!userGameHistory) return notFound(req, res);

        const oldUserGameHistoryData = { ...userGameHistory.dataValues };
        const userGameHistoryFields = Object.keys(userGameHistory.dataValues);
        let fieldChanged = Object.keys(req.body).filter(key => userGameHistoryFields.includes(key));
        const before = {}, after = {};

        fieldChanged.forEach(field => {
            before[field] = oldUserGameHistoryData[field];
            after[field] = req.body[field];
        });

        await userGameHistory.update(req.body);

        res.status(200).json({
            statusCode: 200,
            message: 'UserGameHistory updated successfully',
            data: { before, after }
        });
    },
    destroy: async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) return badRequest(errors.array(), req, res);

        const userGameHistory = await getUserGameHistoryById(req.params.id);

        if (!userGameHistory) return notFound(req, res);

        await userGameHistory.destroy();

        res.status(200).json({
            statusCode: 200,
            message: 'UserGameHistory deleted successfully',
            data: userGameHistory
        });
    },
    findOne: async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) return badRequest(errors.array(), req, res);

        const userGameHistory = await getUserGameHistoryById(req.params.id, [{ model: UserGame }]);

        if (!userGameHistory) return notFound(req, res);

        res.status(200).json({
            statusCode: 200,
            message: 'OK',
            data: userGameHistory
        });
    },
    findAll: async (req, res) => {
        const userGameHistories = await UserGameHistory.findAll({ include: [{ model: UserGame, }] });

        res.status(200).json({
            statusCode: 200,
            message: 'OK',
            count: userGameHistories.length,
            data: userGameHistories
        });
    },
    findHistoriesByUserGameId: async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) return badRequest(errors.array(), req, res);

        const userGameHistories = await UserGameHistory.findAll({ where: { userGameId: req.params.userGameId } });

        res.status(200).json({
            statusCode: 200,
            message: 'OK',
            count: userGameHistories.length,
            data: userGameHistories
        });
    }
}
