const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Account extends Model {

        /**
        * Helper method for defining associations.
        * This method is not a part of Sequelize lifecycle.
        * The `models/index` file will call this method automatically.
        */
        static associate(models) {
            // define association here
            Account.hasMany(models.Cart, {
                foreignKey: 'userId',
            });
            Account.hasMany(models.Order, {
                foreignKey: 'userId',
            });
        }

    }
    Account.init({
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
        },
        username: DataTypes.STRING,
        password: DataTypes.STRING,
        google_email: DataTypes.STRING,

        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    }, {
        sequelize,
        modelName: 'Account',
        tableName: 'accounts',
    });

    return Account;
};
