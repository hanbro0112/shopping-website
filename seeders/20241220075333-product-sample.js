/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        const data = [
            {
                name: 'iPhone 15',
                picture_url: 'images/product01.png',
                price: 30000,
                discount: 0.0,
                stock: 200,
                sold: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                name: 'iPhone 15 Pro',
                picture_url: 'images/product02.png',
                price: 40000,
                discount: 0.4,
                stock: 95,
                sold: 5,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ];

        await queryInterface.bulkInsert('products', data, {});
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('products', null, {});
    },
};
