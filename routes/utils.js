const redis = require('../redis');
const RedisSimpleLock = require('../redis/redisSimpleLock');
const { CACHE_TIME, CACHE_NULL_TIME } = require('../setup');
const { Product } = require('../models');
const { toNumber } = require('../utils/check');

const NullObject = '{}';
const LockPrefix = 'lock:product:';

/**
 * 查詢商品並寫入緩存
 * @param {String | Integer} productId
 * @returns product
 */
async function findProductById(productId) {
    let product;
    const id = toNumber(productId);
    const key = `product:${id}`;
    // 1 先查緩存
    let cache = await redis.get(key);
    if (cache !== null) {
        return cache !== NullObject ? JSON.parse(cache) : null;
    }

    // 2-1 嘗試獲取鎖
    const redisSimpleLock = new RedisSimpleLock(LockPrefix + id);
    const lock = await redisSimpleLock.lock();
    // 2-2 無法獲取鎖，返回空值
    if (!lock) {
        return null;
    }
    // 3 獲取鎖成功，再次查詢緩存
    cache = await redis.get(key);
    if (cache !== null) {
        product = cache !== NullObject ? JSON.parse(cache) : null;
    }
    else {
        // 3-1 查詢 db
        product = await Product.findOne({
            where: {
                id,
            },
        });
        if (product) {
            // 3-2 緩存商品
            await redis.set(key, JSON.stringify(product), 'EX', CACHE_TIME);
        }
        else {
            // 3-3 無商品，緩存空值
            await redis.set(key, NullObject, 'EX', CACHE_NULL_TIME);
        }
    }
    // 4 釋放鎖
    await redisSimpleLock.unlock();

    return product;
}

// /**
//  * 更新商品庫存
//  * @param {String | Integer} productId 商品 id
//  * @param {Integer} quantity 商品數量
//  * @param {Object} t sequelize transaction
//  * @returns {String}
//  */
// async function updateProductStock(productId, quantity, t) {
//     const id = toNumber(productId);
//     const key = `product:${id}`;
//     const redisSimpleLock = new RedisSimpleLock(LockPrefix + id);
//     // 1 嘗試獲取鎖
//     const lock = await redisSimpleLock.lock(6);
//     // 2 無法獲取鎖，返回失敗
//     if (!lock) {
//         return '獲取商品失敗';
//     }
//     // 3 更新庫存
//     const isUpdate = await Product.update({
//         stock: sequelize.literal(`stock - ${quantity}`),
//     }, {
//         where: {
//             id,
//             stock: {
//                 [sequelize.Op.gt]: quantity,
//             },
//         },
//         transaction: t,
//     });
//     // 4 更新成功，刪除緩存
//     if (isUpdate) {
//         redis.del(key);
//     }
//     // 5 釋放鎖
//     await redisSimpleLock.unlock();

//     return isUpdate ? 'OK' : '庫存不足';
// }


module.exports = {
    findProductById,
    // updateProductStock,
};
