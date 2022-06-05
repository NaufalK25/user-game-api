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

const token = v4().replaceAll('-', '');
const generateAuthRenderObject = (req, title) => {
    return generateRenderObject({
        title,
        scripts: ['../../js/global.js'],
        extras: { flash: generateFlashObject(req) }
    });
}

module.exports = {
    getSendEmailPage: (req, res) => {
        try {
            res.status(200).render('send-email', generateAuthRenderObject(req, 'Send Email'));
        } catch (error) {
            internalServerErrorPage(error, req, res);
        }
    },
    getForgotPasswordPage: (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                generateFlash(req, { type: 'danger', errors: errors.array() });
                return res.status(400).render('login', generateAuthRenderObject(req, 'Login'));
            }

            if (req.query.token !== token) {
                generateFlash(req, { type: 'danger', errors: [{ param: 'token', msg: 'Invalid token' }] });
                return res.status(400).render('login', generateAuthRenderObject(req, 'Login'));
            }

            res.status(200).render('forgot-password', generateRenderObject({
                title: 'Forgot Password',
                scripts: ['../../js/global.js'],
                extras: {
                    id: req.query.id,
                    flash: generateFlashObject(req)
                 }
            }));
        } catch (error) {
            internalServerErrorPage(error, req, res);
        }
    },
    getLoginPage: (req, res) => {
        try {
            res.status(200).render('login', generateAuthRenderObject(req, 'Login'));
        } catch (error) {
            internalServerErrorPage(error, req, res);
        }
    },
    getRegisterPage: (req, res) => {
        try {
            res.status(200).render('register', generateAuthRenderObject(req, 'Register'));
        } catch (error) {
            internalServerErrorPage(error, req, res);
        }
    },
    logout: async (req, res, next) => {
        req.logout((err) => {
            if (err) return next(err);
            generateFlash(req, { type: 'success', message: 'You have been logged out' });
            res.redirect('/view/login');
        });
    },
    login: (req, res) => {
        passport.authenticate('local', (err, user, info) => {
            if (err) return internalServerErrorPage(err, req, res);
            if (!user) {
                generateFlash(req, { type: 'danger', errors: [{ param: info.param, msg: info.message }] });
                return res.status(400).render('login', generateAuthRenderObject(req, 'Login'));
            }

            req.login(user, (err) => {
                if (err) return internalServerErrorPage(err, req, res);

                const errors = validationResult(req);

                if (!errors.isEmpty()) {
                    generateFlash(req, { type: 'danger', message: errors.array()[0].msg });
                    return res.status(400).render('login', generateAuthRenderObject(req, 'Login'));
                }

                generateFlash(req, { type: 'success', message: 'Login successful' });
                res.redirect('/view/user_games');
            });
        })(req, res);
    },
    register: async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                generateFlash(req, { type: 'danger', errors: errors.array() });
                return res.status(400).render('register', generateAuthRenderObject(req, 'Register'));
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

            generateFlash(req, { type: 'success', message: 'Your account has been registered' });
            res.status(201).redirect('/view/login');
        } catch (error) {
            internalServerErrorPage(error, req, res);
        }
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

        const mailOptions = {
            from: 'naufalkateni2001@gmail.com',
            to: email,
            subject: 'Forgot Password',
            text: `You have requested to reset your password. Click here to reset your password: ${baseUrl}/view/forgot_password?id=${userGameBiodata.userGameId}&token=${token}`
        };

        await transporter.sendMail(mailOptions);

        generateFlash(req, { type: 'success', message: 'An email has been sent to your email address' });
        res.redirect('/view/login');
    },
    forgotPassword: async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            generateFlash(req, { type: 'danger', errors: errors.array() });
            return res.status(400).render('register', generateAuthRenderObject(req, 'Register'));
        }

        if (req.body.password !== req.body.confirmPassword) {
            generateFlash(req, { type: 'danger', errors: [{ param: 'confirmPassword', msg: 'Password confirmation does not match' }] })
            return res.status(400).render('register', generateAuthRenderObject(req, 'Register'));
        }

        const { id, password, confirmPassword } = req.body;
        const userGame = await UserGame.findByPk(id);

        await userGame.update({ password: await bcrypt.hash(password, 10) });

        generateFlash(req, { type: 'success', message: 'Your password has been reset' });
        res.redirect('/view/login');
    }
}
