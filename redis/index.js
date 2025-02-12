/* eslint-disable import/no-dynamic-require */
const redis = require('ioredis');
const fs = require('fs');

const env = process.env.NODE_ENV || 'development';
const { host, port } = require(`${__dirname}/../config/config.js`)[env].redis;

const client = redis.createClient(port, host);

client.on('error', (err) => {
    console.log(err);
});

// 超時釋放問題，lua 腳本保證原子性
client.defineCommand('unLock', {
    numberOfKeys: 1,
    lua: fs.readFileSync(`${__dirname}/unlock.lua`, 'utf8'),
});

// 查詢後更新庫存
client.defineCommand('updateStock', {
    numberOfKeys: 1,
    lua: fs.readFileSync(`${__dirname}/updateStock.lua`, 'utf8'),
});

module.exports = client;
