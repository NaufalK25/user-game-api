const { validationResult } = require('express-validator');
const { badRequest, internalServerError, notFound } = require('./error');
const { UserGame, UserGameBiodata } = require('../database/models');
const { getDataById, sequelizeErrorNames } = require('../helper');

const getUserGameBiodataById = getDataById(UserGameBiodata);

module.exports = {
    create: async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                badRequest(errors.array(), req, res);
                return;
            }

            const userGameBiodata = await UserGameBiodata.create(req.body);

            res.status(201).json({
                statusCode: 201,
                message: 'UserGameBiodata created successfully',
                data: userGameBiodata,
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

            const userGameBiodata = await getUserGameBiodataById(req.params.id);
            const oldUserGameBiodataData = { ...userGameBiodata.dataValues };
            const userGameBiodataFields = Object.keys(userGameBiodata.dataValues);
            let fieldChanged = Object.keys(req.body).filter(key => userGameBiodataFields.includes(key));

            const before = {};
            const after = {};

            fieldChanged.forEach(field => {
                before[field] = oldUserGameBiodataData[field];
                after[field] = req.body[field];
            });

            if (!userGameBiodata) {
                notFound(req, res);
                return;
            }

            await userGameBiodata.update(req.body);

            res.status(200).json({
                statusCode: 200,
                message: 'UserGameBiodata updated successfully',
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

            const userGameBiodata = await getUserGameBiodataById(req.params.id);

            if (!userGameBiodata) {
                notFound(req, res);
                return;
            }

            await userGameBiodata.destroy();

            res.status(200).json({
                statusCode: 200,
                message: 'UserGameBiodata deleted successfully',
                data: userGameBiodata,
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

            const userGameBiodata = await getUserGameBiodataById(req.params.id, [{ model: UserGame }]);

            if (!userGameBiodata) {
                notFound(req, res);
                return;
            }

            res.status(200).json({
                statusCode: 200,
                message: 'OK',
                data: userGameBiodata,
            });
        } catch (error) {
            internalServerError(error, req, res);
        }
    },
    findAll: async (req, res) => {
        try {
            const userGameBiodatas = await UserGameBiodata.findAll({
                include: [{ model: UserGame, }]
            });

            res.status(200).json({
                statusCode: 200,
                message: 'OK',
                count: userGameBiodatas.length,
                data: userGameBiodatas,
            });
        } catch (error) {
            internalServerError(error, req, res);
        }
    },
    findBiodataByUserGameId: async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                badRequest(errors.array(), req, res);
                return;
            }
            
            const userGameBiodata = await UserGameBiodata.findAll({
                where: { userGameId: req.params.userGameId, },
            });

            res.status(200).json({
                statusCode: 200,
                message: 'OK',
                data: userGameBiodata,
            });
        } catch (error) {
            internalServerError(error, req, res);
        }
    }
}
