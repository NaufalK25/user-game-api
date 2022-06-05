const express = require('express');
const { body, param } = require('express-validator');
const { methodNotAllowedPage } = require('../../controllers/views/error');
const { createUserGame, deleteUserGameById, getAllUserGamesPage,
    getUserGameByIdPage, updateUserGameById } = require('../../controllers/views/userGame');
const { UserGame, UserGameBiodata } = require('../../database/models');

const router = express.Router();

router.route('/user_games')
    .get((req, res, next) => {
        if (!req.user) return res.redirect('/view/login');
        next();
    }, getAllUserGamesPage)
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
    ], createUserGame)
    .all(methodNotAllowedPage);

router.route('/user_game/:id')
    .get((req, res, next) => {
        if (!req.user) return res.redirect('/view/login');
        next();
    }, [
        param('id').isInt().withMessage('Id must be an integer')
    ], getUserGameByIdPage)
    .patch([
        body('username')
            .trim()
            .notEmpty().withMessage('Username is required')
            .isString().withMessage('Username must be a string')
            .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long')
            .custom(async (value) => {
                const userGame = await UserGame.findOne({ where: { username: value } });
                if (userGame) throw new Error('Username already exists');
            })
    ], updateUserGameById)
    .delete([
        param('id').isInt().withMessage('Id must be an integer')
    ], deleteUserGameById)
    .all(methodNotAllowedPage);

module.exports = router;
