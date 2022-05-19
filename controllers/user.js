const bcrypt = require('bcryptjs');
const validator = require('validator');
const User = require('../models/user');
const asyncWrapper = require('../middleware/async');
const successHandle = require('../utils/successHandle');
const appError = require('../utils/appError');
const {generateToken} = require('../middleware/handleAuthor');
const {passwordCheck} = require('../utils/passwordCheck');

const userController = {
  userCreate: asyncWrapper(async (req, res, next) => {
    let {email, password, confirmPassword, name} = req.body;
    if (!email || !password || !confirmPassword || !name) {
      return appError(400, '欄位未正確填寫', next);
    }
    if (name.length <= 1) {
      return appError(400, '名字長度至少 2 個字', next);
    }
    if (password.length <= 7 || confirmPassword.length <= 7) {
      return appError(400, '密碼長度至少 8 個字', next);
    }
    if (!validator.isEmail(email)) {
      return appError(400, '請正確輸入 email 格式', next);
    }
    passwordCheck(password, next);

    if (password !== confirmPassword) {
      return appError(400, '請確認兩次輸入的密碼是否相同', next);
    }

    const user = User.findOne({email}).exec();
    if (user) {
      return appError(400, '此帳號已有人使用，請試試其他 Email 帳號', next);
    }

    const userData = {
      name,
      email,
      password,
      isValidator: true,
    };
    await User.create(userData);
    return successHandle(res, '成功建立使用者帳號');
  }),
  userLogin: asyncWrapper(async (req, res, next) => {
    const {email, password} = req.body;
    if (!email || !password) {
      return appError(400, 'email 或 password 欄位未正確填寫', next);
    }
    const user = await User.findOne({email});
    if (!user) {
      return appError(404, '無此使用者資訊請確認 email 帳號是否正確', next);
    }
    const userPassword = await User.findOne({email}).select('+password');
    const checkPassword = bcrypt.compareSync(req.body.password, userPassword.password);
    if (!checkPassword) {
      return appError(400, '請確認密碼是否正確，請再嘗試輸入', next);
    }
    const token = generateToken(user);
    return successHandle(res, '登入成功', token);
  }),
  getProfile: asyncWrapper(async (req, res, next) => {
    const userId = req.user.id;
    const user = await User.findById(userId);
    return successHandle(res, '成功取得使用者資訊', user);
  }),
  updatePassword: asyncWrapper(async (req, res, next) => {
    let {password, confirmPassword} = req.body;
    if (!password || !confirmPassword) {
      return appError(400, '欄位未正確填寫', next);
    }
    if (password.length <= 7 || confirmPassword.length <= 7) {
      return appError(400, '密碼長度至少 8 個字', next);
    }
    passwordCheck(password, next);
    if (password !== confirmPassword) {
      return appError(400, '請確認兩次輸入的密碼是否相同', next);
    }
    const userId = req.user.id;
    await User.findByIdAndUpdate(userId, password);
    return successHandle(res, '成功更新使用者密碼！', {});
  }),
  updateProfile: asyncWrapper(async (req, res, next) => {
    let {name, photo, gender} = req.body;
    if (!name && !photo && !gender) {
      return appError(400, '要修改的欄位未正確填寫', next);
    }
    if (!validator.isURL(photo)) {
      return appError(400, '請確認照片是否傳入網址', next);
    }
    const userId = req.user.id;
    const userData = {name, photo, gender};
    await User.findByIdAndUpdate(userId, userData, {runValidators: true});
    const user = await User.findById(userId);
    return successHandle(res, '成功更新使用者資訊！', user);
  }),
};

module.exports = userController;
