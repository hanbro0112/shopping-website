const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Order extends Model {

        /**
        * Helper method for defining associations.
        * This method is not a part of Sequelize lifecycle.
        * The `models/index` file will call this method automatically.
        */
        static associate(models) {
            // define association here
            Order.hasMany(models.OrderDetail, {
                foreignKey: 'orderId',
            });
            Order.belongsTo(models.Account, {
                foreignKey: 'userId',
                onDelete: 'CASCADE',
            });
        }

    }
    Order.init({
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
        },
        userId: DataTypes.UUID,
        amount: DataTypes.INTEGER,
        state: DataTypes.INTEGER,
        note: DataTypes.TEXT,

        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    }, {
        sequelize,
        modelName: 'Order',
        tableName: 'orders',
    });

    return Order;
};
