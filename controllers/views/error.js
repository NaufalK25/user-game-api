const { getEndpoint } = require('../../helper');

module.exports = {
    notFoundPage: (req, res) => {
        res.status(404).render('error', {
            title: '404 Not Found',
            layout: 'layouts/layout',
            scripts: [],
            styles: [],
            message: `Endpoint ${getEndpoint(req.originalUrl)} not found`,
        });
    },
    methodNotAllowedPage: (req, res) => {
        res.status(405).render('error', {
            title: '405 Method Not Allowed',
            layout: 'layouts/layout',
            scripts: [],
            styles: [],
            message: `Method ${req.method} not allowed at endpoint ${getEndpoint(req.originalUrl)}`,
        });
    },
    internalServerErrorPage: (err, req, res) => {
        res.status(500).render('error', {
            title: '500 Internal Server Error',
            layout: 'layouts/layout',
            scripts: [],
            styles: [],
            message: err,
        });
    },
}
