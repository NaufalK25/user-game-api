const express = require('express');
const authRoute = require('./auth');
const userGameRoute = require('./userGame');
const userGameBiodataRoute = require('./userGameBiodata');
const userGameHistoryRoute = require('./userGameHistory');
const { internalServerErrorPage, notFoundPage } = require('../../controllers/views/error');

const router = express.Router();

router.use(authRoute);
router.use(userGameHistoryRoute);
router.use(userGameBiodataRoute);
router.use(userGameRoute);

router.use(notFoundPage);
router.use(internalServerErrorPage);

module.exports = router;
