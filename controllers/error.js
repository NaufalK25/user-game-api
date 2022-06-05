const { getEndpoint } = require('../helper');

module.exports = {
    badRequest: (err, req, res) => {
        res.status(400).json({
            statusCode: 400,
            errors: err
        });
    },
    unAuthorized: (req, res) => {
        res.status(401).json({
            statusCode: 401,
            message: 'Unauthorized'
        });
    },
    forbidden: (req, res) => {
        res.status(403).json({
            statusCode: 403,
            message: 'Forbidden'
        });
    },
    notFound: (req, res) => {
        res.status(404).json({
            statusCode: 404,
            message: `Endpoint ${getEndpoint(req.originalUrl)} not found`
        });
    },
    methodNotAllowed: (req, res) => {
        res.status(405).json({
            statusCode: 405,
            message: `Method ${req.method} not allowed at endpoint ${getEndpoint(req.originalUrl)}`
        });
    },
    internalServerError: (err, req, res) => {
        res.status(500).json({
            statusCode: 500,
            message: err.message ? err.message : err
        });
    }
}
