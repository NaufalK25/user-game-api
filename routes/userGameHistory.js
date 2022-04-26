const express = require('express');
const { body, param } = require('express-validator');
const { methodNotAllowed } = require('../controllers/error');
const { create, destroy, findAll, findOne, update } = require('../controllers/userGameHistory');

const router = express.Router();

router.route('/api/v1/user_games/histories')
    .get(findAll)
    .post([
        body('title').isString().notEmpty(),
        body('publisher').isString().notEmpty(),
        body('score').isInt({
            min: 0
        }).notEmpty(),
        body('userGameId').isInt()
    ], create)
    .all(methodNotAllowed);

router.route('/api/v1/user_game/history/:id')
    .get([
        param('id').isInt()
    ], findOne)
    .patch([
        param('id').isInt(),
        body('title').isString().optional(),
        body('publisher').isString().optional(),
        body('score').isInt({
            min: 0
        }).optional(),
        body('userGameId').isInt().optional()
    ], update)
    .delete([
        param('id').isInt()
    ], destroy)
    .all(methodNotAllowed);

module.exports = router;
