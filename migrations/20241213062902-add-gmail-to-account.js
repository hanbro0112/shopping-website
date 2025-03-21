/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn(
            'accounts',
            'google_email',
            {
                type: Sequelize.STRING,
                unique: true,
                allowNull: true,
            },
        );
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('accounts');
    },
};
