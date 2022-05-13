const { getEndpoint, generateErrorRenderObject } = require('../../helper');

module.exports = {
    notFoundPage: (req, res) => {
        res.status(404).render('error', generateErrorRenderObject({
            title: '404 Page Not Found',
            message: `Endpoint ${getEndpoint(req.originalUrl)} not found`
        }));
    },
    methodNotAllowedPage: (req, res) => {
        res.status(405).render('error', generateErrorRenderObject({
            title: '405 Method Not Allowed',
            message: `Method ${req.method} not allowed at endpoint ${getEndpoint(req.originalUrl)}`
        }));
    },
    internalServerErrorPage: (err, req, res) => {
        res.status(500).render('error', generateErrorRenderObject({
            title: '500 Internal Server Error',
            message: err
        }));
    }
}
