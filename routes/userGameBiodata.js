const express = require('express');
const { body, param } = require('express-validator');
const { methodNotAllowed } = require('../controllers/error');
const { create, destroy, findAll, findOne, update } = require('../controllers/userGameBiodata');
const { UserGameBiodata } = require('../database/models');

const router = express.Router();

router.route('/api/v1/user_games/biodatas')
    .get(findAll)
    .post([
        body('email')
            .notEmpty().withMessage('Email is required')
            .isEmail().withMessage('Email must be a valid email address')
            .custom(async value => {
                const userGameBiodata = await UserGameBiodata.findOne({ where: { email: value } });
                if (userGameBiodata) {
                    throw new Error('Email already exists');
                }
            }),
        body('firstname')
            .notEmpty().withMessage('Firstname is required')
            .isString().withMessage('Firstname must be a string'),
        body('lastname')
            .notEmpty().withMessage('Lastname is required')
            .isString().withMessage('Lastname must be a string'),
        body('country')
            .notEmpty().withMessage('Country is required')
            .isString().withMessage('Country must be a string'),
        body('age')
            .notEmpty().withMessage('Age is required')
            .isInt({ min: 1 }).withMessage('Age must be a number greater than 1'),
        body('userGameId').isInt().withMessage('UserGameId must be an integer')
    ], create)
    .all(methodNotAllowed);

router.route('/api/v1/user_game/biodata/:id')
    .get([
        param('id').isInt().withMessage('Id must be an integer')
    ], findOne)
    .patch([
        param('id').isInt().withMessage('Id must be an integer'),
        body('email')
            .optional()
            .isEmail().withMessage('Email must be a valid email address')
            .custom(async value => {
                const userGameBiodata = await UserGameBiodata.findOne({ where: { email: value } });
                if (userGameBiodata) {
                    throw new Error('Email already exists');
                }
            }),
        body('firstname')
            .optional()
            .isString().withMessage('Firstname must be a string'),
        body('lastname')
            .optional()
            .isString().withMessage('Lastname must be a string'),
        body('country')
            .optional()
            .isString().withMessage('Country must be a string'),
        body('age')
            .optional()
            .isInt({ min: 1 }).withMessage('Age must be a number greater than 1'),
        body('userGameId')
            .optional()
            .isInt().withMessage('UserGameId must be an integer')
    ], update)
    .delete([
        param('id').isInt().withMessage('Id must be an integer')
    ], destroy)
    .all(methodNotAllowed);

module.exports = router;
