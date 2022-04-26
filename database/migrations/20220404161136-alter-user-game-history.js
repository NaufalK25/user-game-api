'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        /**
         * Add altering commands here.
         *
         * Example:
         * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
         */
        await queryInterface.removeColumn('UserGameHistories', 'time');
        await queryInterface.addColumn('UserGameHistories', 'lastPlayed', {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            validate: {
                isDate: true
            }
        });
        await queryInterface.changeColumn('UserGameHistories', 'score', {
            type: Sequelize.INTEGER,
            allowNull: false,
            validate: {
                isInt: true,
                min: 0
            }
        });
        await queryInterface.addColumn('UserGameHistories', 'title', {
            type: Sequelize.STRING,
            allowNull: false
        });
        await queryInterface.addColumn('UserGameHistories', 'publisher', {
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
        await queryInterface.addColumn('UserGameHistories', 'time', {
            type: Sequelize.DATE,
        });
        await queryInterface.removeColumn('UserGameHistories', 'lastPlayed');
        await queryInterface.changeColumn('UserGameHistories', 'score', {
            type: Sequelize.INTEGER,
        });
        await queryInterface.removeColumn('UserGameHistories', 'title');
        await queryInterface.removeColumn('UserGameHistories', 'publisher');
    }
};
