const { validationResult } = require('express-validator');
const { badRequest, notFound } = require('./error');
const { UserGame, UserGameBiodata, UserGameHistory } = require('../database/models');
const { getDataBySpecificField } = require('../helper');

const getUserGameById = getDataBySpecificField(UserGame, 'id');

module.exports = {
    create: async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) return badRequest(errors.array(), req, res);

        const userGame = await UserGame.create(req.body);

        res.status(201).json({
            statusCode: 201,
            message: 'UserGame created successfully',
            data: userGame
        });
    },
    update: async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) return badRequest(errors.array(), req, res);

        const userGame = await getUserGameById(req.params.id);

        if (!userGame) return notFound(req, res);

        const oldUserGameData = { ...userGame.dataValues };
        const userGameFields = Object.keys(userGame.dataValues);
        let fieldChanged = Object.keys(req.body).filter(key => userGameFields.includes(key));
        const before = {}, after = {};

        fieldChanged.forEach(field => {
            before[field] = oldUserGameData[field];
            after[field] = req.body[field];
        });

        await userGame.update(req.body);

        res.status(200).json({
            statusCode: 200,
            message: 'UserGame updated successfully',
            data: { before, after }
        });
    },
    destroy: async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) return badRequest(errors.array(), req, res);

        const userGame = await getUserGameById(req.params.id);

        if (!userGame) return notFound(req, res);

        await userGame.destroy();

        res.status(200).json({
            statusCode: 200,
            message: 'UserGame deleted successfully',
            data: userGame
        });
    },
    findOne: async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) return badRequest(errors.array(), req, res);

        const userGame = await getUserGameById(req.params.id, [
            { model: UserGameBiodata },
            { model: UserGameHistory }
        ]);

        if (!userGame) return notFound(req, res);

        res.status(200).json({
            statusCode: 200,
            message: 'OK',
            data: userGame
        });
    },
    findAll: async (req, res) => {
        const userGames = await UserGame.findAll({
            include: [
                { model: UserGameBiodata },
                { model: UserGameHistory }
            ]
        });

        res.status(200).json({
            statusCode: 200,
            message: 'OK',
            count: userGames.length,
            data: userGames
        });
    }
}
