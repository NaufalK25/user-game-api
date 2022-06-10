const fs = require('fs');
const { validationResult } = require('express-validator');
const { internalServerErrorPage, notFoundPage } = require('./error');
const { baseUrl } = require('../../config/constants');
const { UserGame, UserGameBiodata, UserGameHistory } = require('../../database/models');
const { generateFlash, generateFlashObject, generateRenderObject } = require('../../helper');

const unlinkGameCoverPath = `${__dirname}/../../uploads/games/`;

module.exports = {
    createUserGameHistory: async (req, res) => {
        const errors = validationResult(req);

        const userGame = await UserGame.findByPk(req.params.id, {
            include: [
                { model: UserGameBiodata },
                { model: UserGameHistory }
            ]
        });

        if (!errors.isEmpty()) {
            generateFlash(req, { type: 'danger', errors: errors.array() });
            return res.status(400).render('user-game-detail', generateRenderObject({
                title: `User Game Detail - ${userGame.username}`,
                scripts: ['../../../js/user-game-detail.js', '../../../js/global.js'],
                extras: {
                    baseUrl,
                    loggedInUser: req.user,
                    userGame,
                    flash: generateFlashObject(req)
                }
            }));
        }
        if (!userGame) return notFoundPage(req, res);

        await UserGameHistory.create({
            ...req.body,
            cover: req.file ? req.file.filename : 'default-cover.jpg',
            lastPlayed: new Date()
        });

        generateFlash(req, { type: 'success', message: `User Game History has been created` });
        res.status(201).redirect(`/view/user_game/${userGame.id}`);
    },
    updateUserGameHistoryById: async (req, res) => {
        const errors = validationResult(req);
        const userGame = await UserGame.findByPk(req.params.id, {
            include: [
                { model: UserGameBiodata },
                { model: UserGameHistory }
            ]
        });
        const userGameHistory = await UserGameHistory.findByPk(req.body.userGameHistoryId);
        const updatedData = {};
        const gameCover = req.file ? req.file.filename : 'default-cover.jpg';

        if (!userGame) return notFoundPage(req, res);
        if (!userGameHistory) return notFoundPage(req, res);

        if (Object.keys(req.body).length > 0) {
            const { title, publisher, score } = req.body;
            if (userGameHistory.title !== title) updatedData.title = title;
            if (userGameHistory.publisher !== publisher) updatedData.publisher = publisher;
            if (userGameHistory.score !== score) updatedData.score = score;
        }
        if (req.file && gameCover !== 'default-cover.jpg') {
            updatedData.cover = gameCover;
            fs.unlink(`${unlinkGameCoverPath}${userGameHistory.cover}`, err => {
                if (err) return internalServerErrorPage(err, req, res);
            });
        }

        if (Object.keys(updatedData).length === 0) {
            generateFlash(req, { type: 'info', message: 'No changes has been made' });
            return res.status(200).redirect(`/view/user_game/${userGame.id}`);
        }
        if (!errors.isEmpty()) {
            generateFlash(req, { type: 'danger', errors: errors.array() });
            return res.status(400).render('user-game-detail', generateRenderObject({
                title: `User Game Detail - ${userGame.username}`,
                scripts: ['../../../js/user-game-detail.js', '../../../js/global.js'],
                extras: {
                    baseUrl,
                    loggedInUser: req.user,
                    userGame,
                    flash: generateFlashObject(req)
                }
            }));
        }

        await UserGameHistory.update({ ...updatedData, lastPlayed: new Date() }, { where: { id: req.body.userGameHistoryId } });

        generateFlash(req, { type: 'success', message: `User Game History has been updated` })
        res.status(200).redirect(`/view/user_game/${userGame.id}`);
    },
    deleteUserGameHistoryById: async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) return notFoundPage(req, res);

        const userGame = await UserGame.findByPk(req.params.id);
        const userGameHistory = await UserGameHistory.findByPk(req.body.userGameHistoryId);

        if (!userGame) return notFoundPage(req, res);
        if (!userGameHistory) return notFoundPage(req, res);

        if (userGameHistory.cover !== 'default-cover.jpg') {
            fs.unlink(`${unlinkGameCoverPath}${userGameHistory.cover}`, err => {
                if (err) return internalServerErrorPage(err, req, res);
            });
        }

        await UserGameHistory.destroy({ where: { id: req.body.userGameHistoryId } });

        generateFlash(req, { type: 'success', message: `User Game History has been deleted` })
        res.status(200).redirect(`/view/user_game/${userGame.id}`);
    }
}
