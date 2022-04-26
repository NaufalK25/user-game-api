'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class UserGame extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            this.hasOne(models.UserGameBiodata, {
                foreignKey: 'userGameId',
            });
            this.hasMany(models.UserGameHistory, {
                foreignKey: 'userGameId',
            });
        }
    }
    UserGame.init({
        username: DataTypes.STRING,
        password: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'UserGame',
    });
    return UserGame;
};
