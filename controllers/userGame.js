const fs = require('fs');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const { badRequest, internalServerError, notFound } = require('./error');
const { baseUrl } = require('../config/constants');
const { UserGame, UserGameBiodata, UserGameHistory } = require('../database/models');

const unlinkProfilePicturePath = `${__dirname}/../uploads/profiles/`;
const unlinkGameCoverPath = `${__dirname}/../uploads/games/`;
const jsonProfilePicturePath = `${baseUrl}/uploads/profiles/`;
const jsonGameCoverPath = `${baseUrl}/uploads/games/`;

module.exports = {
    create: async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) return badRequest(errors.array(), req, res);

        const userGame = await UserGame.create({
            username: req.body.username,
            password: await bcrypt.hash(req.body.password, 10)
        });

        res.status(201).json({
            statusCode: 201,
            message: 'UserGame created successfully',
            data: userGame
        });
    },
    update: async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) return badRequest(errors.array(), req, res);

        const userGame = await UserGame.findByPk(req.params.id);

        if (!userGame) return notFound(req, res);

        const oldUserGameData = { ...userGame.dataValues };
        const userGameFields = Object.keys(UserGame.rawAttributes);
        let fieldChanged = Object.keys(req.body).filter(field => userGameFields.includes(field));
        const before = {}, after = {};

        fieldChanged.forEach(async field => {
            before[field] = oldUserGameData[field];
            if (field === 'password') {
                const hashedPassword = await bcrypt.hash(req.body.password, 10);
                after[field] = hashedPassword;
            } else {
                after[field] = req.body[field];
            }
        });

        await UserGame.update(after, { where: { id: req.params.id } });

        res.status(200).json({
            statusCode: 200,
            message: 'UserGame updated successfully',
            data: { before, after }
        });
    },
    destroy: async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) return badRequest(errors.array(), req, res);

        const userGame = await UserGame.findByPk(req.params.id);
        const userGameBiodata = await UserGameBiodata.findOne({ where: { userGameId: req.params.id } });
        const userGameHistories = await UserGameHistory.findAll({ where: { userGameId: req.params.id } });

        if (!userGame) return notFound(req, res);

        if (userGameBiodata) {
            const profilePicture = userGameBiodata.profilePicture;

            if (profilePicture !== 'default-profile.png') {
                fs.unlink(`${unlinkProfilePicturePath}${profilePicture}`, err => {
                    if (err) return internalServerError(err, req, res);
                });
            }

            await UserGameBiodata.destroy({ where: { userGameId: req.params.id } });
        }

        userGameHistories.forEach(async userGameHistory => {
            if (userGameHistory) {
                const gameCover = userGameHistory.cover;

                if (gameCover !== 'default-cover.jpg') {
                    fs.unlink(`${unlinkGameCoverPath}${gameCover}`, err => {
                        if (err) return internalServerError(err, req, res);
                    });
                }

                await UserGameHistory.destroy({ where: {
                    id: userGameHistory.id,
                    userGameId: req.params.id
                 } });
            }
        });

        await UserGame.destroy({ where: { id: req.params.id } });

        res.status(200).json({
            statusCode: 200,
            message: 'UserGame deleted successfully',
            data: userGame
        });
    },
    findOne: async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) return badRequest(errors.array(), req, res);

        const userGame = await UserGame.findByPk(req.params.id, {
            include: [
                { model: UserGameBiodata },
                { model: UserGameHistory }
            ]
        });

        if (!userGame) return notFound(req, res);

        if (userGame.UserGameBiodatum) {
            const profilePicture = userGame.UserGameBiodatum.profilePicture;
            userGame.UserGameBiodatum.profilePicture = `${jsonProfilePicturePath}${profilePicture}`;
        }
        userGame.UserGameHistories.forEach(userGameHistory => {
            if (userGameHistory) {
                const gameCover = userGameHistory.cover;
                userGameHistory.cover = `${jsonGameCoverPath}${gameCover}`;
            }
        });

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

        userGames.forEach(userGame => {
            if (userGame.UserGameBiodatum) {
                const profilePicture = userGame.UserGameBiodatum.profilePicture;
                userGame.UserGameBiodatum.profilePicture = `${jsonProfilePicturePath}${profilePicture}`;
            }
            userGame.UserGameHistories.forEach(userGameHistory => {
                if (userGameHistory) {
                    const gameCover = userGameHistory.cover;
                    userGameHistory.cover = `${jsonGameCoverPath}${gameCover}`;
                }
            });

        });

        res.status(200).json({
            statusCode: 200,
            message: 'OK',
            count: userGames.length,
            data: userGames
        });
    }
}
