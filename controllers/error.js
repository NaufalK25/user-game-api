const { getEndpoint } = require('../helper');

module.exports = {
    badRequest: (err, req, res) => {
        res.status(400).json({
            statusCode: 400,
            errors: err,
        });
    },
    notFound: (req, res) => {
        res.status(404).json({
            statusCode: 404,
            messagef: `Endpoint ${getEndpoint(req.originalUrl)} not found`,
        });
    },
    methodNotAllowed: (req, res) => {
        res.status(405).json({
            statusCode: 405,
            message: `Method ${req.method} not allowed at endpoint ${getEndpoint(req.originalUrl)}`,
        });
    },
    internalServerError: (err, req, res) => {
        res.status(500).json({
            statusCode: 500,
            message: err.message,
        });
    },
}
