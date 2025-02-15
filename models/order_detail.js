const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class OrderDetail extends Model {

        /**
        * Helper method for defining associations.
        * This method is not a part of Sequelize lifecycle.
        * The `models/index` file will call this method automatically.
        */
        static associate(models) {
            OrderDetail.belongsTo(models.Order, {
                foreignKey: 'orderId',
                onDelete: 'CASCADE',
            });

        }

    }
    OrderDetail.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        orderId: DataTypes.UUID,
        userId: DataTypes.UUID,
        venderId: DataTypes.UUID,
        productId: DataTypes.INTEGER,
        name: DataTypes.STRING,
        discount: DataTypes.INTEGER,
        amount: DataTypes.INTEGER,
        quantity: DataTypes.INTEGER,

        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    }, {
        sequelize,
        modelName: 'OrderDetail',
        tableName: 'OrderDetails',
        underscored: false,
    });

    return OrderDetail;
};
