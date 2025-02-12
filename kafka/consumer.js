/* eslint-disable no-constant-condition */
/* eslint-disable no-promise-executor-return */
/* eslint-disable no-console */
/* eslint-disable import/no-dynamic-require */
const { Kafka, logLevel } = require('kafkajs');
const crypto = require('crypto');

const {
    sequelize, Product, Order, OrderDetail, Cart,
} = require('../models');

const env = process.env.NODE_ENV || 'development';
const { brokers } = require(`${__dirname}/../config/config.js`)[env].kafka;

const kafka = new Kafka({
    logLevel: logLevel.ERROR,
    brokers,
    clientId: `order-consumer:${crypto.randomUUID()}`,
});

const topic = 'order';
const consumer = kafka.consumer({
    groupId: 'order-group',
    sessionTimeout: 30 * 1000, // 30s逾期，確保消費訊息時間小於30s
    heartbeatInterval: 3 * 1000, // 3s心跳
});

async function init() {
    // docker 開啟時，kafka 服務可能尚未啟動完成
    // 緩啟動 - 40s
    await new Promise((resolve) => {
        setTimeout(resolve, 40 * 1000);
    });
    try {
        await consumer.connect();
        console.log('Consumer connected');
        await consumer.subscribe({ topic, fromBeginning: true });
        console.log('Consumer subscribed');
    }
    catch (e) {
        console.error(`Consumer connect error: ${e.message}`, e);
    }
}
const run = async () => {
    await init();
    // 將訂單寫入資料庫
    await consumer.run({
        eachMessage: async ({ message }) => {
            const msg = JSON.parse(message.value.toString());
            const {
                userId, orderId, cartId, data, amount, state, note,
            } = msg;
            // 開啟事務
            const t = await sequelize.transaction();
            try {
                await Promise.all(data.map(async (item) => {
                    // 樂觀鎖 - 更新商品庫存
                    await Product.update({
                        stock: sequelize.literal(`stock - ${item.quantity}`),
                    }, {
                        where: {
                            id: item.productId,
                            stock: {
                                [sequelize.Op.gte]: item.quantity,
                            },
                        },
                        transaction: t,
                    }).then((p) => {
                        // [0|1]  [失敗|成功]
                        if (p[0] === 0) {
                            throw new Error('商品庫存不足');
                        }
                    });
                }));
                // 建立訂單
                await Order.create({
                    id: orderId,
                    userId,
                    amount,
                    state,
                    note,
                }, {
                    transaction: t,
                }).then((p) => {
                    // 訂單資訊
                    if (!p) {
                        throw new Error('建立訂單失敗');
                    }
                });

                // 建立訂單明細
                await OrderDetail.bulkCreate(data.map((item) => ({
                    orderId,
                    userId,
                    ...item,
                })), {
                    transaction: t,
                    validate: true,
                }).then((p) => {
                    // 訂單明細
                    if (!p) {
                        throw new Error('建立訂單明細失敗');
                    }
                });
                // // 刪除購物車
                // await Promise.all(cartId.map(async (id) => {
                //     await Cart.destroy({
                //         where: {
                //             id,
                //             userId,
                //         },
                //         transaction: t,
                //     });
                // })).catch(() => {
                //     throw new Error('刪除購物車失敗');
                // });
                // 提交事務
                await t.commit();
            }
            catch (error) {
            // 回滾事務
                await t.rollback();
                // TODO 寫入日誌 or 重新寫回消息對列
                console.error(`[order-consumer] ${error.message}`, error);
            }
        },
    });
};

run();
