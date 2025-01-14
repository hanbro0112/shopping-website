require('dotenv').config();

const { jwtToken, refreshToken } = require('./config');

module.exports.routers = function (router) {
    /* 登出 */
    router.get('/logout', (req, res) => {
        res.clearCookie(jwtToken);
        res.clearCookie(refreshToken);
        res.redirect('/');
    });
};
