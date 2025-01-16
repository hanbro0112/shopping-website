/* eslint-disable no-param-reassign */
require('dotenv').config();

const { CART_LIMIT } = require('../../setup');
const { toNumber } = require('../../utils/check');
const { Product, Cart } = require('../../models');

module.exports.routers = function (router) {
    // 頁面
    router.get('/:id', productPage);
    // 加入購物車
    router.post('/', productAddToCart);
};

/**
 * ejs 固定參數
 */
class ProductReply {

    constructor(obj) {
        this.productId = obj.productId || '';
        this.name = obj.name || '';
        this.picture_url = obj.picture_url || '';
        this.price = obj.price || '';
        this.discount = obj.discount || '';
        this.stock = obj.stock || 0;
        this.sold = obj.sold || 0;
        this.quantity = obj.quantity || 1; // 重定向回復原本的數量
        this.msg = obj.msg || '';
    }

}

async function productPage(req, res) {
    // 查詢商品
    const product = await Product.findOne({
        where: {
            id: toNumber(req.params.id),
        },
    });
    if (!product) {
        res.render('alert', { msg: '找不到商品' });

        return;
    }

    res.render('products/product', new ProductReply({
        productId: product.id,
        name: product.name,
        picture_url: `/${product.picture_url}`,
        price: product.price,
        discount: product.discount,
        stock: product.stock,
        sold: product.sold,
        msg: '',
        quantity: toNumber(req.query.quantity, 1), // 重定向回復原本的數量
    }));
}

async function productAddToCart(req, res) {
    const productId = toNumber(req.body['add-to-cart'], -1);
    const quantity = toNumber(req.body.quantity, 1);
    // 1. 未登入
    if (!res.locals.isLogin) {
        res.redirect(`/accounts/login?redirect_url=/products/${productId}&quantity=${toNumber(req.body.quantity)}`);

        return;
    }
    // 2. 商品不存在
    const product = await Product.findOne({
        where: {
            id: productId,
        },
    });
    if (!product) {
        res.render('alert', { msg: '找不到商品' });

        return;
    }

    // 3. 加入購物車
    const cart = await Cart.findAll({
        where: {
            userId: res.locals.accountId,
        },
    });
    // 3-1 已存在購物車，修改商品數量
    let isExist = false;
    cart.forEach((item) => {
        if (item.productId === productId) {
            isExist = true;
            if (item.quantity !== quantity) {
                item.quantity = quantity;
                item.save();
            }
        }
    });
    // 3-2 購物車已滿
    if (!isExist && cart.length === CART_LIMIT) {
        res.cookie(
            'cartNumber',
            CART_LIMIT,
            { httpOnly: true },
        );

        res.render('products/product', new ProductReply({
            productId: product.id,
            name: product.name,
            picture_url: `/${product.picture_url}`,
            price: product.price,
            discount: product.discount,
            stock: product.stock,
            sold: product.sold,
            msg: '購物車已滿',
            quantity, // 重定向回復原本的數量
        }));

        return;
    }
    // 3-3 新增至購物車
    if (!isExist) {
        await Cart.create({
            userId: res.locals.accountId,
            productId,
            quantity,
        });
    }

    res.cookie(
        'cartNumber',
        cart.length + !isExist,
        { httpOnly: true },
    );

    res.render('products/product', new ProductReply({
        productId: product.id,
        name: product.name,
        picture_url: `/${product.picture_url}`,
        price: product.price,
        discount: product.discount,
        stock: product.stock,
        sold: product.sold,
        msg: '已新增至購物車',
        quantity, // 重定向回復原本的數量
    }));
}
