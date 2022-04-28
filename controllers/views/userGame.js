const { validationResult } = require('express-validator');
const { internalServerErrorPage, notFoundPage } = require('./error');
const { sequelizeErrorNames } = require('../../config/constants');
const { UserGame, UserGameBiodata, UserGameHistory } = require('../../database/models');
const { generateFlash, generateRenderObject, getDataBySpecificField } = require('../../helper');

const getUserGameById = getDataBySpecificField(UserGame, 'id');

const getAllUserGames = (UserGame, UserGameBiodata, UserGameHistory) => {
    return UserGame.findAll({
        include: [
            { model: UserGameBiodata, },
            { model: UserGameHistory, }
        ]
    });
}

const generateUserGameListRenderObject = (req, userGames) => {
    return generateRenderObject({
        title: 'User Game List',
        scripts: ['../js/user-game-list.js', '../js/global.js'],
        extras: {
            userGames,
            flash: {
                message: req.flash('message') || '',
                type: req.flash('type') || '',
                svg: req.flash('svg') || '',
                errors: req.flash('errors') || [],
            }
        }
    });
}

module.exports = {
    createUserGame: async (req, res) => {
        try {
            const errors = validationResult(req);

            const userGames = await getAllUserGames(UserGame, UserGameBiodata, UserGameHistory);

            if (!errors.isEmpty()) {
                generateFlash(req, { type: 'danger', errors: errors.array() });
                return res.status(400).render('user-game-list', generateUserGameListRenderObject(req, userGames));
            }

            await UserGame.create(req.body);

            generateFlash(req, { type: 'success', message: `User Game ${req.body.username} has been created` });
            res.status(201).redirect('/view/user_games');
        } catch (error) {
            if (sequelizeErrorNames.includes(error.name)) {
                notFoundPage(req, res);
            } else {
                internalServerErrorPage(error, req, res);
            }
        }
    },
    updateUserGameById: async (req, res) => {
        try {
            const errors = validationResult(req);

            const userGames = await getAllUserGames(UserGame, UserGameBiodata, UserGameHistory);
            const userGame = await getUserGameById(req.params.id);
            const updatedData = {};

            if (userGame.username !== req.body.username) updatedData.username = req.body.username;
            if (userGame.password !== req.body.password) updatedData.password = req.body.password;

            if (Object.keys(updatedData).length === 0) {
                generateFlash(req, { type: 'info', message: 'No changes has been made' });
                return res.status(200).redirect('/view/user_games');
            }

            if (userGame.username !== req.body.username) {
                if (!errors.isEmpty()) {
                    generateFlash(req, { type: 'danger', errors: errors.array() });
                    return res.status(400).render('user-game-list', generateUserGameListRenderObject(req, userGames));
                }
            }

            if (!userGame) return notFoundPage(req, res);

            await userGame.update(updatedData);

            generateFlash(req, { type: 'success', message: `User Game ${req.body.username} has been updated` })
            res.status(200).redirect('/view/user_games');
        } catch (error) {
            if (sequelizeErrorNames.includes(error.name)) {
                notFoundPage(req, res);
            } else {
                internalServerErrorPage(error, req, res);
            }
        }
    },
    deleteUserGameById: async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) return notFoundPage(req, res);

            const userGame = await getUserGameById(req.params.id);

            if (!userGame) return notFoundPage(req, res);

            await userGame.destroy();

            generateFlash(req, { type: 'success', message: `User Game ${userGame.username} has been deleted` });
            res.status(200).redirect('/view/user_games');
        } catch (error) {
            internalServerErrorPage(error, req, res);
        }
    },
    getUserGameByIdPage: async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) return notFoundPage(req, res);

            const userGame = await getUserGameById(req.params.id, [
                { model: UserGameBiodata, },
                { model: UserGameHistory, }
            ]);

            if (!userGame) return notFoundPage(req, res);

            res.status(200).render('user-game-detail', generateRenderObject({
                title: `User Game Detail - ${userGame.username}`,
                scripts: ['../../../js/user-game-detail.js', '../../../js/global.js'],
                extras: {
                    userGame,
                    flash: {
                        message: req.flash('message') || '',
                        type: req.flash('type') || '',
                        svg: req.flash('svg') || '',
                        errors: req.flash('errors') || [],
                    },
                }
            }));
        } catch (error) {
            internalServerErrorPage(error, req, res);
        }
    },
    getAllUserGamesPage: async (req, res) => {
        try {
            const userGames = await getAllUserGames(UserGame, UserGameBiodata, UserGameHistory);

            res.status(200).render('user-game-list', generateUserGameListRenderObject(req, userGames));
        } catch (error) {
            internalServerErrorPage(error, req, res);
        }
    }
}
