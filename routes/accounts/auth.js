require('dotenv').config();

const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { jwtToken, refreshToken } = require('./config');
const { Account } = require('../../models');

const { GOOGLE_CLIENT_ID, GOOGLE_SECRET_KEY } = process.env;

const GOOGLE_REDIRECT_URI = 'http://localhost:80/accounts/auth/google/callback';
const client = new OAuth2Client({
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_SECRET_KEY,
    redirectUri: GOOGLE_REDIRECT_URI,
});

module.exports.routers = function (router) {
    /* GOOGLE 第三方登入 */
    router.get('/auth/google', auth);
    /* GOOGLE 第三方登入 callback */
    router.get('/auth/google/callback', authCallback);
};

function auth(req, res) {
    // 已登入
    if (res.locals.isLogin) {
        res.redirect('/');

        return;
    }

    // 產生 GOOGLE 授權 URL
    const authorizeUrl = client.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email',
        ],
    });

    res.redirect(authorizeUrl);
}

async function authCallback(req, res) {
    // 已登入
    if (res.locals.isLogin) {
        res.redirect('/');

        return;
    }
    const { code } = req.query;

    try {
        // 用授權碼換取 token
        const { tokens } = await client.getToken(code);
        client.setCredentials(tokens);

        // 透過 GOOGLE API 取得用戶資訊
        const userInfo = await client.request({
            url: 'https://www.googleapis.com/oauth2/v3/userinfo',
        });

        // 讀取資料庫
        let account = await Account.findOne({
            where: {
                google_email: userInfo.data.email,
            },
        });
        // 第一次登入，創建帳戶
        if (!account) {
            account = await Account.create({
                id: crypto.randomUUID(),
                google_email: userInfo.data.email,
            });
        }
        // 登入成功，回傳 jwt token 和 refresh token
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
    }
    catch (error) {
        res.redirect('accounts/login');
    }
    res.redirect('/');
}
