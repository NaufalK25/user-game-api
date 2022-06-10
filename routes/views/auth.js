const express = require('express');
const { body, query } = require('express-validator');
const { methodNotAllowedPage } = require('../../controllers/views/error');
const { forgotPassword, getForgotPasswordPage, getLoginPage, getRegisterPage,
    getSendEmailPage, login, logout, register, sendEmail } = require('../../controllers/views/auth');
const { UserGame, UserGameBiodata } = require('../../database/models');

const router = express.Router();

router.route('/register')
    .get((req, res, next) => {
        if (req.user) return res.status(302).redirect('/view/user_games');
        next();
    }, getRegisterPage)
    .post([
        body('username')
            .trim()
            .notEmpty().withMessage('Username is required')
            .isString().withMessage('Username must be a string')
            .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long')
            .custom(async value => {
                const userGame = await UserGame.findOne({ where: { username: value } });
                if (userGame) throw new Error('Username already exists');
            }),
        body('password')
            .trim()
            .notEmpty().withMessage('Password is required')
            .isString().withMessage('Password must be a string')
            .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
        body('confirmPassword')
            .trim()
            .notEmpty().withMessage('Confirm password is required')
            .isString().withMessage('Password must be a string'),
        body('email')
            .notEmpty().withMessage('Email is required')
            .isEmail().withMessage('Email must be a valid email address')
            .custom(async value => {
                const userGameBiodata = await UserGameBiodata.findOne({ where: { email: value } });
                if (userGameBiodata) throw new Error('Email already exists');
            }),
        body('firstname')
            .trim()
            .notEmpty().withMessage('Firstname is required')
            .isString().withMessage('Firstname must be a string'),
        body('lastname')
            .trim()
            .notEmpty().withMessage('Lastname is required')
            .isString().withMessage('Lastname must be a string'),
        body('country')
            .trim()
            .notEmpty().withMessage('Country is required')
            .isString().withMessage('Country must be a string'),
        body('age')
            .notEmpty().withMessage('Age is required')
            .isInt({ min: 1 }).withMessage('Age must be a number greater than 1')
    ], register)
    .all(methodNotAllowedPage);

router.route('/login')
    .get((req, res, next) => {
        if (req.user) return res.status(302).redirect('/view/user_games');
        next();
    }, getLoginPage)
    .post([
        body('username')
            .trim()
            .notEmpty().withMessage('Username is required')
            .isString().withMessage('Username must be a string')
            .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
        body('password')
            .trim()
            .notEmpty().withMessage('Password is required')
            .isString().withMessage('Password must be a string')
            .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    ], login)
    .all(methodNotAllowedPage);

router.route('/logout')
    .post((req, res, next) => {
        if (!req.user) return res.status(302).redirect('/view/login');
        next();
    }, logout)
    .all(methodNotAllowedPage);

router.route('/send_email')
    .get(getSendEmailPage)
    .post([
        body('email')
            .notEmpty().withMessage('Email is required')
            .isEmail().withMessage('Email must be a valid email address')
    ], sendEmail)
    .all(methodNotAllowedPage);

router.route('/forgot_password')
    .get([
        query('id')
            .trim()
            .notEmpty().withMessage('Id is required')
            .isInt({ min: 1 }).withMessage('Id must be a number greater than 1'),
        query('token')
            .trim()
            .notEmpty().withMessage('Token is required')
            .isString().withMessage('Token must be a string')
    ], getForgotPasswordPage)
    .post([
        body('id')
            .isInt({ min: 1 }).withMessage('Id must be a number greater than 1'),
        body('password')
            .trim()
            .notEmpty().withMessage('Password is required')
            .isString().withMessage('Password must be a string')
            .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
        body('confirmPassword')
            .trim()
            .notEmpty().withMessage('Confirm password is required')
            .isString().withMessage('Password must be a string')
    ], forgotPassword)
    .all(methodNotAllowedPage);

module.exports = router;
