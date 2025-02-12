const redis = require('../redis');
const RedisSimpleLock = require('../redis/redisSimpleLock');
const { CACHE_TIME, CACHE_NULL_TIME } = require('../setup');
const { Product } = require('../models');
const { toNumber } = require('../utils/check');


const LockPrefix = 'lock:product:';

// /**
//  * 查詢商品並寫入緩存 key-value
//  * @param {String | Integer} productId
//  * @returns product
//  */
// async function findProductById(productId) {
//     const nullObject = '{}';
//     const id = toNumber(productId);
//     const key = `product:${id}`;
//     // 1 先查緩存
//     let product = await redis.get(key);
//     if (product !== null) {
//         return product !== nullObject ? JSON.parse(product) : null;
//     }
//     // 2-1 嘗試獲取鎖
//     const redisSimpleLock = new RedisSimpleLock(LockPrefix + id);
//     const lock = await redisSimpleLock.lock();
//     // 2-2 再次查詢緩存
//     product = await redis.get(key);
//     if (product !== null) {
//         if (lock) {
//             await redisSimpleLock.unlock();
//         }

//         return product !== nullObject ? JSON.parse(product) : null;
//     }
//     // 3 無法獲取鎖
//     if (!lock) {
//         return null;
//     }
//     // 4 獲取鎖成功，查詢 db
//     product = await Product.findOne({
//         where: {
//             id,
//         },
//     });
//     if (product) {
//         // 4-1 緩存商品
//         await redis.set(key, JSON.stringify(product), 'EX', CACHE_TIME);
//     }
//     else {
//         // 4-2 無商品，緩存空值
//         await redis.set(key, nullObject, 'EX', CACHE_NULL_TIME);
//     }
//     // 5 釋放鎖
//     await redisSimpleLock.unlock();

//     return product;
// }


/**
 * 查詢商品並寫入緩存 hash table
 * @param {String | Integer} productId
 * @returns product
 */
async function findProductById(productId) {
    const nullObject = '';
    const id = toNumber(productId);
    const key = `product:${id}`;
    // 1 先查緩存
    let product = await redis.hgetall(key);
    if (Object.keys(product).length !== 0) {
        return product.id !== nullObject ? product : null;
    }
    // 2-1 嘗試獲取鎖
    const redisSimpleLock = new RedisSimpleLock(LockPrefix + id);
    const lock = await redisSimpleLock.lock();
    // 2-2 再次查詢緩存
    product = await redis.hgetall(key);
    if (Object.keys(product).length !== 0) {
        if (lock) {
            await redisSimpleLock.unlock();
        }

        return product.id !== nullObject ? product : null;
    }
    // 3 無法獲取鎖
    if (!lock) {
        return null;
    }
    // 4 獲取鎖成功，查詢 db
    product = await Product.findOne({
        where: {
            id,
        },
    });
    // 4-1 緩存商品，若商品為空，緩存空值
    const cacheTime = product ? CACHE_TIME : CACHE_NULL_TIME;
    if (!product) {
        product = { id: '' };
    }
    else {
        product = {
            id: product.id,
            name: product.name,
            picture_url: product.picture_url,
            price: product.price,
            discount: product.discount,
            stock: product.stock,
            sold: product.sold,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
        };
    }
    // hmset 需兩條指令設置過期時間
    await redis.pipeline().hmset(key, product).expire(key, cacheTime).exec();
    // 5 釋放鎖
    await redisSimpleLock.unlock();

    return product.id !== nullObject ? product : null;
}

module.exports = {
    findProductById,
};
