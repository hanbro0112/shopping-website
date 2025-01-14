/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('orderDetails', {
            id: {
                type: Sequelize.DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            orderId: {
                type: Sequelize.DataTypes.UUID,
                allowNull: false,
            },
            userId: {
                type: Sequelize.DataTypes.UUID,
                allowNull: false,
            },
            venderId: {
                type: Sequelize.DataTypes.UUID,
                allowNull: true,
            },
            productId: {
                type: Sequelize.DataTypes.INTEGER,
                allowNull: false,
            },
            name: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
            },
            discount: {
                type: Sequelize.DataTypes.INTEGER,
                allowNull: false,
            },
            amount: {
                type: Sequelize.DataTypes.INTEGER,
                allowNull: false,
            },
            quantity: {
                type: Sequelize.DataTypes.INTEGER,
                allowNull: false,
            },
            createdAt: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.DataTypes.NOW,
                allowNull: false,
            },
            updatedAt: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.DataTypes.NOW,
                allowNull: false,
            },
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('orderDetails');
    },
};
