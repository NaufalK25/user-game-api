const express = require('express');
const userGameRoute = require('./userGame');
const userGameBiodataRoute = require('./userGameBiodata');
const userGameHistoryRoute = require('./userGameHistory');
const swaggerRoute = require('./swagger');
const { api, root, version } = require('../controllers');
const { notFound, internalServerError, methodNotAllowed } = require('../controllers/error');

const router = express.Router();

router.use(swaggerRoute);
router.use(userGameHistoryRoute);
router.use(userGameBiodataRoute);
router.use(userGameRoute);

router.route('/api/v1')
    .get(version)
    .all(methodNotAllowed);

router.route('/api')
    .get(api)
    .all(methodNotAllowed);

router.route('/')
    .get(root)
    .all(methodNotAllowed);

router.use(notFound);
router.use(internalServerError);

module.exports = router;
