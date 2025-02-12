require('dotenv').config();

const jwt = require('jsonwebtoken');
const { toNumber } = require('../utils/check');
const { jwtToken, refreshToken } = require('../routes/accounts/config');

// 刷新 jwt token
function loginMiddleware(req, res, next) {
    // 初始化登入資訊
    res.locals.isLogin = false;
    res.locals.accountId = '';
    res.locals.cartNumber = toNumber(req.cookies.cartNumber, '');
    // 已登入
    if (req.cookies.refreshToken) {
        try {
            const { id } = jwt.verify(req.cookies.refreshToken, process.env.JWT_REFRESH_SECRET_KEY);
            res.cookie(
                jwtToken,
                jwt.sign(
                    { id },
                    process.env.JWT_ACCESS_SECRET_KEY,
                    {
                        expiresIn: Date.now() + 10 * 60 * 1000, // ten minutes
                    },
                ),
                {
                    maxAge: 10 * 60 * 1000, // ten minutes
                    httpOnly: true,
                },
            );
            res.cookie(
                refreshToken,
                jwt.sign(
                    { id },
                    process.env.JWT_REFRESH_SECRET_KEY,
                    {
                        expiresIn: Date.now() + 30 * 24 * 60 * 60 * 1000, // one month
                    },
                ),
                {
                    maxAge: 30 * 24 * 60 * 60 * 1000, // one month
                    httpOnly: true,
                },
            );
            // 傳遞登入資訊
            res.locals.isLogin = true;
            res.locals.accountId = id;
        }
        catch (err) {
            /**
             *  err = {
             *  name: 'TokenExpiredError',
             *  message: 'jwt 過期',
             * }
            */
            console.log(err);
        }
    }
    next();
}

// 測試用
let seeRefreshToken = false;

function test(req, res, next) {
    // 初始化登入資訊
    res.locals.isLogin = false;
    res.locals.accountId = '';
    res.locals.cartNumber = toNumber(req.cookies.cartNumber, '');
    // 已登入
    if (req.cookies.refreshToken) {
        try {
            const { id } = jwt.verify(req.cookies.refreshToken, process.env.JWT_REFRESH_SECRET_KEY);
            if (!seeRefreshToken) {
                seeRefreshToken = true;
                console.log(req.cookies.refreshToken);
            }
            // 傳遞登入資訊
            res.locals.isLogin = true;
            res.locals.accountId = id;
        }
        catch (err) {
            /**
             *  err = {
             *  name: 'TokenExpiredError',
             *  message: 'jwt 過期',
             * }
            */
            console.log(err);
        }
    }
    next();
}

module.exports = test;
