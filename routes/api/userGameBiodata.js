const express = require('express');
const multer = require('multer');
const { body, param } = require('express-validator');
const passport = require('../../middlewares/passportJWT');
const { forbidden, internalServerError, methodNotAllowed,
    notFound, unAuthorized } = require('../../controllers/error');
const { create, destroy, findAll, findOne, update } = require('../../controllers/userGameBiodata');
const { UserGame, UserGameBiodata } = require('../../database/models');
const { profileStorage } = require('../../middlewares/file');

const router = express.Router();

router.route('/user_games/biodatas')
    .get(findAll)
    .post((req, res, next) => {
        passport.authenticate('jwt', (err, user, info) => {
            if (err) return internalServerError(err, req, res);
            if (!user) return unAuthorized(req, res);
            if (user.roleId === 1) return next();
            if (user.id !== req.body.userGameId) return forbidden(req, res);
            next();
        })(req, res, next);
    }, multer({ storage: profileStorage }).single('profilePicture'), [
        body('email')
            .trim()
            .notEmpty().withMessage('Email is required')
            .isEmail().withMessage('Email must be a valid email address')
            .custom(async value => {
                const userGameBiodata = await UserGameBiodata.findOne({ where: { email: value } });
                if (userGameBiodata) {
                    throw new Error('Email already exists');
                }
            }),
        body('firstname')
            .trim()
            .notEmpty().withMessage('Firstname is required')
            .isString().withMessage('Firstname must be a string'),
        body('lastname')
            .trim()
            .notEmpty().withMessage('Lastname is required')
            .isString().withMessage('Lastname must be a string'),
        body('profilePicture')
            .optional(),
        body('country')
            .trim()
            .notEmpty().withMessage('Country is required')
            .isString().withMessage('Country must be a string'),
        body('age')
            .trim()
            .notEmpty().withMessage('Age is required')
            .isInt({ min: 1 }).withMessage('Age must be a number greater than 1'),
        body('userGameId')
            .trim()
            .isInt().withMessage('UserGameId must be an integer')
    ], create)
    .all(methodNotAllowed);

router.route('/user_game/biodata/:id')
    .get([
        param('id').isInt().withMessage('Id must be an integer')
    ], findOne)
    .patch((req, res, next) => {
        passport.authenticate('jwt', { session: false }, async (err, user, info) => {
            if (err) return internalServerError(err, req, res);
            if (!user) return unAuthorized(req, res);
            if (user.roleId === 1) return next();
            const userGameBiodata = await UserGameBiodata.findByPk(+req.params.id);
            if (!userGameBiodata) return notFound(req, res);
            if (user.id !== req.body.userGameId) return forbidden(req, res);
            next();
        })(req, res, next);
    }, multer({ storage: profileStorage }).single('profilePicture'), [
        param('id').isInt().withMessage('Id must be an integer'),
        body('email')
            .optional()
            .trim()
            .isEmail().withMessage('Email must be a valid email address')
            .custom(async value => {
                const userGameBiodata = await UserGameBiodata.findOne({ where: { email: value } });
                if (userGameBiodata) {
                    throw new Error('Email already exists');
                }
            }),
        body('firstname')
            .optional()
            .trim()
            .isString().withMessage('Firstname must be a string'),
        body('lastname')
            .optional()
            .trim()
            .isString().withMessage('Lastname must be a string'),
        body('profilePicture')
            .optional(),
        body('country')
            .optional()
            .trim()
            .isString().withMessage('Country must be a string'),
        body('age')
            .optional()
            .trim()
            .isInt({ min: 1 }).withMessage('Age must be a number greater than 1'),
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
            const userGameBiodata = await UserGameBiodata.findByPk(+req.params.id, { include: [{ model: UserGame }] });
            const userGameId = userGameBiodata?.UserGame?.id;
            if (!userGameBiodata) return notFound(req, res);
            if (user.id !== userGameId) return forbidden(req, res);
            next();
        })(req, res, next);
    }, [
        param('id').isInt().withMessage('Id must be an integer')
    ], destroy)
    .all(methodNotAllowed);

module.exports = router;
