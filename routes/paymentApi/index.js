const express = require('express');

const router = express.Router();

const notifyRouter = require('./notify');

notifyRouter.routers(router);

module.exports = router;
