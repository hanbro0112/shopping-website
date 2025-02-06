module.exports = {
    development: {
        mysql: {
            username: 'root',
            password: 'root',
            database: 'db',
            host: '172.18.1.2',
            port: '3306',
            dialect: 'mysql',
            timezone: '+08:00',
        },
        redis: {
            host: '172.18.1.3',
            post: '6379',
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
    },
};

