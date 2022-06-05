const express = require('express');
const swaggerUi = require('swagger-ui-express');
const apiRoute = require('./api');
const viewRoute = require('./views');
const { api, root } = require('../controllers');
const { notFound, internalServerError, methodNotAllowed } = require('../controllers/error');
const swaggerDocument = require('../swagger.json');

const router = express.Router();

router.use('/docs', swaggerUi.serve);
router.get('/docs', swaggerUi.setup(swaggerDocument));

router.use('/view', viewRoute);
router.use('/api/v1', apiRoute);

router.route('/api')
    .get(api)
    .all(methodNotAllowed);
router.route('/')
    .get(root)
    .all(methodNotAllowed);

router.use(notFound);
router.use(internalServerError);

module.exports = router;
