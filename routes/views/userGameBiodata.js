const express = require('express');
const { body, param } = require('express-validator');
const { methodNotAllowedPage } = require('../../controllers/views/error');
const { createUserGameBiodata, deleteUserGameBiodataById, updateUserGameBiodataById } = require('../../controllers/views/userGameBiodata');
const { UserGameBiodata } = require('../../database/models');

const router = express.Router();

router.route('/user_game/:id/biodata')
    .post([
        param('id').isInt().withMessage('Id must be an integer'),
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
        body('userGameId').isInt().withMessage('    must be an integer')
    ], createUserGameBiodata)
    .patch([
        param('id').isInt().withMessage('Id must be an integer'),
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
        body('userGameId').isInt().withMessage('UserGameId must be an integer'),
        body('userGameBiodataId').isInt().withMessage('UserGameBiodataId must be an integer')
    ], updateUserGameBiodataById)
    .delete([
        param('id').isInt().withMessage('Id must be an integer'),
        body('userGameBiodataId').isInt().withMessage('UserGameBiodataId must be an integer')
    ], deleteUserGameBiodataById)
    .all(methodNotAllowedPage);

module.exports = router;
