const express = require('express');
const multer = require('multer');
const { body, param } = require('express-validator');
const passport = require('../../middlewares/passportLocal');
const { methodNotAllowedPage } = require('../../controllers/views/error');
const { createUserGameHistory, deleteUserGameHistoryById,
    updateUserGameHistoryById } = require('../../controllers/views/userGameHistory');
const { gameStorage } = require('../../middlewares/file');

const router = express.Router();

router.route('/user_game/:id/history')
    .post(multer({ storage: gameStorage }).single('cover'), [
        param('id').isInt().withMessage('Id must be an integer'),
        body('title')
            .trim()
            .notEmpty().withMessage('Title is required')
            .isString().withMessage('Title must be a string'),
        body('publisher')
            .trim()
            .notEmpty().withMessage('Publisher is required')
            .isString().withMessage('Publisher must be a string'),
        body('cover')
            .optional(),
        body('score')
            .notEmpty().withMessage('Score is required')
            .isInt({
                min: 0,
                max: 100
            }).withMessage('Score must be an integer between 0 and 100'),
        body('userGameId').isInt().withMessage('UserGameId must be an integer')
    ], createUserGameHistory)
    .patch(multer({ storage: gameStorage }).single('cover'), [
        param('id').isInt().withMessage('Id must be an integer'),
        body('title')
            .optional()
            .trim()
            .notEmpty().withMessage('Title is required')
            .isString().withMessage('Title must be a string'),
        body('publisher')
            .optional()
            .trim()
            .notEmpty().withMessage('Publisher is required')
            .isString().withMessage('Publisher must be a string'),
        body('cover')
            .optional(),
        body('score')
            .optional()
            .notEmpty().withMessage('Score is required')
            .isInt({
                min: 0,
                max: 100
            }).withMessage('Score must be an integer between 0 and 100'),
        body('userGameId')
            .optional()
            .isInt().withMessage('UserGameId must be an integer'),
        body('userGameHistoryId')
            .optional()
            .isInt().withMessage('UserGameHistoryId must be an integer')
    ], updateUserGameHistoryById)
    .delete([
        param('id').isInt().withMessage('Id must be an integer'),
        body('userGameHistoryId').isInt().withMessage('UserGameHistoryId must be an integer')
    ], deleteUserGameHistoryById)
    .all(methodNotAllowedPage);

module.exports = router;
