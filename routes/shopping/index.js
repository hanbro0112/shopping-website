const express = require('express');

const router = express.Router();

const cartRouter = require('./cart');
const checkoutRouter = require('./checkout');
const orderRouter = require('./order');

cartRouter.routers(router);
orderRouter.routers(router);
checkoutRouter.routers(router);

module.exports = router;
