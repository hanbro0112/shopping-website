/* eslint-disable max-classes-per-file */
/* eslint-disable no-param-reassign */
require('dotenv').config();

const crypto = require('crypto');
const { toNumber } = require('../../utils/check');
const {
    Product, Cart, Order, OrderDetail,
} = require('../../models');
const { orderState } = require('./config');

const {
    MerchantID,
    HASHKEY,
    HASHIV,
    Version,
    PayGateWay,
    NotifyUrl,
    ReturnUrl,
} = process.env;
const RespondType = 'JSON';

class CheckoutReply {

    constructor(obj) {
        this.name = obj.name || '';
        this.address = obj.address || '';
        this.order = obj.order || [];
        this.amount = obj.amount || 0;
        this.msg = obj.msg || '';
    }

}

class OrderItem {

    constructor(obj) {
        this.cartId = obj.cartId || 0;
        this.name = obj.name || '';
        this.quantity = obj.quantity || 0;
        this.amount = obj.amount || 0;
    }

}

module.exports.routers = function (router) {
    // 訂單確認頁面
    router.post('/checkout', async (req, res) => {
        // 1. 未登入
        if (!res.locals.isLogin) {
            res.redirect('/accounts/login?rediret_url=/shopping/cart');

            return;
        }
        let cartId = req.body.cartId;
        if (!cartId) {
            res.render('alert', { msg: '購物車為空' });

            return;
        }
        // 只勾取一項
        if (typeof cartId !== 'object') {
            cartId = [cartId];
        }

        const order = [];
        let totalAmount = 0;
        for (let i = 0; i < cartId.length; i++) {
            const item = await Cart.findOne({
                where: {
                    id: cartId[i],
                    userId: res.locals.accountId,
                },
            });
            // 購物車已刪除 / 防呆
            if (!item) continue;

            const product = await Product.findOne({
                where: {
                    id: item.productId,
                },
            });
            // 商品已刪除
            if (!product) continue;
            // 商品庫存不足
            if (product.stock === 0) continue;
            /**
                鎖定商品庫存
            */
            // 購買數量 <= 商品庫存
            const quantity = Math.min(item.quantity, product.stock);
            const amount = product.discount > 0
                ? (product.price * product.discount) * quantity
                : product.price * quantity;

            totalAmount += amount;
            order.push(new OrderItem({
                cartId: item.id,
                name: product.name,
                quantity,
                amount,
            }));
        }

        if (order.length === 0) {
            res.render('alert', { msg: '商品已無庫存!' });

            return;
        }
        res.render('shopping/checkout', new CheckoutReply({
            name: res.locals.accountId,
            address: 'test@gmail.com',
            order,
            amount: totalAmount,
        }));
    });

    router.post('/confirm', async (req, res) => {
        // 1. 未登入
        if (!res.locals.isLogin) {
            res.redirect('/accounts/login?rediret_url=/shopping/cart');

            return;
        }
        let { cartId, quantity } = req.body;
        if (!cartId || !quantity) {
            res.render('alert', { msg: '資料有誤' });

            return;
        }
        // 只勾取一項
        if (typeof cartId !== 'object') cartId = [cartId];
        if (typeof quantity !== 'object') quantity = [quantity];
        // 資料不一致
        if (cartId.length !== quantity.length) {
            res.render('alert', { msg: '資料有誤' });

            return;
        }
        // 檢查訂單資料
        const data = [];
        let invaildMsg = '';
        let totalAmount = 0;
        for (let i = 0; i < cartId.length; i++) {
            const item = await Cart.findOne({
                where: {
                    id: cartId[i],
                    userId: res.locals.accountId,
                },
            });
            if (!item) {
                invaildMsg = '購物車已刪除';
                break;
            }

            const product = await Product.findOne({
                where: {
                    id: item.productId,
                },
            });
            if (!product) {
                invaildMsg = '商品已刪除';
                break;
            }
            if (product.stock < quantity[i]) {
                invaildMsg = '商品庫存不足';
                break;
            }

            const amount = product.discount > 0
                ? (product.price * product.discount) * quantity[i]
                : product.price * quantity[i];

            totalAmount += amount;
            data.push({
                productId: product.id,
                name: product.name,
                discount: product.discount,
                amount,
                quantity: quantity[i],
            });
        }
        if (totalAmount !== toNumber(req.body.amount)) {
            invaildMsg = '訂單金額不正確';
        }
        if (invaildMsg) {
            res.render('alert', { msg: invaildMsg });

            return;
        }
        // 建立訂單
        const orderId = crypto.randomUUID().slice(30); // 最大 30 字
        const userId = res.locals.accountId;
        await Order.create({
            id: orderId,
            userId,
            amount: totalAmount,
            state: orderState.unpaid,
            note: req.body.notes,
        });
        await Promise.all(data.map(async (item) => {
            OrderDetail.create({
                orderId,
                userId,
                ...item,
            });
        }));

        // 串接金流
        const order = {
            ItemDesc: '測試',
            TimeStamp: Math.round(new Date().getTime() / 1000),
            Amt: totalAmount,
            MerchantOrderNo: orderId,
            Email: 'xx2468xx@gmail.com',
        };

        // 進行訂單加密
        // 加密第一段字串，此段主要是提供交易內容給予藍新金流
        const aesEncrypt = createSesEncrypt(order);

        // 使用 HASH 再次 SHA 加密字串，作為驗證使用
        const shaEncrypt = createShaEncrypt(aesEncrypt);
        order.aesEncrypt = aesEncrypt;
        order.shaEncrypt = shaEncrypt;

        res.render('shopping/payment', {
            PayGateWay,
            Version,
            order,
            MerchantID,
            NotifyUrl,
            ReturnUrl,
            msg: '',
        });
    });


    // 交易成功：Return （可直接解密，將資料呈現在畫面上）
    router.post('/newebpay_return', async (req, res) => {
        /**
         * Status: 'SUCCESS',
         * MerchantID: 'MS154830320',
         * Version: '2.0',
         * TradeInfo: '**加密字串**',
         * TradeSha: '**加密字串**
         */
        const response = req.body;
        // 交易失敗
        if (response.Status !== 'SUCCESS') {
            res.render('alert', { msg: `交易失敗，狀態碼: ${response.Status}` });

            return;
        }
        // 解密交易內容
        const data = createSesDecrypt(response.TradeInfo);
        const orderId = data.Result.MerchantOrderNo;
        const order = await Order.findOne({
            where: {
                id: orderId,
            },
        });
        // 無此訂單 (防呆)
        if (!order) {
            res.render('alert', { msg: '找不到訂單' });

            return;
        }
        // 交易成功，更新訂單狀態
        await order.update({
            state: orderState.paid,
        });

        res.redirect('shopping/order');
    });

    // 確認交易：Notify
    router.post('/newebpay_notify', (req, res) => {
        console.log('req.body notify data', req.body);
        const response = req.body;

        // 解密交易內容
        const data = createSesDecrypt(response.TradeInfo);
        console.log('data:', data);

        // // 取得交易內容，並查詢本地端資料庫是否有相符的訂單
        // console.log(orders[data?.Result?.MerchantOrderNo]);
        // if (!orders[data?.Result?.MerchantOrderNo]) {
        //     console.log('找不到訂單');

        //     return res.end();
        // }
        // // 交易完成，將成功資訊儲存於資料庫
        // console.log('付款完成，訂單：', orders[data?.Result?.MerchantOrderNo]);

        return res.end();
    });
};

