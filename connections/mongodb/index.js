const mongoose = require('mongoose');

const DB_Password = process.env.DATABASE_PASSWORD;
const DB = process.env.DATABASE_PATH.replace('<password>', DB_Password);

mongoose.connect(DB)
  .then(() => console.log('資料庫連線成功'))
  .catch(err => console.log(err));
