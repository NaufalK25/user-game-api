'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        /**
         * Add altering commands here.
         *
         * Example:
         * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
         */
        await queryInterface.changeColumn('UserGameBiodata', 'email', {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        });
        await queryInterface.changeColumn('UserGameBiodata', 'firstname', {
            type: Sequelize.STRING,
            allowNull: false
        });
        await queryInterface.changeColumn('UserGameBiodata', 'lastname', {
            type: Sequelize.STRING,
            allowNull: false
        });
        await queryInterface.changeColumn('UserGameBiodata', 'age', {
            type: Sequelize.INTEGER,
            allowNull: false,
            validate: {
                isInt: true,
                min: 0
            }
        });
        await queryInterface.addColumn('UserGameBiodata', 'country', {
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
        await queryInterface.changeColumn('UserGameBiodata', 'email', {
            type: Sequelize.STRING,
        });
        await queryInterface.changeColumn('UserGameBiodata', 'firstname', {
            type: Sequelize.STRING,
        });
        await queryInterface.changeColumn('UserGameBiodata', 'lastname', {
            type: Sequelize.STRING,
        });
        await queryInterface.changeColumn('UserGameBiodata', 'age', {
            type: Sequelize.INTEGER,
        });
        await queryInterface.removeColumn('UserGameBiodata', 'country');
    }
};
