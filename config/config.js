require('dotenv').config();

module.exports = {
    development: {
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASS || 'postgres',
        database: process.env.DB_NAME || 'game',
        host: process.env.DB_HOST || 'localhost',
        dialect: process.env.DB_DIALECT || 'postgres'
    },
    test: {
        username: process.env.CI_DB_USER || 'postgres',
        password: process.env.CI_DB_PASS,
        database: process.env.CI_DB_NAME || 'game_test',
        host: process.env.CI_DB_HOST || 'localhost',
        dialect: process.env.CI_DB_DIALECT || 'postgres'
    },
    production: {
        username: process.env.PROD_DB_USER || 'postgres',
        password: process.env.PROD_DB_PASS,
        database: process.env.PROD_DB_NAME || 'game_production',
        host: process.env.PROD_DB_HOST || 'localhost',
        dialect: process.env.PROD_DB_DIALECT || 'postgres',
        logging: false,
        ssl: {
            rejectUnauthorized: false
        }
    }
}
