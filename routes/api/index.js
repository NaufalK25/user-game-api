const express = require('express');
const authRouter = require('./auth');
const userGameRoute = require('./userGame');
const userGameBiodataRoute = require('./userGameBiodata');
const userGameHistoryRoute = require('./userGameHistory');
const { version } = require('../../controllers');
const { notFound, internalServerError, methodNotAllowed } = require('../../controllers/error');

const router = express.Router();

router.use(authRouter);
router.use(userGameHistoryRoute);
router.use(userGameBiodataRoute);
router.use(userGameRoute);

router.route('/')
    .get(version)
    .all(methodNotAllowed);

router.use(notFound);
router.use(internalServerError);

module.exports = router;
