const express = require('express');
const { body } = require('express-validator');
const { methodNotAllowedPage } = require('../../controllers/views/error');
const { getLoginPage, login } = require('../../controllers/views/auth');

const router = express.Router();

router.route('/login')
    .get(getLoginPage)
    .post([
        body('username')
            .notEmpty().withMessage('Username is required')
            .isString().withMessage('Username must be a string'),
        body('password')
            .notEmpty().withMessage('Password is required')
            .isString().withMessage('Password must be a string'),
    ], login)
    .all(methodNotAllowedPage);

module.exports = router;
