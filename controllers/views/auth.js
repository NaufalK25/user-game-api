const { validationResult } = require('express-validator');
const { internalServerErrorPage } = require('./error');
const { UserGame } = require('../../database/models');
const { generateFlash, generateFlashObject, generateRenderObject, getDataBySpecificField } = require('../../helper');

const getUserGameByUsername = getDataBySpecificField(UserGame, 'username');
const generateLoginRenderObject = (req) => {
    return generateRenderObject({
        title: 'Login',
        scripts: ['../../js/global.js'],
        extras: { flash: generateFlashObject(req) }
    });
}

module.exports = {
    getUserGameByUsername,
    generateLoginRenderObject,
    getLoginPage: (req, res) => {
        try {
            res.status(200).render('login', generateLoginRenderObject(req));
        } catch (error) {
            internalServerErrorPage(error, req, res);
        }
    },
    login: async (req, res) => {
        try {
            const errors = validationResult(req);
            const userGame = await getUserGameByUsername(req.body.username);

            if (!userGame) {
                generateFlash(req, { type: 'danger', errors: [{ param: 'username', msg: 'Username not found' }] });
                return res.status(400).render('login', generateLoginRenderObject(req));
            }

            if (!errors.isEmpty()) {
                generateFlash(req, { type: 'danger', errors: errors.array() });
                return res.status(400).render('login', generateLoginRenderObject(req));
            }

            if (userGame.password !== req.body.password) {
                generateFlash(req, { type: 'danger', errors: [{ param: 'password', msg: 'Incorrect password' }] });
                return res.status(400).render('login', generateLoginRenderObject(req));
            }

            generateFlash(req, { type: 'success', message: 'Login successful' });
            res.status(200).redirect('/view/user_games');
        } catch (error) {
            console.log(error);
            internalServerErrorPage(error, req, res);
        }
    }
}
