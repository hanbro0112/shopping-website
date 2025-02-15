/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('accounts', {
            id: {
                type: Sequelize.DataTypes.UUID,
                primaryKey: true,
            },
            username: {
                type: Sequelize.DataTypes.STRING,
                unique: true,
                allowNull: true,
            },
            password: {
                type: Sequelize.DataTypes.STRING,
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
        await queryInterface.dropTable('accounts');
    },
};
