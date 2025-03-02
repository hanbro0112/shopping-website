/* eslint-disable max-classes-per-file */
/* eslint-disable no-param-reassign */
require('dotenv').config();

const crypto = require('crypto');
const { Order } = require('../../models');
const { orderState } = require('../shopping/config');

const {
    HASHKEY,
    HASHIV,
} = process.env;


module.exports.routers = function (router) {
    // 交易成功
    router.post('/newebpay_return', newebpayReturn);
    // 確認交易
    router.post('/newebpay_notify', newebpayNotify);
};

async function newebpayReturn(req, res) {
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
    res.redirect('order');
}

/** TODO: 上雲後記錄到 ELK */
function newebpayNotify(req, res) {
    // const response = req.body;

    // // 解密交易內容
    // const data = createSesDecrypt(response.TradeInfo);

    // // 取得交易內容，並查詢本地端資料庫是否有相符的訂單
    // console.log(orders[data?.Result?.MerchantOrderNo]);
    // if (!orders[data?.Result?.MerchantOrderNo]) {
    //     console.log('找不到訂單');

    //     return res.end();
    // }
    // // 交易完成，將成功資訊儲存於資料庫
    // console.log('付款完成，訂單：', orders[data?.Result?.MerchantOrderNo]);

    return res.end();
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
