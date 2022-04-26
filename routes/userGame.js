const express = require('express');
const { body, param } = require('express-validator');
const { methodNotAllowed } = require('../controllers/error');
const { create, destroy, findAll, findOne, update } = require('../controllers/userGame');
const { findHistoriesByUserGameId } = require('../controllers/userGameHistory');
const { findBiodataByUserGameId } = require('../controllers/userGameBiodata');
const { UserGame } = require('../database/models');

const router = express.Router();

router.route('/api/v1/user_games')
    .get(findAll)
    .post([
        body('username').isString().custom(async value => {
            const userGame = await UserGame.findOne({ where: { username: value } });
            if (userGame) {
                throw new Error('Username already exists');
            }
        }).notEmpty(),
        body('password').isString().notEmpty()
    ], create)
    .all(methodNotAllowed);

router.route('/api/v1/user_game/:userGameId/biodata')
    .get([
        param('userGameId').isInt()
    ], findBiodataByUserGameId)
    .all(methodNotAllowed);

router.route('/api/v1/user_game/:userGameId/history')
    .get([
        param('userGameId').isInt()
    ], findHistoriesByUserGameId)
    .all(methodNotAllowed);

router.route('/api/v1/user_game/:id')
    .get([
        param('id').isInt()
    ], findOne)
    .patch([
        param('id').isInt(),
        body('username').isString().custom(async value => {
            const userGame = await UserGame.findOne({ where: { username: value } });
            if (userGame) {
                throw new Error('Username already exists');
            }
        }).optional(),
        body('password').isString().optional()
    ], update)
    .delete([
        param('id').isInt()
    ], destroy)
    .all(methodNotAllowed);

module.exports = router;
