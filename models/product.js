const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Product extends Model {

        /**
        * Helper method for defining associations.
        * This method is not a part of Sequelize lifecycle.
        * The `models/index` file will call this method automatically.
        */
        static associate(models) {
            // define association here
            Product.hasMany(models.Cart, {
                foreignKey: 'productId',
            });
        }

    }
    Product.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: DataTypes.STRING,
        picture_url: DataTypes.STRING,
        price: DataTypes.INTEGER,
        discount: DataTypes.FLOAT,
        stock: DataTypes.INTEGER,
        sold: DataTypes.INTEGER,

        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    }, {
        sequelize,
        modelName: 'Product',
        tableName: 'products',
    });

    return Product;
};
