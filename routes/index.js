const express = require('express');

const router = express.Router();

const { findProductById } = require('./utils');

/* GET home page. */
router.get('/', async (req, res) => {
    // 顯示前 9 個商品
    const products = [];
    for (let i = 1; i < 10; i++) {
        const product = await findProductById(i);
        products.push(product);
    }

    res.render('index', {
        products,
        msg: '',
    });
});

module.exports = router;
