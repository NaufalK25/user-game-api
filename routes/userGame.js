const express = require('express');
const { body, param } = require('express-validator');
const { methodNotAllowed } = require('../controllers/error');
const { create, destroy, findAll, findOne, update } = require('../controllers/userGame');
const { findBiodataByUserGameId } = require('../controllers/userGameBiodata');
const { findHistoriesByUserGameId } = require('../controllers/userGameHistory');
const { UserGame } = require('../database/models');

const router = express.Router();

router.route('/api/v1/user_games')
    .get(findAll)
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
            .isString().withMessage('Password must be a string')
    ], create)
    .all(methodNotAllowed);

router.route('/api/v1/user_game/:userGameId/biodata')
    .get([
        param('userGameId').isInt().withMessage('UserGameId must be an integer')
    ], findBiodataByUserGameId)
    .all(methodNotAllowed);

router.route('/api/v1/user_game/:userGameId/history')
    .get([
        param('userGameId').isInt().withMessage('UserGameId must be an integer')
    ], findHistoriesByUserGameId)
    .all(methodNotAllowed);

router.route('/api/v1/user_game/:id')
    .get([
        param('id').isInt().withMessage('Id must be an integer'),
    ], findOne)
    .patch([
        param('id').isInt().withMessage('Id must be an integer'),
        body('username')
            .optional()
            .isString().withMessage('Username must be a string')
            .custom(async value => {
                const userGame = await UserGame.findOne({ where: { username: value } });
                if (userGame) {
                    throw new Error('Username already exists');
                }
            }),
        body('password')
            .optional()
            .isString().withMessage('Password must be a string')
    ], update)
    .delete([
        param('id').isInt().withMessage('Id must be an integer')
    ], destroy)
    .all(methodNotAllowed);

module.exports = router;
