/* eslint-disable no-console */
/* eslint-disable import/no-dynamic-require */
const { Kafka, CompressionTypes, logLevel } = require('kafkajs');

const env = process.env.NODE_ENV || 'development';
const { brokers } = require(`${__dirname}/../config/config.js`)[env].kafka;

const kafka = new Kafka({
    logLevel: logLevel.ERROR,
    brokers,
    clientId: 'order-producer',
});

const topic = 'order';
const producer = kafka.producer();

async function init() {
    // docker 開啟時，kafka 服務可能尚未啟動完成
    // 緩啟動 - 30s
    await new Promise((resolve) => {
        setTimeout(resolve, 30 * 1000);
    });
    console.log('start');
    const admin = kafka.admin();
    try {
        await admin.connect();
        console.log('Admin connected');
        const topics = await admin.listTopics();
        console.log('Existing topics:', topics);
        if (!topics.includes(topic)) {
            console.log('Creating topic:', topic);
            await admin.createTopics({
                topics: [{
                    topic,
                    numPartitions: 1,
                    replicationFactor: 1,
                }],
            });
            console.log('Topic created');
        }
    }
    catch (e) {
        console.error(`Error during topic creation: ${e.message}`, e);
    }
    finally {
        await admin.disconnect();
        console.log('Admin disconnected');
    }
    try {
        await producer.connect();
        console.log('Producer connected');
    }
    catch (e) {
        console.error(`Producer connect error: ${e.message}`, e);
    }
}

async function sendMessage(msg) {
    await producer.send({
        topic,
        compression: CompressionTypes.GZIP,
        messages: [
            { value: JSON.stringify(msg) },
        ],
    }).catch(
        e => console.error(`[producer] ${e.message}`, e),
    );
}

init().catch(e => console.error(`[init] ${e.message}`, e));

module.exports = {
    sendMessage,
};

