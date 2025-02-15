const express = require('express');

const router = express.Router();

const productRouter = require('./product');

productRouter.routers(router);

module.exports = router;
