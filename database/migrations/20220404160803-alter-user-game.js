'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        /**
         * Add altering commands here.
         *
         * Example:
         * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
         */
        await queryInterface.changeColumn('UserGames', 'username', {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
        });
        await queryInterface.changeColumn('UserGames', 'password', {
            type: Sequelize.STRING,
            allowNull: false
        });
    },
    async down(queryInterface, Sequelize) {
        /**
         * Add reverting commands here.
         *
         * Example:
         * await queryInterface.dropTable('users');
         */
        await queryInterface.changeColumn('UserGames', 'username', {
            type: Sequelize.STRING,
        });
        await queryInterface.changeColumn('UserGames', 'password', {
            type: Sequelize.STRING,
        });
    }
};
