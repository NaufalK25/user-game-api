const { SVG } = require('./config/constants');

const getEndpoint = (endpoint) => {
    endpoint = endpoint.replace(/\/api\/v1/, '');
    return (endpoint === '/') ? endpoint : endpoint.replace(/\/$/, '');
}

const getDataBySpecificField = (model, field) => {
    return async (value, include = []) => {
        return await model.findOne({
            where: {
                [field]: value,
            },
            include,
        });
    }
}

const generateRenderObject = ({ title, scripts = [], styles = [], extras = {} }) => {
    return {
        title,
        layout: 'layouts/layout',
        scripts: [...scripts],
        styles: [...styles],
        ...extras,
    }
}

const generateFlash = (req, { type, message = '', errors = [] }) => {
    req.flash('type', type);
    req.flash('svg', SVG[type]);

    if (type === 'danger') {
        req.flash('errors', errors);
    } else {
        req.flash('message', message);
    }
}

module.exports = {
    generateFlash,
    generateRenderObject,
    getDataBySpecificField,
    getEndpoint,
}
