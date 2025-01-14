/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('orders', {
            id: {
                type: Sequelize.DataTypes.UUID,
                primaryKey: true,
            },
            userId: {
                type: Sequelize.DataTypes.UUID,
                allowNull: false,
            },
            amount: {
                type: Sequelize.DataTypes.INTEGER,
                allowNull: false,
            },
            state: {
                type: Sequelize.DataTypes.INTEGER,
                allowNull: false,
            },
            note: {
                type: Sequelize.DataTypes.TEXT,
                allowNull: true,
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
        await queryInterface.dropTable('orders');
    },
};
