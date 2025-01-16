require('dotenv').config();

const jwt = require('jsonwebtoken');
const { createHash } = require('crypto');
const { jwtToken, refreshToken } = require('./config');
const { Account } = require('../../models');

const hash = (s) => createHash('sha256').update(s).digest('base64');

module.exports.routers = function (router) {
    /* 頁面 */
    router.get('/login', loginPage);
    /* 登入 */
    router.post('/login', loginPost);
    /* 登出 */
    router.get('/logout', logout);
};

/**
 * ejs 固定參數
 */
class LoginReply {

    constructor(obj) {
        this.msg = obj.msg || '';
        this.redirectInfo = obj.redirectInfo || '';
    }

}

function loginPage(req, res) {
    // 已登入
    if (res.locals.isLogin) {
        res.redirect('/');

        return;
    }
    // 重定向資訊 "login?redirect_url=/products/1&quantity=1"
    const redirectInfo = req.url.slice(req.url.indexOf('?') + 1);
    res.render('accounts/login', new LoginReply({ redirectInfo }));
}

async function loginPost(req, res) {
    // 已登入
    if (res.locals.isLogin) {
        res.redirect('/');

        return;
    }
    // 重定向資訊
    const redirectInfo = req.body['redirect-info'];

    const { username, password } = req.body;
    if (!username || !password || username.length === 0 || password.length === 0 || username.includes(' ')) {
        res.render('accounts/login', new LoginReply({
            msg: '帳號密碼格式錯誤',
            redirectInfo,
        }));

        return;
    }
    // 讀取資料庫
    const account = await Account.findOne({
        where: {
            username,
        },
    });
    // 登入失敗
    if (!account || account.password !== hash(password)) {
        res.render('accounts/login', new LoginReply({
            msg: '帳號密碼錯誤',
            redirectInfo,
        }));

        return;
    }
    // 登入成功，設定 jwt token 和 refresh token
    res.cookie(
        jwtToken,
        jwt.sign(
            { id: account.id },
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
            { id: account.id },
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

    // 登入成功，重導向
    // redirectInfo = "redirect_url=/products/1&quantity=1"
    if (redirectInfo && redirectInfo.startsWith('redirect_url=')) {
        const params = redirectInfo.split('&');
        res.redirect(`${params[0].slice(params[0].indexOf('=') + 1)}?${params.slice(1).join('&')}`);
    }
    else {
        res.redirect('/');
    }
}

function logout(req, res) {
    // 清除登入資訊
    res.clearCookie(jwtToken);
    res.clearCookie(refreshToken);
    res.redirect('/');
}
