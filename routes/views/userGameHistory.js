const express = require('express');
const { body, param } = require('express-validator');
const { methodNotAllowedPage } = require('../../controllers/views/error');
const { createUserGameHistory, deleteUserGameHistoryById, updateUserGameHistoryById } = require('../../controllers/views/userGameHistory');

const router = express.Router();

router.route('/user_game/:id/history')
    .post([
        param('id').isInt().withMessage('Id must be an integer'),
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
    ], createUserGameHistory)
    .patch([
        param('id').isInt().withMessage('Id must be an integer'),
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
        body('userGameId').isInt().withMessage('UserGameId must be an integer'),
        body('userGameHistoryId').isInt().withMessage('UserGameHistoryId must be an integer')
    ], updateUserGameHistoryById)
    .delete([
        param('id').isInt().withMessage('Id must be an integer'),
        body('userGameHistoryId').isInt().withMessage('UserGameHistoryId must be an integer')
    ], deleteUserGameHistoryById)
    .all(methodNotAllowedPage);

module.exports = router;
