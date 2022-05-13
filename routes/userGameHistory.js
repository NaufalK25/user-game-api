const express = require('express');
const { body, param } = require('express-validator');
const { methodNotAllowed } = require('../controllers/error');
const { create, destroy, findAll, findOne, update } = require('../controllers/userGameHistory');

const router = express.Router();

router.route('/api/v1/user_games/histories')
    .get(findAll)
    .post([
        body('title')
            .notEmpty().withMessage('Title is required')
            .isString().withMessage('Title must be a string'),
        body('publisher')
            .notEmpty().withMessage('Publisher is required')
            .isString().withMessage('Publisher must be a string'),
        body('score')
            .notEmpty().withMessage('Score is required')
            .isInt({
                min: 0,
                max: 100
            }).withMessage('Score must be an integer between 0 and 100'),
        body('userGameId').isInt().withMessage('UserGameId must be an integer')
    ], create)
    .all(methodNotAllowed);

router.route('/api/v1/user_game/history/:id')
    .get([
        param('id').isInt().withMessage('Id must be an integer')
    ], findOne)
    .patch([
        param('id').isInt().withMessage('Id must be an integer'),
        body('title')
            .optional()
            .isString().withMessage('Title must be a string'),
        body('publisher')
            .optional()
            .isString().withMessage('Publisher must be a string'),
        body('score')
            .optional()
            .isInt({
                min: 0,
                max: 100
            }).withMessage('Score must be an integer between 0 and 100'),
        body('userGameId')
            .optional()
            .isInt().withMessage('UserGameId must be an integer')
    ], update)
    .delete([
        param('id').isInt().withMessage('Id must be an integer')
    ], destroy)
    .all(methodNotAllowed);

module.exports = router;
