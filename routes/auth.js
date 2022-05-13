const express = require('express');
const { body } = require('express-validator');
const { login } = require('../controllers/auth');
const { methodNotAllowed } = require('../controllers/error');

const router = express.Router();

router.route('/api/v1/login')
    .post([
        body('username')
            .notEmpty().withMessage('Username is required')
            .isString().withMessage('Username must be a string'),
        body('password')
            .notEmpty().withMessage('Password is required')
            .isString().withMessage('Password must be a string')
    ], login)
    .all(methodNotAllowed);

module.exports = router;
