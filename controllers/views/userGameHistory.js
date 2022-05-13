const { validationResult } = require('express-validator');
const { internalServerErrorPage, notFoundPage } = require('./error');
const { UserGame, UserGameBiodata, UserGameHistory } = require('../../database/models');
const { generateFlash, generateFlashObject, generateRenderObject, getDataBySpecificField } = require('../../helper');

const getUserGameById = getDataBySpecificField(UserGame, 'id');
const getUserGameHistoryById = getDataBySpecificField(UserGameHistory, 'id');

const generateUserGameDetailRenderObject = (req, userGame) => {
    return generateRenderObject({
        title: `User Game Detail - ${userGame.username}`,
        scripts: ['../../../js/user-game-detail.js', '../../../js/global.js'],
        extras: {
            userGame,
            flash: generateFlashObject(req)
        }
    });
}

module.exports = {
    createUserGameHistory: async (req, res) => {
        try {
            const errors = validationResult(req);
            const userGame = await getUserGameById(req.params.id, [
                { model: UserGameBiodata },
                { model: UserGameHistory }
            ]);

            if (!errors.isEmpty()) {
                generateFlash(req, { type: 'danger', errors: errors.array() });
                return res.status(400).render('user-game-detail', generateUserGameDetailRenderObject(req, userGame));
            }
            if (!userGame) return notFoundPage(req, res);

            await UserGameHistory.create({ ...req.body, lastPlayed: new Date() });

            generateFlash(req, { type: 'success', message: `User Game History has been created` });
            res.status(201).redirect(`/view/user_game/${userGame.id}`);
        } catch (error) {
            internalServerErrorPage(error, req, res);
        }
    },
    updateUserGameHistoryById: async (req, res) => {
        try {
            const errors = validationResult(req);
            const userGame = await getUserGameById(req.params.id, [
                { model: UserGameBiodata },
                { model: UserGameHistory }
            ]);
            const userGameHistory = await getUserGameHistoryById(req.body.userGameHistoryId);
            const updatedData = {};

            if (!userGame) return notFoundPage(req, res);
            if (!userGameHistory) return notFoundPage(req, res);

            if (userGameHistory.title !== req.body.title) updatedData.title = req.body.title;
            if (userGameHistory.publisher !== req.body.publisher) updatedData.publisher = req.body.publisher;
            if (userGameHistory.score !== req.body.score) updatedData.score = req.body.score;


            if (Object.keys(updatedData).length === 0) {
                generateFlash(req, { type: 'info', message: 'No changes has been made' });
                return res.status(200).redirect(`/view/user_game/${userGame.id}`);
            }
            if (!errors.isEmpty()) {
                generateFlash(req, { type: 'danger', errors: errors.array() });
                return res.status(400).render('user-game-detail', generateUserGameDetailRenderObject(req, userGame));
            }

            await userGameHistory.update({ ...updatedData, lastPlayed: new Date() });

            generateFlash(req, { type: 'success', message: `User Game History has been updated` })
            res.status(200).redirect(`/view/user_game/${userGame.id}`);
        } catch (error) {
            internalServerErrorPage(error, req, res);
        }
    },
    deleteUserGameHistoryById: async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) return notFoundPage(req, res);

            const userGame = await getUserGameById(req.params.id);
            const userGameHistory = await getUserGameHistoryById(req.body.userGameHistoryId);

            if (!userGame) return notFoundPage(req, res);
            if (!userGameHistory) return notFoundPage(req, res);

            await userGameHistory.destroy();

            generateFlash(req, { type: 'success', message: `User Game History has been deleted` })
            res.status(200).redirect(`/view/user_game/${userGame.id}`);
        } catch (error) {
            internalServerErrorPage(error, req, res);
        }
    }
}
