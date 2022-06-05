const fs = require('fs');
const { validationResult } = require('express-validator');
const { badRequest, internalServerError, notFound } = require('./error');
const { baseUrl } = require('../config/constants');
const { UserGame, UserGameHistory } = require('../database/models');

const unlinkGameCoverPath = `${__dirname}/../uploads/games/`;
const jsonGameCoverPath = `${baseUrl}/uploads/games/`;

module.exports = {
    create: async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) return badRequest(errors.array(), req, res);

        const gameCover = req.file ? req.file.filename : 'default-cover.jpg';
        const userGameHistory = await UserGameHistory.create({ ...req.body, cover: gameCover, lastPlayed: new Date() });
        userGameHistory.cover = `${jsonGameCoverPath}${userGameHistory.cover}`;

        res.status(201).json({
            statusCode: 201,
            message: 'UserGameHistory created successfully',
            data: userGameHistory
        });
    },
    update: async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) return badRequest(errors.array(), req, res);

        const userGameHistory = await UserGameHistory.findByPk(req.params.id);

        if (!userGameHistory) return notFound(req, res);

        const gameCover = req.file ? req.file.filename : undefined;
        const requestBody = { ...req.body };

        if (gameCover) requestBody.cover = gameCover;

        const oldUserGameHistoryData = { ...userGameHistory.dataValues };
        const userGameHistoryFields = Object.keys(UserGameHistory.rawAttributes);
        let fieldChanged = Object.keys(requestBody).filter(key => userGameHistoryFields.includes(key));
        const before = {}, after = {};

        fieldChanged.forEach(field => {
            before[field] = oldUserGameHistoryData[field];
            if (typeof oldUserGameHistoryData[field] === 'number') requestBody[field] = parseInt(requestBody[field]);
            after[field] = requestBody[field];
        });

        if (req.file && oldUserGameHistoryData.cover !== 'default-cover.jpg') {
            fs.unlink(`${unlinkGameCoverPath}${oldUserGameHistoryData.cover}`, err => {
                if (err) return console.log(err);
            });
        }

        await UserGameHistory.update(requestBody, { where: { id: req.params.id } });

        if (before.cover && after.cover) {
            before.cover = `${jsonGameCoverPath}${before.cover}`;
            after.cover = `${jsonGameCoverPath}${after.cover}`;
        }

        res.status(200).json({
            statusCode: 200,
            message: 'UserGameHistory updated successfully',
            data: { before, after }
        });
    },
    destroy: async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) return badRequest(errors.array(), req, res);

        const userGameHistory = await UserGameHistory.findByPk(req.params.id);

        if (!userGameHistory) return notFound(req, res);

        const gameCover = userGameHistory.cover;

        if (gameCover !== 'default-cover.jpg') {
            fs.unlink(`${unlinkGameCoverPath}${gameCover}`, err => {
                if (err) return internalServerError(err, req, res);
            });
        }

        await UserGameHistory.destroy({ where: { id: req.params.id } });
        userGameHistory.cover = `${jsonGameCoverPath}${userGameHistory.cover}`;

        res.status(200).json({
            statusCode: 200,
            message: 'UserGameHistory deleted successfully',
            data: userGameHistory
        });
    },
    findOne: async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) return badRequest(errors.array(), req, res);

        const userGameHistory = await UserGameHistory.findByPk(req.params.id, { include: [{ model: UserGame }] });

        if (!userGameHistory) return notFound(req, res);

        userGameHistory.cover = `${jsonGameCoverPath}${userGameHistory.cover}`;

        res.status(200).json({
            statusCode: 200,
            message: 'OK',
            data: userGameHistory
        });
    },
    findAll: async (req, res) => {
        const userGameHistories = await UserGameHistory.findAll({ include: [{ model: UserGame, }] });
        userGameHistories.forEach(userGameHistory => {
            userGameHistory.cover = `${jsonGameCoverPath}${userGameHistory.cover}`;
        });

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
        userGameHistories.forEach(userGameHistory => {
            userGameHistory.cover = `${jsonGameCoverPath}${userGameHistory.cover}`;
        });

        res.status(200).json({
            statusCode: 200,
            message: 'OK',
            count: userGameHistories.length,
            data: userGameHistories
        });
    }
}
