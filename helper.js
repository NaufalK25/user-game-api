const getEndpoint = (endpoint) => {
    endpoint = endpoint.replace(/\/api\/v1/, '');
    return (endpoint === '/') ? endpoint : endpoint.replace(/\/$/, '');
}

const getDataById = (model) => {
    return async (id, include = []) => {
        return await model.findOne({
            where: {
                id,
            },
            include,
        });
    }
}

const sequelizeErrorNames = [
    'ValidationError',
    'SequelizeUniqueConstraintError',
    'SequelizeForeignKeyConstraintError',
];

module.exports = {
    getEndpoint,
    getDataById,
    sequelizeErrorNames,
}
