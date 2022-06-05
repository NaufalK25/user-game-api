'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class UserGameHistory extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            this.belongsTo(models.UserGame, { foreignKey: 'userGameId' });
        }
    }
    UserGameHistory.init({
        title: DataTypes.STRING,
        publisher: DataTypes.STRING,
        cover: DataTypes.STRING,
        lastPlayed: DataTypes.DATE,
        score: DataTypes.INTEGER
    }, {
        sequelize,
        modelName: 'UserGameHistory'
    });
    return UserGameHistory;
};
