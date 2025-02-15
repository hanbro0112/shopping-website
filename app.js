const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const logger = require('morgan');

const logginMiddleware = require('./middlewares/loginMiddleware');

const indexRouter = require('./routes/index');
const accountsRouter = require('./routes/accounts');
const productsRuter = require('./routes/products');
const shoppingRouter = require('./routes/shopping');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(logginMiddleware);

app.use('/', indexRouter);
app.use('/accounts', accountsRouter);
app.use('/products', productsRuter);
app.use('/shopping', shoppingRouter);

// catch 404 and forward to error handler，
app.use((req, res, next) => {
    next(createError(404));
});

// error handler
app.use((err, req, res) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = process.env.NODE_ENV === 'development' ? err : {};
    console.log(err.message);
    // render the error page
    res.status(err.status || 500);
    res.send('error');
});

module.exports = app;
