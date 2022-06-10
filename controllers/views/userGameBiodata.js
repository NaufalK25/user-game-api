const fs = require('fs');
const { validationResult } = require('express-validator');
const { internalServerErrorPage, notFoundPage } = require('./error');
const { baseUrl } = require('../../config/constants');
const { UserGame, UserGameBiodata, UserGameHistory } = require('../../database/models');
const { generateFlash, generateFlashObject, generateRenderObject } = require('../../helper');

const unlinkProfilePicturePath = `${__dirname}/../../uploads/profiles/`;

module.exports = {
    createUserGameBiodata: async (req, res) => {
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

        await UserGameBiodata.create({ ...req.body, profilePicture: req.file ? req.file.filename : 'default-profile.png' });

        generateFlash(req, { type: 'success', message: `User Game Biodata ${userGame.username} has been created` });
        res.status(201).redirect(`/view/user_game/${userGame.id}`);
    },
    updateUserGameBiodataById: async (req, res) => {
        const errors = validationResult(req);

        const userGame = await UserGame.findByPk(req.params.id, {
            include: [
                { model: UserGameBiodata },
                { model: UserGameHistory }
            ]
        });
        const userGameBiodata = await UserGameBiodata.findByPk(req.body.userGameBiodataId);
        const updatedData = {};
        const profilePicture = req.file ? req.file.filename : 'default-profile.png';

        if (!userGame) return notFoundPage(req, res);
        if (!userGameBiodata) return notFoundPage(req, res);

        if (Object.keys(req.body).length > 0) {
            const { email, firstname, lastname, age, country } = req.body;
            if (userGameBiodata.email !== email) updatedData.email = email;
            if (userGameBiodata.firstname !== firstname) updatedData.firstname = firstname;
            if (userGameBiodata.lastname !== lastname) updatedData.lastname = lastname;
            if (userGameBiodata.age !== +age) updatedData.age = +age;
            if (userGameBiodata.country !== country) updatedData.country = country;
        }
        if (req.file && profilePicture !== 'default-profile.png') {
            updatedData.profilePicture = profilePicture;
            fs.unlink(`${unlinkProfilePicturePath}${userGameBiodata.profilePicture}`, err => {
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

        await UserGameBiodata.update(updatedData, { where: { id: req.body.userGameBiodataId } });

        generateFlash(req, { type: 'success', message: `User Game Biodata ${userGame.username} has been updated` })
        res.status(200).redirect(`/view/user_game/${userGame.id}`);
    },
    deleteUserGameBiodataById: async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) return notFoundPage(req, res);

        const userGame = await UserGame.findByPk(req.params.id);
        const userGameBiodata = await UserGameBiodata.findByPk(req.body.userGameBiodataId);

        if (!userGame) return notFoundPage(req, res);
        if (!userGameBiodata) return notFoundPage(req, res);

        if (userGameBiodata.profilePicture !== 'default-profile.png') {
            fs.unlink(`${unlinkProfilePicturePath}${userGameBiodata.profilePicture}`, err => {
                if (err) return internalServerErrorPage(err, req, res);
            });
        }

        await UserGameBiodata.destroy({ where: { id: req.body.userGameBiodataId } });

        generateFlash(req, { type: 'success', message: `User Game Biodata ${userGame.username} has been deleted` })
        res.status(200).redirect(`/view/user_game/${userGame.id}`);
    }
}
