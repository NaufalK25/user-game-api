const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { v4 } = require('uuid');
const { validationResult } = require('express-validator');
const passport = require('../../middlewares/passportLocal');
const { internalServerErrorPage } = require('./error');
const { baseUrl } = require('../../config/constants');
const { UserGame, UserGameBiodata } = require('../../database/models');
const { generateFlash, generateFlashObject, generateRenderObject } = require('../../helper');
require('dotenv').config();

const tokens = {};

module.exports = {
    tokens,
    getSendEmailPage: (req, res) => {
        res.status(200).render('send-email', generateRenderObject({
            title: 'Send Email',
            scripts: ['../../js/global.js'],
            extras: { flash: generateFlashObject(req) }
        }));
    },
    getForgotPasswordPage: (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            generateFlash(req, { type: 'danger', errors: errors.array() });
            return res.status(400).redirect('/view/login');
        }

        if (req.query.token !== tokens[req.query.id]) {
            generateFlash(req, { type: 'danger', errors: [{ param: 'token', msg: 'Invalid token' }] });
            return res.status(400).redirect('/view/login');
        }

        res.status(200).render('forgot-password', generateRenderObject({
            title: 'Forgot Password',
            scripts: ['../../js/global.js'],
            extras: {
                id: req.query.id,
                flash: generateFlashObject(req)
            }
        }));
    },
    getLoginPage: (req, res) => {
        res.status(200).render('login', generateRenderObject({
            title: 'Login',
            scripts: ['../../js/global.js'],
            extras: { flash: generateFlashObject(req) }
        }));
    },
    getRegisterPage: (req, res) => {
        res.status(200).render('register', generateRenderObject({
            title: 'Register',
            scripts: ['../../js/global.js'],
            extras: { flash: generateFlashObject(req) }
        }));
    },
    logout: (req, res) => {
        req.logout((err) => {
            if (err) return internalServerErrorPage(req, res);
            generateFlash(req, { type: 'success', message: 'You have been logged out' });
            res.status(200).redirect('/view/login');
        });
    },
    login: (req, res) => {
        passport.authenticate('local', (err, user, info) => {
            if (err) return internalServerErrorPage(err, req, res);
            if (!user) {
                generateFlash(req, { type: 'danger', errors: [{ param: info.param, msg: info.message }] });
                return res.status(400).render('login', generateRenderObject({
                    title: 'Login',
                    scripts: ['../../js/global.js'],
                    extras: { flash: generateFlashObject(req) }
                }));
            }

            req.login(user, (err) => {
                if (err) return internalServerErrorPage(err, req, res);

                const errors = validationResult(req);

                if (!errors.isEmpty()) {
                    generateFlash(req, { type: 'danger', message: errors.array()[0].msg });
                    return res.status(400).render('login', generateRenderObject({
                        title: 'Login',
                        scripts: ['../../js/global.js'],
                        extras: { flash: generateFlashObject(req) }
                    }));
                }

                generateFlash(req, { type: 'success', message: 'Login successful' });
                res.status(200).redirect('/view/user_games');
            });
        })(req, res);
    },
    register: async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            generateFlash(req, { type: 'danger', errors: errors.array() });
            return res.status(400).render('register', generateRenderObject({
                title: 'Register',
                scripts: ['../../js/global.js'],
                extras: { flash: generateFlashObject(req) }
            }));
        }

        if (req.body.password !== req.body.confirmPassword) {
            generateFlash(req, { type: 'danger', errors: [{ param: 'confirmPassword', msg: 'Password confirmation does not match' }] })
            return res.status(400).render('register', generateRenderObject({
                title: 'Register',
                scripts: ['../../js/global.js'],
                extras: { flash: generateFlashObject(req) }
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

        generateFlash(req, { type: 'success', message: 'Your account has been registered' });
        res.status(201).redirect('/view/login');
    },
    sendEmail: async (req, res) => {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'naufalkateni2001@gmail.com',
                pass: process.env.EMAIL_PASSWORD
            }
        });

        const { email } = req.body;
        const userGameBiodata = await UserGameBiodata.findOne({ where: { email } });

        if (!userGameBiodata) {
            generateFlash(req, { type: 'danger', errors: [{ param: 'email', msg: 'Email not found' }] });
            return res.status(404).redirect('/view/login');
        }

        const token = v4().replace(/-/g, '');
        tokens[userGameBiodata.userGameId] = token;


        const mailOptions = {
            from: 'naufalkateni2001@gmail.com',
            to: email,
            subject: 'Forgot Password',
            text: `You have requested to reset your password. Click here to reset your password: ${baseUrl}/view/forgot_password?id=${userGameBiodata.userGameId}&token=${token}`
        };

        await transporter.sendMail(mailOptions);

        generateFlash(req, { type: 'success', message: 'An email has been sent to your email address' });
        res.status(200).redirect('/view/login');
    },
    forgotPassword: async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            generateFlash(req, { type: 'danger', errors: errors.array() });
            return res.status(400).render('forgot-password', generateRenderObject({
                title: 'Forgot Password',
                scripts: ['../../js/global.js'],
                extras: {
                    id: req.body.id,
                    flash: generateFlashObject(req)
                }
            }));
        }

        const { id, password, confirmPassword } = req.body;
        const userGame = await UserGame.findByPk(id);

        if (!userGame) {
            generateFlash(req, { type: 'danger', errors: [{ param: 'id', msg: 'User Game Id does not exist' }] });
            return res.status(404).redirect('/view/login');
        }

        if (password !== confirmPassword) {
            generateFlash(req, { type: 'danger', errors: [{ param: 'confirmPassword', msg: 'Password confirmation does not match' }] })
            return res.status(400).render('forgot-password', generateRenderObject({
                title: 'Forgot Password',
                scripts: ['../../js/global.js'],
                extras: {
                    id: req.body.id,
                    flash: generateFlashObject(req)
                }
            }));
        }

        await UserGame.update({ password: await bcrypt.hash(password, 10) }, { where: { id } });

        tokens[id] = null;

        generateFlash(req, { type: 'success', message: 'Your password has been reset' });
        res.status(200).redirect('/view/login');
    }
}
