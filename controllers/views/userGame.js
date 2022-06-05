const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { validationResult } = require('express-validator');
const { internalServerErrorPage, notFoundPage } = require('./error');
const { baseUrl } = require('../../config/constants');
const { UserGame, UserGameBiodata, UserGameHistory } = require('../../database/models');
const { generateFlash, generateFlashObject, generateRenderObject } = require('../../helper');

const jsonProfilePicturePath = `${baseUrl}/uploads/profiles/`;
const jsonGameCoverPath = `${baseUrl}/uploads/games/`;
const getAllUserGames = (UserGame, UserGameBiodata, UserGameHistory) => {
    return UserGame.findAll({
        include: [
            { model: UserGameBiodata },
            { model: UserGameHistory }
        ]
    });
}
const generateUserGameListRenderObject = (req, userGames) => {
    return generateRenderObject({
        title: 'User Game List',
        scripts: ['../js/user-game-list.js', '../js/global.js'],
        extras: {
            baseUrl,
            loggedInUser: req.user,
            userGames,
            flash: generateFlashObject(req)
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

            if (req.body.password !== req.body.confirmPassword) {
                generateFlash(req, { type: 'danger', errors: [{ param: 'confirmPassword', msg: 'Password confirmation does not match' }] })
                return res.status(400).render('register', generateAuthRenderObject(req, 'Register'));
            }

            const { username, password, email, firstname, lastname, country, age } = req.body;
            const userGame = await UserGame.create({
                username,
                password: await bcrypt.hash(password, 10)
            });
            const userGameId = userGame.id;
            await UserGameBiodata.create({ email, firstname, lastname, country, age, userGameId });

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'naufalkateni2001@gmail.com',
                    pass: process.env.EMAIL_PASSWORD
                }
            });
            const mailOptions = {
                from: 'naufalkateni2001@gmail.com',
                to: email,
                subject: 'Welcome to User Game API',
                text: `Congratulations ${firstname} ${lastname}, you have successfully registered to User Game API.`
            };

            await transporter.sendMail(mailOptions);

            generateFlash(req, { type: 'success', message: `User Game ${req.body.username} has been created` });
            res.status(201).redirect('/view/user_games');
        } catch (error) {
            internalServerErrorPage(error, req, res);
        }
    },
    updateUserGameById: async (req, res) => {
        try {
            const errors = validationResult(req);
            const userGames = await getAllUserGames(UserGame, UserGameBiodata, UserGameHistory);
            const userGame = await UserGame.findByPk(req.params.id);

            if (!userGame) return notFoundPage(req, res);

            const updatedData = {};

            if (userGame.username !== req.body.username) updatedData.username = req.body.username;

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

            await userGame.update(updatedData);

            generateFlash(req, { type: 'success', message: `User Game ${req.body.username} has been updated` })
            res.status(200).redirect('/view/user_games');
        } catch (error) {
            internalServerErrorPage(error, req, res);
        }
    },
    deleteUserGameById: async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) return notFoundPage(req, res);

            const userGame = await UserGame.findByPk(req.params.id);
            const userGameBiodata = await UserGameBiodata.findOne({where: {userGameId: req.params.id}});
            const userGameHistories = await UserGameHistory.findAll({ where: { userGameId: req.params.id } });

            if (!userGame) return notFoundPage(req, res);

            userGameHistories.forEach(async userGameHistory => await userGameHistory?.destroy());
            await userGameBiodata?.destroy();
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

            const userGame = await UserGame.findByPk(req.params.id, {
                include: [
                    { model: UserGameBiodata },
                    { model: UserGameHistory }
                ]
            });

            if (!userGame) return notFoundPage(req, res);

            if (userGame.UserGameBiodatum) {
                const profilePicture = userGame.UserGameBiodatum.profilePicture || 'default-profile.png';
                userGame.UserGameBiodatum.profilePicture = `${jsonProfilePicturePath}${profilePicture}`;

            }
            userGame.UserGameHistories.forEach(userGameHistory => {
                if (userGameHistory) {
                    const gameCover = userGameHistory.cover;
                    userGameHistory.cover = `${jsonGameCoverPath}${gameCover}` || 'default-cover.jpg';
                }
            });

            res.status(200).render('user-game-detail', generateRenderObject({
                title: `User Game Detail - ${userGame.username}`,
                scripts: ['../../../js/user-game-detail.js', '../../../js/global.js'],
                extras: {
                    baseUrl,
                    loggedInUser: req.user,
                    userGame,
                    flash: generateFlashObject(req)
                }
            }));
        } catch (error) {
            internalServerErrorPage(error, req, res);
        }
    },
    getAllUserGamesPage: async (req, res) => {
        try {
            const userGames = await getAllUserGames(UserGame, UserGameBiodata, UserGameHistory);

            userGames.forEach(userGame => {
                if (userGame.UserGameBiodatum) {
                    const profilePicture = userGame.UserGameBiodatum.profilePicture || 'default-profile.png';
                    userGame.UserGameBiodatum.profilePicture = `${jsonProfilePicturePath}${profilePicture}`;
                }
                userGame.UserGameHistories.forEach(userGameHistory => {
                    if (userGameHistory) {
                        const gameCover = userGameHistory.cover;
                        userGameHistory.cover = `${jsonGameCoverPath}${gameCover}` || 'default-cover.jpg';
                    }
                });
            });

            res.status(200).render('user-game-list', generateUserGameListRenderObject(req, userGames));
        } catch (error) {
            internalServerErrorPage(error, req, res);
        }
    }
}
