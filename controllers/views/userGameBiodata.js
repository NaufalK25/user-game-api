const { validationResult } = require('express-validator');
const { internalServerErrorPage, notFoundPage } = require('./error');
const { UserGame, UserGameBiodata, UserGameHistory } = require('../../database/models');
const { generateFlash, generateFlashObject, generateRenderObject, getDataBySpecificField } = require('../../helper');

const getUserGameById = getDataBySpecificField(UserGame, 'id');
const getUserGameBiodataById = getDataBySpecificField(UserGameBiodata, 'id');

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
    createUserGameBiodata: async (req, res) => {
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

            await UserGameBiodata.create(req.body);

            generateFlash(req, { type: 'success', message: `User Game Biodata ${userGame.username} has been created` });
            res.status(201).redirect(`/view/user_game/${userGame.id}`);
        } catch (error) {
            internalServerErrorPage(error, req, res);
        }
    },
    updateUserGameBiodataById: async (req, res) => {
        try {
            const errors = validationResult(req);
            const userGame = await getUserGameById(req.params.id, [
                { model: UserGameBiodata },
                { model: UserGameHistory }
            ]);
            const userGameBiodata = await getUserGameBiodataById(req.body.userGameBiodataId);
            const updatedData = {};

            if (!userGame) return notFoundPage(req, res);
            if (!userGameBiodata) return notFoundPage(req, res);

            if (userGameBiodata.email !== req.body.email) updatedData.email = req.body.email;
            if (userGameBiodata.firstname !== req.body.firstname) updatedData.firstname = req.body.firstname;
            if (userGameBiodata.lastname !== req.body.lastname) updatedData.lastname = req.body.lastname;
            if (userGameBiodata.age !== +req.body.age) updatedData.age = +req.body.age;
            if (userGameBiodata.country !== req.body.country) updatedData.country = req.body.country;

            if (Object.keys(updatedData).length === 0) {
                generateFlash(req, { type: 'info', message: 'No changes has been made' });
                return res.status(200).redirect(`/view/user_game/${userGame.id}`);
            }
            if (userGameBiodata.email !== req.body.email) {
                if (!errors.isEmpty()) {
                    generateFlash(req, { type: 'danger', errors: errors.array() });
                    return res.status(400).render('user-game-detail', generateUserGameDetailRenderObject(req, userGame));
                }
            }

            await userGameBiodata.update(updatedData);

            generateFlash(req, { type: 'success', message: `User Game Biodata ${userGame.username} has been updated` })
            res.status(200).redirect(`/view/user_game/${userGame.id}`);
        } catch (error) {
            internalServerErrorPage(error, req, res);
        }
    },
    deleteUserGameBiodataById: async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) return notFoundPage(req, res);

            const userGame = await getUserGameById(req.params.id);
            const userGameBiodata = await getUserGameBiodataById(req.body.userGameBiodataId);

            if (!userGame) return notFoundPage(req, res);
            if (!userGameBiodata) return notFoundPage(req, res);

            await userGameBiodata.destroy();

            generateFlash(req, { type: 'success', message: `User Game Biodata ${userGame.username} has been deleted` })
            res.status(200).redirect(`/view/user_game/${userGame.id}`);
        } catch (error) {
            internalServerErrorPage(error, req, res);
        }
    }
}
