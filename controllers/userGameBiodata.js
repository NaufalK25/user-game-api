const { validationResult } = require('express-validator');
const { badRequest, notFound } = require('./error');
const { UserGame, UserGameBiodata } = require('../database/models');
const { getDataBySpecificField } = require('../helper');

const getUserGameBiodataById = getDataBySpecificField(UserGameBiodata, 'id');

module.exports = {
    create: async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) return badRequest(errors.array(), req, res);

        const userGameBiodata = await UserGameBiodata.create(req.body);

        res.status(201).json({
            statusCode: 201,
            message: 'UserGameBiodata created successfully',
            data: userGameBiodata
        });
    },
    update: async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) return badRequest(errors.array(), req, res);

        const userGameBiodata = await getUserGameBiodataById(req.params.id);

        if (!userGameBiodata) return notFound(req, res);

        const oldUserGameBiodataData = { ...userGameBiodata.dataValues };
        const userGameBiodataFields = Object.keys(userGameBiodata.dataValues);
        let fieldChanged = Object.keys(req.body).filter(key => userGameBiodataFields.includes(key));
        const before = {}, after = {};

        fieldChanged.forEach(field => {
            before[field] = oldUserGameBiodataData[field];
            after[field] = req.body[field];
        });

        await userGameBiodata.update(req.body);

        res.status(200).json({
            statusCode: 200,
            message: 'UserGameBiodata updated successfully',
            data: { before, after }
        });
    },
    destroy: async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) return badRequest(errors.array(), req, res);

        const userGameBiodata = await getUserGameBiodataById(req.params.id);

        if (!userGameBiodata) return notFound(req, res);

        await userGameBiodata.destroy();

        res.status(200).json({
            statusCode: 200,
            message: 'UserGameBiodata deleted successfully',
            data: userGameBiodata
        });
    },
    findOne: async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) return badRequest(errors.array(), req, res);

        const userGameBiodata = await getUserGameBiodataById(req.params.id, [{ model: UserGame }]);

        if (!userGameBiodata) return notFound(req, res);

        res.status(200).json({
            statusCode: 200,
            message: 'OK',
            data: userGameBiodata
        });
    },
    findAll: async (req, res) => {
        const userGameBiodatas = await UserGameBiodata.findAll({ include: [{ model: UserGame }] });

        res.status(200).json({
            statusCode: 200,
            message: 'OK',
            count: userGameBiodatas.length,
            data: userGameBiodatas
        });
    },
    findBiodataByUserGameId: async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) return badRequest(errors.array(), req, res);

        const userGameBiodata = await UserGameBiodata.findAll({ where: { userGameId: req.params.userGameId } });

        res.status(200).json({
            statusCode: 200,
            message: 'OK',
            data: userGameBiodata
        });
    }
}
