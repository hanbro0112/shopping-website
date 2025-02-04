const crypto = require('crypto');
const redis = require('.');

class RedisSimpleLock {

    constructor(key, timeout = 30) {
        this.key = key;
        this.uuid = crypto.randomUUID(); // 唯一標識
        this.timeout = timeout; // seconds
    }

    async lock(tryLockTime = 3) {
        // 重試獲取鎖，失敗等待 500ms
        for (let i = 0; i < tryLockTime; i++) {
            const result = await redis.set(this.key, this.uuid, 'EX', this.timeout, 'NX');
            if (result === 'OK') {
                return true;
            }
            await new Promise((resolve) => {
                setTimeout(resolve, 500);
            });
        }

        return false;
    }

    async unlock() {
        // 超時釋放問題，lua 腳本保證原子性
        await redis.unLock(this.key, this.uuid);
    }

}

module.exports = RedisSimpleLock;
