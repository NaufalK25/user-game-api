const express = require('express');
const { body, param } = require('express-validator');
const passport = require('../../middlewares/passportJWT');
const { forbidden, internalServerError, methodNotAllowed,
    notFound, unAuthorized } = require('../../controllers/error');
const { create, destroy, findAll, findOne, update } = require('../../controllers/userGame');
const { findBiodataByUserGameId } = require('../../controllers/userGameBiodata');
const { findHistoriesByUserGameId } = require('../../controllers/userGameHistory');
const { UserGame } = require('../../database/models');

const router = express.Router();

router.route('/user_games')
    .get(findAll)
    .post([
        body('username')
            .trim()
            .notEmpty().withMessage('Username is required')
            .isString().withMessage('Username must be a string')
            .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long')
            .custom(async value => {
                const userGame = await UserGame.findOne({ where: { username: value } });
                if (userGame) {
                    throw new Error('Username already exists');
                }
            }),
        body('password')
            .notEmpty().withMessage('Password is required')
            .isString().withMessage('Password must be a string')
            .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    ], create)
    .all(methodNotAllowed);

router.route('/user_game/:userGameId/biodata')
    .get([
        param('userGameId').isInt().withMessage('UserGameId must be an integer')
    ], findBiodataByUserGameId)
    .all(methodNotAllowed);

router.route('/user_game/:userGameId/histories')
    .get([
        param('userGameId').isInt().withMessage('UserGameId must be an integer')
    ], findHistoriesByUserGameId)
    .all(methodNotAllowed);

router.route('/user_game/:id')
    .get([
        param('id').isInt().withMessage('Id must be an integer'),
    ], findOne)
    .patch((req, res, next) => {
        passport.authenticate('jwt', { session: false }, async (err, user, info) => {
            if (err) return internalServerError(err, req, res);
            if (!user) return unAuthorized(req, res);
            if (user.roleId === 1) return next();
            const userGame = await UserGame.findByPk(+req.params.id);
            if (!userGame) return notFound(req, res);
            if (user.id !== +req.params.id) return forbidden(req, res);
            next();
        })(req, res, next);
    }, [
        param('id').isInt().withMessage('Id must be an integer'),
        body('username')
            .optional()
            .trim()
            .isString().withMessage('Username must be a string')
            .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long')
            .custom(async value => {
                const userGame = await UserGame.findOne({ where: { username: value } });
                if (userGame) {
                    throw new Error('Username already exists');
                }
            }),
        body('password')
            .optional()
            .isString().withMessage('Password must be a string')
            .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    ], update)
    .delete((req, res, next) => {
        passport.authenticate('jwt', { session: false }, async (err, user, info) => {
            if (err) return internalServerError(err, req, res);
            if (!user) return unAuthorized(req, res);
            if (user.roleId === 1) return next();
            const userGame = await UserGame.findByPk(+req.params.id);
            if (!userGame) return notFound(req, res);
            if (user.id !== +req.params.id) return forbidden(req, res);
            next();
        })(req, res, next);
    }, [
        param('id').isInt().withMessage('Id must be an integer')
    ], destroy)
    .all(methodNotAllowed);

module.exports = router;
