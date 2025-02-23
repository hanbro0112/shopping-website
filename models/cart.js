const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Cart extends Model {

        /**
        * Helper method for defining associations.
        * This method is not a part of Sequelize lifecycle.
        * The `models/index` file will call this method automatically.
        */
        static associate(models) {
            // Cart belongs to Account
            Cart.belongsTo(models.Account, {
                foreignKey: 'userId',
                onDelete: 'CASCADE',
            });
            // Cart belongs to Product
            Cart.belongsTo(models.Product, {
                foreignKey: 'productId',
            });
        }

    }
    Cart.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        userId: DataTypes.UUID,
        productId: DataTypes.INTEGER,
        quantity: DataTypes.INTEGER,

        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    }, {
        sequelize,
        modelName: 'Cart',
        tableName: 'Carts',
    });

    return Cart;
};
