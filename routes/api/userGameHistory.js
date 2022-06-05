const express = require('express');
const multer = require('multer');
const { body, param } = require('express-validator');
const passport = require('../../middlewares/passportJWT');
const { forbidden, internalServerError, methodNotAllowed,
    notFound, unAuthorized } = require('../../controllers/error');
const { create, destroy, findAll, findOne, update } = require('../../controllers/userGameHistory');
const { UserGame, UserGameHistory } = require('../../database/models');
const { gameStorage } = require('../../middlewares/file');

const router = express.Router();

router.route('/user_games/histories')
    .get(findAll)
    .post((req, res, next) => {
        passport.authenticate('jwt', (err, user, info) => {
            if (err) return internalServerError(err, req, res);
            if (!user) return unAuthorized(req, res);
            if (user.roleId === 1) return next();
            if (user.id !== req.body.userGameId) return forbidden(req, res);
            next();
        })(req, res, next);
    }, multer({ storage: gameStorage }).single('cover'), [
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
            .trim()
            .notEmpty().withMessage('Score is required')
            .isInt({
                min: 0,
                max: 100
            }).withMessage('Score must be an integer between 0 and 100'),
        body('userGameId')
            .trim()
            .isInt().withMessage('UserGameId must be an integer')
    ], create)
    .all(methodNotAllowed);

router.route('/user_game/history/:id')
    .get([
        param('id').isInt().withMessage('Id must be an integer')
    ], findOne)
    .patch((req, res, next) => {
        passport.authenticate('jwt', { session: false }, async (err, user, info) => {
            if (err) return internalServerError(err, req, res);
            if (!user) return unAuthorized(req, res);
            if (user.roleId === 1) return next();
            const userGameHistory = await UserGameHistory.findByPk(+req.params.id);
            if (!userGameHistory) return notFound(req, res);
            if (user.id !== req.body.userGameId) return forbidden(req, res);
            next();
        })(req, res, next);
    }, multer({ storage: gameStorage }).single('cover'), [
        param('id').isInt().withMessage('Id must be an integer'),
        body('title')
            .optional()
            .trim()
            .isString().withMessage('Title must be a string'),
        body('publisher')
            .optional()
            .trim()
            .isString().withMessage('Publisher must be a string'),
        body('cover')
            .optional(),
        body('score')
            .optional()
            .trim()
            .isInt({
                min: 0,
                max: 100
            }).withMessage('Score must be an integer between 0 and 100'),
        body('userGameId')
            .optional()
            .trim()
            .isInt().withMessage('UserGameId must be an integer')
    ], update)
    .delete((req, res, next) => {
        passport.authenticate('jwt', { session: false }, async (err, user, info) => {
            if (err) return internalServerError(err, req, res);
            if (!user) return unAuthorized(req, res);
            if (user.roleId === 1) return next();
            const userGameHistory = await UserGameHistory.findByPk(+req.params.id, { include: [{ model: UserGame }] });
            const userGameId = userGameHistory?.UserGame?.id;
            if (!userGameHistory) return notFound(req, res);
            if (user.id !== userGameId) return forbidden(req, res);
            next();
        })(req, res, next);
    }, [
        param('id').isInt().withMessage('Id must be an integer')
    ], destroy)
    .all(methodNotAllowed);

module.exports = router;
