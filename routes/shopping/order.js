/* eslint-disable no-param-reassign */
require('dotenv').config();

const { orderState } = require('./config');
const { Order, OrderDetail } = require('../../models');

class OrderReply {

    constructor(obj) {
        this.orders = [];
        obj.orders.forEach((item) => {
            this.orders.push({
                id: item.id || '',
                time: item.time || '',
                amount: item.amount || '',
                state: item.state || '',
                note: item.note || '',
                details: item.details || [],
            });
        });
        this.msg = obj.msg || '';
    }

}

module.exports.routers = function (router) {
    // 訂單頁面
    router.get('/order', async (req, res) => {
        // 1. 未登入
        if (!res.locals.isLogin) {
            res.redirect('/accounts/login?redirect_url=/shopping/order');

            return;
        }
        const accountId = res.locals.accountId;
        const orders = await Order.findAll({
            where: {
                userId: accountId,
            },
        });

        const arr = [];
        const orderDetails = await OrderDetail.findAll({
            where: {
                userId: accountId,
            },
        });
        const map = {};
        orderDetails.forEach((orderDetail) => {
            if (!map[orderDetail.orderId]) {
                map[orderDetail.orderId] = [];
            }
            map[orderDetail.orderId].push({
                productId: orderDetail.productId,
                name: orderDetail.name,
                amount: orderDetail.amount,
                quantity: orderDetail.quantity,
            });
        });

        orders.forEach((order) => {
            const time = new Date(order.createdAt);
            arr.push({
                id: order.id,
                amount: order.amount,
                state: order.state === orderState.paid ? '已付款' : '未付款',
                note: order.note,
                time: `${time.getFullYear()}    ${time.getMonth() + 1}/${time.getDate()}   ${time.getHours()}:${time.getMinutes()}`,
                details: map[order.id],
            });
        });
        // 新訂單顯示在前
        arr.sort((a, b) => (a.time > b.time ? -1 : 1));
        res.render('shopping/order', new OrderReply({
            orders: arr,
        }));
    });
};
