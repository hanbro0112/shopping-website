/**
 * 轉換成數字，預設 0
 * @param {*} value
 * @param {*} defaultValue
 */
module.exports.toNumber = function (value, defaultValue = 0) {
    // parseInt 轉換開頭為數字的字串，遇到非數字就停止
    // 如果開頭就不是數字，回傳 NaN
    return parseInt(value, 10) || defaultValue;
};
