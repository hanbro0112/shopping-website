/* eslint-disable no-param-reassign */
require('dotenv').config();

const { Cart } = require('../../models');
const { findProductById } = require('../utils');

module.exports.routers = function (router) {
    // 購物車頁面
    router.get('/cart', cartPage);
};

/**
 * ejs 固定參數
 */
class CartReply {

    constructor(obj) {
        this.cart = [];
        obj.forEach((item) => {
            this.cart.push({
                cartId: item.cartId || '',
                productId: item.productId || '',
                name: item.name || '',
                picture_url: item.picture_url || '',
                price: item.price || '',
                discount: item.discount || '',
                quantity: item.quantity || 1,
                state: item.state || '',
            });
        });
        this.msg = obj.msg || '';
    }

}

async function cartPage(req, res) {
    // 1. 未登入
    if (!res.locals.isLogin) {
        res.redirect('/accounts/login?redirect_url=/shopping/cart');

        return;
    }
    const accountId = res.locals.accountId;
    const cart = await Cart.findAll({
        where: {
            userId: accountId,
        },
    });
    // 設定 cookie
    res.cookie(
        'cartNumber',
        cart.length,
        { httpOnly: true },
    );
    const cartArray = [];
    for (let i = 0; i < cart.length; i++) {
        // 查詢商品
        const product = await findProductById(cart[i].productId);
        // 商品已刪除
        if (!product) {
            continue;
        }
        const item = {
            cartId: cart[i].id,
            productId: product.id,
            name: product.name,
            picture_url: `/${product.picture_url}`,
            price: product.price,
            discount: product.discount,
        };
        item.quantity = Math.min(product.stock, cart[i].quantity);
        if (product.stock === 0) {
            item.state = '無庫存';
        }
        else if (cart[i].amomunt >= product.stock) {
            item.state = '已達購買上限';
        }
        cartArray.push(item);
    }
    res.render('shopping/cart', new CartReply(cartArray));
}
