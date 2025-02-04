const redis = require('ioredis');
const fs = require('fs');

const { host, port } = require('../config/config').redis;

const client = redis.createClient(port, host);

client.on('error', (err) => {
    console.log(err);
});

// 超時釋放問題，lua 腳本保證原子性
client.defineCommand('unLock', {
    numberOfKeys: 1,
    lua: fs.readFileSync(`${__dirname}/unlock.lua`, 'utf8'),
});

module.exports = client;
