const express = require('express');
const { body, param } = require('express-validator');
const { methodNotAllowed } = require('../controllers/error');
const { create, destroy, findAll, findOne, update } = require('../controllers/userGameBiodata');
const { UserGameBiodata } = require('../database/models');

const router = express.Router();

router.route('/api/v1/user_games/biodatas')
    .get(findAll)
    .post([
        body('email').isEmail().custom(async value => {
            const userGameBiodata = await UserGameBiodata.findOne({ where: { email: value } });
            if (userGameBiodata) {
                throw new Error('Email already exists');
            }
        }).notEmpty(),
        body('firstname').isString().notEmpty(),
        body('lastname').isString().notEmpty(),
        body('country').isString().notEmpty(),
        body('age').isInt({
            min: 0
        }).notEmpty(),
        body('userGameId').isInt()
    ], create)
    .all(methodNotAllowed);

router.route('/api/v1/user_game/biodata/:id')
    .get([
        param('id').isInt()
    ], findOne)
    .patch([
        param('id').isInt(),

    ], update)
    .delete([
        param('id').isInt(),
        body('email').isEmail().custom(async value => {
            const userGameBiodata = await UserGameBiodata.findOne({ where: { email: value } });
            if (userGameBiodata) {
                throw new Error('Email already exists');
            }
        }).optional(),
        body('firstname').isString().optional(),
        body('lastname').isString().optional(),
        body('country').isString().optional(),
        body('age').isInt({
            min: 0
        }).optional(),
        body('userGameId').isInt().optional()
    ], destroy)
    .all(methodNotAllowed);

module.exports = router;
