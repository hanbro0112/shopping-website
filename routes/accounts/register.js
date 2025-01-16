require('dotenv').config();

const { createHash } = require('crypto');
const { Account } = require('../../models');

const hash = (password) => createHash('sha256').update(password).digest('base64');


module.exports.routers = function (router) {
    /* 入頁面 */
    router.get('/register', registerPage);
    /* 註冊 */
    router.post('/register', registerPost);
};

/**
 * ejs 固定參數
 */
class RegisterReply {

    constructor(obj) {
        this.msg = obj.msg || '';
        this.redirectInfo = obj.redirectInfo || '';
    }

}

function registerPage(req, res) {
    // 已登入
    if (res.locals.isLogin) {
        res.redirect('/');

        return;
    }
    // 重定向資訊 "...?redirect_url=/products/1&quantity=1"
    const redirectInfo = req.url.slice(req.url.indexOf('?') + 1);
    res.render('accounts/register', new RegisterReply({ redirectInfo }));
}

async function registerPost(req, res) {
    // 已登入
    if (res.locals.isLogin) {
        res.redirect('/');

        return;
    }
    // 重定向資訊
    const redirectInfo = req.body['redirect-info'];

    // 基本驗證
    const { username, password, repeatPassword } = req.body;
    if (!username || !password || username.length === 0 || password.length === 0 || username.includes(' ')) {
        res.render('accounts/register', new RegisterReply({
            msg: '帳號密碼格式錯誤',
            redirectInfo,
        }));

        return;
    }
    // 重複密碼確認
    if (password !== repeatPassword) {
        res.render('accounts/register', new RegisterReply({
            msg: '密碼輸入錯誤',
            redirectInfo,
        }));

        return;
    }

    // 寫入資料庫
    const accountId = crypto.randomUUID();
    Account.create({
        id: accountId,
        username,
        password: hash(password),
    }).then(() => {
        res.render('accounts/login', new RegisterReply({
            msg: '註冊成功，請重新登入',
            redirectInfo,
        }));
    }).catch(() => {
        // 重複註冊
        res.render('accounts/register', new RegisterReply({
            msg: '已存在相同用戶名',
            redirectInfo,
        }));
    });
}
