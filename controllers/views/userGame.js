const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { validationResult } = require('express-validator');
const { internalServerErrorPage, notFoundPage } = require('./error');
const { baseUrl } = require('../../config/constants');
const { UserGame, UserGameBiodata, UserGameHistory } = require('../../database/models');
const { generateFlash, generateFlashObject, generateRenderObject } = require('../../helper');

const unlinkProfilePicturePath = `${__dirname}/../uploads/profiles/`;
const unlinkGameCoverPath = `${__dirname}/../uploads/games/`;
const jsonProfilePicturePath = `${baseUrl}/uploads/profiles/`;
const jsonGameCoverPath = `${baseUrl}/uploads/games/`;

module.exports = {
    createUserGame: async (req, res) => {
        const errors = validationResult(req);
        const userGames = await UserGame.findAll({
            include: [
                { model: UserGameBiodata },
                { model: UserGameHistory }
            ]
        });

        if (!errors.isEmpty()) {
            generateFlash(req, { type: 'danger', errors: errors.array() });
            return res.status(400).render('user-game-list', generateRenderObject({
                title: 'User Game List',
                scripts: ['../js/user-game-list.js', '../js/global.js'],
                extras: {
                    baseUrl,
                    loggedInUser: req.user,
                    userGames,
                    flash: generateFlashObject(req)
                }
            }));
        }

        if (req.body.password !== req.body.confirmPassword) {
            generateFlash(req, { type: 'danger', errors: [{ param: 'confirmPassword', msg: 'Password confirmation does not match' }] })
            return res.status(400).render('user-game-list', generateRenderObject({
                title: 'User Game List',
                scripts: ['../js/user-game-list.js', '../js/global.js'],
                extras: {
                    baseUrl,
                    loggedInUser: req.user,
                    userGames,
                    flash: generateFlashObject(req)
                }
            }));
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
    },
    updateUserGameById: async (req, res) => {
        const errors = validationResult(req);
        const userGames = await UserGame.findAll({
            include: [
                { model: UserGameBiodata },
                { model: UserGameHistory }
            ]
        });
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
                return res.status(400).render('user-game-list', generateRenderObject({
                    title: 'User Game List',
                    scripts: ['../js/user-game-list.js', '../js/global.js'],
                    extras: {
                        baseUrl,
                        loggedInUser: req.user,
                        userGames,
                        flash: generateFlashObject(req)
                    }
                }));
            }
        }

        await UserGame.update(updatedData, { where: { id: req.params.id } });

        generateFlash(req, { type: 'success', message: `User Game ${req.body.username} has been updated` })
        res.status(200).redirect('/view/user_games');
    },
    deleteUserGameById: async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) return notFoundPage(req, res);

        const userGame = await UserGame.findByPk(req.params.id);
        const userGameBiodata = await UserGameBiodata.findOne({ where: { userGameId: req.params.id } });
        const userGameHistories = await UserGameHistory.findAll({ where: { userGameId: req.params.id } });

        if (!userGame) return notFoundPage(req, res);

        if (userGameBiodata) {
            const profilePicture = userGameBiodata.profilePicture;

            if (profilePicture !== 'default-profile.png') {
                fs.unlink(`${unlinkProfilePicturePath}${profilePicture}`, err => {
                    if (err) return internalServerErrorPage(err, req, res);
                });
            }

            await UserGameBiodata.destroy({ where: { userGameId: req.params.id } });
        }

        userGameHistories.forEach(async userGameHistory => {
            if (userGameHistory) {
                const gameCover = userGameHistory.cover;

                if (gameCover !== 'default-cover.jpg') {
                    fs.unlink(`${unlinkGameCoverPath}${gameCover}`, err => {
                        if (err) return internalServerErrorPage(err, req, res);
                    });
                }

                await UserGameHistory.destroy({
                    where: {
                        id: userGameHistory.id,
                        userGameId: req.params.id
                    }
                });
            }
        });

        await UserGame.destroy({ where: { id: req.params.id } });

        generateFlash(req, { type: 'success', message: `User Game ${userGame.username} has been deleted` });
        res.status(200).redirect('/view/user_games');
    },
    getUserGameByIdPage: async (req, res) => {
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
    },
    getAllUserGamesPage: async (req, res) => {
        const userGames = await UserGame.findAll({
            include: [
                { model: UserGameBiodata },
                { model: UserGameHistory }
            ]
        });

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

        res.status(200).render('user-game-list', generateRenderObject({
            title: 'User Game List',
            scripts: ['../js/user-game-list.js', '../js/global.js'],
            extras: {
                baseUrl,
                loggedInUser: req.user,
                userGames,
                flash: generateFlashObject(req)
            }
        }));
    }
}
