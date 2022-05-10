const mongoose = require('mongoose');

const userSchema = {
  email: {
    type: String,
    required: [true, 'email為必要資訊'],
  },
  password: {
    type: String,
    minLength: 8,
    required: [
      true,
      '密碼欄位，請確實填寫並符合至少有 1 個數字， 1 個大寫英文， 1 個小寫英文及 1 個特殊符號規定，至少 8 碼',
    ],
  },
  name: {
    type: String,
    required: [true, '名稱為必要資訊'],
  },
  photo: String,
  gender: {
    type: String,
    enum: ['male', 'female', 'x'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
    select: false,
  },
  thirdPartyAuthor: {
    googleId: String,
    facebookId: String,
    lineId: String,
    githubId: String,
  },
};

const User_Schema = new mongoose.Schema(userSchema, {
  versionKey: false,
});

const User = mongoose.model('User', User_Schema);

module.exports = User;
