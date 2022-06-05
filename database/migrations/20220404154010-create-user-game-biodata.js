'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('UserGameBiodata', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
                validate: {
                    isEmail: true
                }
            },
            firstname: {
                type: Sequelize.STRING,
                allowNull: false
            },
            lastname: {
                type: Sequelize.STRING,
                allowNull: false
            },
            profilePicture: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: 'default-profile.png'
            },
            country: {
                type: Sequelize.STRING,
                allowNull: false
            },
            age: {
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
        await queryInterface.dropTable('UserGameBiodata');
    }
};