// 字串組合
function genDataChain(order) {
    return `MerchantID=${MerchantID}&TimeStamp=${
        order.TimeStamp
    }&Version=${Version}&RespondType=${RespondType}&MerchantOrderNo=${
        order.MerchantOrderNo
    }&Amt=${order.Amt}&NotifyURL=${encodeURIComponent(
        NotifyUrl,
    )}&ReturnURL=${encodeURIComponent(ReturnUrl)}&ItemDesc=${encodeURIComponent(
        order.ItemDesc,
    )}&Email=${encodeURIComponent(order.Email)}`;
}
// 對應文件 P17
// MerchantID=MS12345678&TimeStamp=1663040304&Version=2.0&RespondType=Stri
// ng&MerchantOrderNo=Vanespl_ec_1663040304&Amt=30&NotifyURL=https%3A%2F%2
// Fwebhook.site%2Fd4db5ad1-2278-466a-9d66-
// 78585c0dbadb&ReturnURL=&ItemDesc=test


// 對應文件 P17：使用 aes 加密
// $edata1=bin2hex(openssl_encrypt($data1, "AES-256-CBC", $key, OPENSSL_RAW_DATA, $iv));
function createSesEncrypt(TradeInfo) {
    const encrypt = crypto.createCipheriv('aes-256-cbc', HASHKEY, HASHIV);
    const enc = encrypt.update(genDataChain(TradeInfo), 'utf8', 'hex');

    return enc + encrypt.final('hex');
}

// 對應文件 P18：使用 sha256 加密
// $hashs="HashKey=".$key."&".$edata1."&HashIV=".$iv;
function createShaEncrypt(aesEncrypt) {
    const sha = crypto.createHash('sha256');
    const plainText = `HashKey=${HASHKEY}&${aesEncrypt}&HashIV=${HASHIV}`;

    return sha.update(plainText).digest('hex').toUpperCase();
}

// 對應文件 21, 22 頁：將 aes 解密
function createSesDecrypt(TradeInfo) {
    const decrypt = crypto.createDecipheriv('aes256', HASHKEY, HASHIV);
    decrypt.setAutoPadding(false);
    const text = decrypt.update(TradeInfo, 'hex', 'utf8');
    const plainText = text + decrypt.final('utf8');
    // eslint-disable-next-line no-control-regex
    const result = plainText.replace(/[\x00-\x20]+/g, '');

    return JSON.parse(result);
}
