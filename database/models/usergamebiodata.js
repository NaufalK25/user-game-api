'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class UserGameBiodata extends Model {
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
    UserGameBiodata.init({
        email: DataTypes.STRING,
        firstname: DataTypes.STRING,
        lastname: DataTypes.STRING,
        profilePicture: DataTypes.STRING,
        country: DataTypes.STRING,
        age: DataTypes.INTEGER
    }, {
        sequelize,
        modelName: 'UserGameBiodata'
    });
    return UserGameBiodata;
};
