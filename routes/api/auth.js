const express = require('express');
const { body } = require('express-validator');
const { login, register } = require('../../controllers/auth');
const { methodNotAllowed } = require('../../controllers/error');
const { UserGame } = require('../../database/models');

const router = express.Router();

router.route('/register')
    .post([
        body('username')
            .notEmpty().withMessage('Username is required')
            .isString().withMessage('Username must be a string')
            .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long')
            .custom(async (value, { req }) => {
                const userGame = await UserGame.findOne({ where: { username: value } });
                if (userGame) {
                    throw new Error('Username already exists');
                }
            }),
        body('password')
            .notEmpty().withMessage('Password is required')
            .isString().withMessage('Password must be a string')
            .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    ], register)
    .all(methodNotAllowed);

router.route('/login')
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
    .all(methodNotAllowed);

module.exports = router;
