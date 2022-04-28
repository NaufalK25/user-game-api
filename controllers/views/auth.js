const { validationResult } = require('express-validator');
const { internalServerErrorPage, notFoundPage } = require('./error');
const { sequelizeErrorNames } = require('../../config/constants');
const { UserGame } = require('../../database/models');
const { generateFlash, generateRenderObject, getDataBySpecificField } = require('../../helper');

const getUserGameByUsername = getDataBySpecificField(UserGame, 'username');

const generateLoginRenderObject = (req) => {
    return generateRenderObject({
        title: 'Login',
        scripts: ['../../js/global.js'],
        extras: {
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
    getLoginPage: async (req, res) => {
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

            if (!errors.isEmpty()) {
                generateFlash(req, { type: 'danger', errors: errors.array() });
                return res.status(400).render('login', generateLoginRenderObject(req));
            }

            if (userGame.password !== req.body.password) {
                generateFlash(req, { type: 'danger', errors: [{ param: 'password', msg: 'Password is incorrect' }] });
                return res.status(400).render('login', generateLoginRenderObject(req));
            }

            generateFlash(req, { type: 'success', message: 'Login successful' });
            res.status(200).redirect('/view/user_games');
        } catch (error) {
            if (sequelizeErrorNames.includes(error.name)) {
                notFoundPage(req, res);
            } else {
                internalServerErrorPage(error, req, res);
            }
        }
    },
}
