const createError = require('http-errors');
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const passport = require('passport');
const dotenv = require('dotenv');
dotenv.config({path: './.env'});

const errorHandle = require('./utils/errorHandle');
const errorHandleDev = require('./utils/errorHandleDev');

require('./utils/passport');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const postsRouter = require('./routes/post');
const authRouter = require('./routes/auth');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(passport.initialize());
require('./connections');
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/posts', postsRouter);
app.use('/auth', authRouter);

app.use((req, res, next) => {
  res.status(404).send({
    status: false,
    message: '您的路由不存在，請檢查路徑是否正確'
  })
})

app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  if (process.env.NODE_ENV === 'dev') {
    return errorHandleDev(err, res);
  }
  if (err.name === 'ValidationError') {
    err.message = '資料欄位未正確填寫，請重新輸入！';
    err.isOperational = true;
    return errorHandle(err, res);
  }

  if (err.name === 'CastError') {
    err.message = '無此 id 資料，請確認後重新輸入！';
    err.isOperational = true;
    return errorHandle(err, res);
  }

  errorHandle(err, res)
})

process.on('uncaughtException', err => {
	console.error('Uncaughted Exception!')
	console.error(err);
	process.exit(1);
});


process.on('unhandledRejection', (reason, promise) => {
  console.error('未捕捉到的 rejection:', promise, '原因：', reason);
});


module.exports = app;
