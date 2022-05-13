require('dotenv').config();

module.exports = {
    development: {
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASS,
        database: process.env.DB_NAME || 'game',
        host: process.env.DB_HOST || 'localhost',
        dialect: process.env.DB_DIALECT || 'postgres',
    },
    test: {
        username: process.env.CI_DB_USER || 'postgres',
        password: process.env.CI_DB_PASS,
        database: process.env.CI_DB_NAME || 'game_test',
        host: process.env.CI_DB_HOST || 'localhost',
        dialect: process.env.CI_DB_DIALECT || 'postgres',
        logging: false
    },
    production: {
        username: process.env.PROD_DB_USER,
        password: process.env.PROD_DB_PASS,
        database: process.env.PROD_DB_NAME,
        host: process.env.PROD_DB_HOST,
        dialect: process.env.PROD_DB_DIALECT,
        logging: false,
        ssl: {
            rejectUnauthorized: false
        }
    }
}
