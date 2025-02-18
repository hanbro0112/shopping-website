require('dotenv').config();

module.exports = {
    development: {
        mysql: {
            username: 'root',
            password: process.env.RDS_PASSWORD || 'root',
            database: 'db',
            host: process.env.RDS_HOST || '172.18.1.2',
            port: '3306',
            dialect: 'mysql',
            timezone: '+08:00',
        },
        redis: {
            host: '172.18.1.3',
            post: '6379',
        },
        kafka: {
            brokers: ['172.18.1.7:9092'],
        },
    },
    test: {
        mysql: {
            username: 'root',
            password: 'root',
            database: 'db',
            host: '127.0.0.1',
            port: '3306',
            dialect: 'mysql',
            timezone: '+08:00',
        },
        redis: {
            host: '127.0.0.1',
            post: '6379',
        },
        kafka: {
            brokers: ['127.0.0.1:9092'],
        },
    },
};

