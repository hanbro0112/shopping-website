/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        const data = [
            {
                name: 'ASUS ROG 華碩Zephyrus G16 16吋AI電競筆電銀',
                picture_url: 'images/product01.png',
                price: 87999,
                discount: 0.95,
                stock: 200,
                sold: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                name: 'AirPods 4 主動式降噪款',
                picture_url: 'images/product02.png',
                price: 5990,
                discount: 0.9,
                stock: 105,
                sold: 5,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                name: 'ACER 宏碁Nitro V 15.6吋 電競筆電黑色',
                picture_url: 'images/product03.png',
                price: 32900,
                discount: 0.8,
                stock: 95,
                sold: 5,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                name: 'Apple 蘋果2024 iPad Air 11吋 1TB WiFi 藍',
                picture_url: 'images/product04.png',
                price: 37400,
                discount: 0.9,
                stock: 105,
                sold: 5,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                name: 'SoundcoreLiberty 4 Pro 降噪真無線藍牙耳機',
                picture_url: 'images/product05.png',
                price: 6800,
                discount: 0.76,
                stock: 1000,
                sold: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                name: 'GIGABYTE 技嘉 AORUS 16X AKG 16吋 電競筆電灰色',
                picture_url: 'images/product06.png',
                price: 39999,
                discount: 0.0,
                stock: 50,
                sold: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                name: 'Apple 蘋果iPhone 16 Plus (256G)',
                picture_url: 'images/product07.png',
                price: 36400,
                discount: 0.0,
                stock: 100,
                sold: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                name: 'DELL 戴爾Gaming G15 15.6吋 電競筆電黑色',
                picture_url: 'images/product08.png',
                price: 41800,
                discount: 0.0,
                stock: 50,
                sold: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                name: 'SONY 索尼 DSC-RX100 VII DSC-RX100M7 類單眼數位相機',
                picture_url: 'images/product09.png',
                price: 39980,
                discount: 0.0,
                stock: 20,
                sold: 0,
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
