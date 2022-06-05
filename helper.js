const { SVG } = require('./config/constants');

const getEndpoint = (endpoint = '/api/v1') => {
    if (!endpoint) return '';
    endpoint = endpoint.replace(/\/api\/v1/, '');
    return (endpoint === '/') ? endpoint : endpoint.replace(/\/$/, '');
}

const generateRenderObject = ({ title = 'User Game API', scripts = [], styles = [], extras = {} } = {}) => {
    return {
        title,
        layout: 'layouts/layout',
        scripts: [...scripts],
        styles: [...styles],
        ...extras
    }
}

const generateErrorRenderObject = ({ title, message } = {}) => {
    if (!title && !message) return {};
    return {
        title,
        layout: 'layouts/layout',
        scripts: [],
        styles: [],
        message
    }
}

const generateFlash = (req, { type, message = '', errors = [] } = {}) => {
    if (!req || !type) return;
    req.flash('type', type);
    req.flash('svg', SVG[type]);

    if (type === 'danger') {
        req.flash('errors', errors);
    } else {
        req.flash('message', message);
    }
}

const generateFlashObject = (req) => {
    try {
        return {
            type: req.flash('type') || '',
            svg: req.flash('svg') || '',
            message: req.flash('message') || '',
            errors: req.flash('errors') || []
        };
    } catch (error) {
        return {};
    }
}

module.exports = {
    getEndpoint,
    generateRenderObject,
    generateErrorRenderObject,
    generateFlash,
    generateFlashObject
}
