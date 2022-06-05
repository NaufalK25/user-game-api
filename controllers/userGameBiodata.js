const fs = require('fs');
const { validationResult } = require('express-validator');
const { badRequest, internalServerError, notFound } = require('./error');
const { baseUrl } = require('../config/constants');
const { UserGame, UserGameBiodata } = require('../database/models');

const unlinkProfilePicturePath = `${__dirname}/../uploads/profiles/`;
const jsonProfilePicturePath = `${baseUrl}/uploads/profiles/`;

module.exports = {
    create: async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) return badRequest(errors.array(), req, res);

        const profilePicture = req.file ? req.file.filename : 'default-profile.png'
        const userGameBiodata = await UserGameBiodata.create({ ...req.body, profilePicture });
        userGameBiodata.profilePicture = `${jsonProfilePicturePath}${userGameBiodata.profilePicture}`;

        res.status(201).json({
            statusCode: 201,
            message: 'UserGameBiodata created successfully',
            data: userGameBiodata
        });
    },
    update: async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) return badRequest(errors.array(), req, res);

        const userGameBiodata = await UserGameBiodata.findByPk(req.params.id);

        if (!userGameBiodata) return notFound(req, res);

        const profilePicture = req.file ? req.file.filename : undefined;
        const requestBody = { ...req.body };

        if (profilePicture) requestBody.profilePicture = profilePicture;

        const oldUserGameBiodataData = { ...userGameBiodata.dataValues };
        const userGameBiodataFields = Object.keys(UserGameBiodata.rawAttributes);
        let fieldChanged = Object.keys(requestBody).filter(key => userGameBiodataFields.includes(key));
        const before = {}, after = {};

        fieldChanged.forEach(field => {
            before[field] = oldUserGameBiodataData[field];
            if (typeof oldUserGameBiodataData[field] === 'number') requestBody[field] = parseInt(requestBody[field]);
            after[field] = requestBody[field];
        });

        if (req.file && oldUserGameBiodataData.profilePicture !== 'default-profile.png') {
            fs.unlink(`${unlinkProfilePicturePath}${oldUserGameBiodataData.profilePicture}`, err => {
                if (err) return console.log(err);
            });
        }

        await UserGameBiodata.update(requestBody, { where: { id: req.params.id } });

        if (before.profilePicture && after.profilePicture) {
            before.profilePicture = `${jsonProfilePicturePath}${before.profilePicture}`;
            after.profilePicture = `${jsonProfilePicturePath}${after.profilePicture}`;
        }

        res.status(200).json({
            statusCode: 200,
            message: 'UserGameBiodata updated successfully',
            data: { before, after }
        });
    },
    destroy: async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) return badRequest(errors.array(), req, res);

        const userGameBiodata = await UserGameBiodata.findByPk(req.params.id);

        if (!userGameBiodata) return notFound(req, res);

        const profilePicture = userGameBiodata.profilePicture;

        if (profilePicture !== 'default-profile.png') {
            fs.unlink(`${unlinkProfilePicturePath}${profilePicture}`, err => {
                if (err) return internalServerError(err, req, res);
            });
        }

        await UserGameBiodata.destroy({ where: { id: req.params.id } });
        userGameBiodata.profilePicture = `${jsonProfilePicturePath}${userGameBiodata.profilePicture}`;

        res.status(200).json({
            statusCode: 200,
            message: 'UserGameBiodata deleted successfully',
            data: userGameBiodata
        });
    },
    findOne: async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) return badRequest(errors.array(), req, res);

        const userGameBiodata = await UserGameBiodata.findByPk(req.params.id, { include: [{ model: UserGame }] });

        if (!userGameBiodata) return notFound(req, res);

        userGameBiodata.profilePicture = `${jsonProfilePicturePath}${userGameBiodata.profilePicture}`;

        res.status(200).json({
            statusCode: 200,
            message: 'OK',
            data: userGameBiodata
        });
    },
    findAll: async (req, res) => {
        const userGameBiodatas = await UserGameBiodata.findAll({ include: [{ model: UserGame }] });
        userGameBiodatas.forEach(userGameBiodata => {
            userGameBiodata.profilePicture = `${jsonProfilePicturePath}${userGameBiodata.profilePicture}`;
        });

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

        const userGameBiodata = await UserGameBiodata.findOne({ where: { userGameId: req.params.userGameId } });

        if (userGameBiodata) userGameBiodata.profilePicture = `${jsonProfilePicturePath}${userGameBiodata.profilePicture}`;

        res.status(200).json({
            statusCode: 200,
            message: 'OK',
            data: userGameBiodata
        });
    }
}
