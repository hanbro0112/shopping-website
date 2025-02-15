const express = require('express');

const router = express.Router();

const loginRouter = require('./login');
const registerRouter = require('./register');
const authRouter = require('./auth');

loginRouter.routers(router);
registerRouter.routers(router);
authRouter.routers(router);

module.exports = router;
