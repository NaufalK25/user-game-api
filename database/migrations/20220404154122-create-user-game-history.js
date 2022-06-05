'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('UserGameHistories', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            title: {
                type: Sequelize.STRING,
                allowNull: false
            },
            publisher: {
                type: Sequelize.STRING,
                allowNull: false
            },
            cover: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: 'default-cover.jpg'
            },
            lastPlayed: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                validate: {
                    isDate: true
                }
            },
            score: {
                type: Sequelize.INTEGER,
                allowNull: false,
                validate: {
                    isInt: true,
                    min: 0
                }
            },
            userGameId: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'UserGames',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
                allowNull: false
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('UserGameHistories');
    }
};
