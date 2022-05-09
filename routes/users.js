const express = require('express');
const router = express.Router();
const User = require('../models/user');
const successHandle = require('../utils/successHandle');

router.get('/', async (req, res) => {
  const getUsers = await User.find();
  successHandle(res, '成功取得使用者資料', getUsers);
});

module.exports = router;
