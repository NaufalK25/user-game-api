const express = require('express');
const { body, param } = require('express-validator');
const { methodNotAllowedPage } = require('../../controllers/views/error');
const { createUserGame, deleteUserGameById, getAllUserGamesPage, getUserGameByIdPage, updateUserGameById } = require('../../controllers/views/userGame');
const { UserGame } = require('../../database/models');

const router = express.Router();

router.route('/user_games')
    .get(getAllUserGamesPage)
    .post([
        body('username')
            .notEmpty().withMessage('Username is required')
            .isString().withMessage('Username must be a string')
            .custom(async value => {
                const userGame = await UserGame.findOne({ where: { username: value } });
                if (userGame) {
                    throw new Error('Username already exists');
                }
            }),
        body('password')
            .notEmpty().withMessage('Password is required')
            .isString().withMessage('Password must be a string'),
    ], createUserGame)
    .all(methodNotAllowedPage);

router.route('/user_game/:id')
    .get([
        param('id').isInt().withMessage('Id must be an integer'),
    ], getUserGameByIdPage)
    .patch([
        body('username')
            .notEmpty().withMessage('Username is required')
            .isString().withMessage('Username must be a string')
            .custom(async value => {
                const userGame = await UserGame.findOne({ where: { username: value } });
                if (userGame) {
                    throw new Error('Username already exists');
                }
            }),
        body('password')
            .notEmpty().withMessage('Password is required')
            .isString().withMessage('Password must be a string'),
    ], updateUserGameById)
    .delete([
        param('id').isInt().withMessage('Id must be an integer'),
    ], deleteUserGameById)
    .all(methodNotAllowedPage);

module.exports = router;
