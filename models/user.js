const mongoose = require('mongoose');

const userSchema = {
  userEmail: {
    type: email,
    required: [true, 'email為必要資訊']
  },
  userPassword: {
    type: String,
    required: [true, '密碼欄位，請確實填寫']
  },
  userName: {
    type: String,
  },
  userPhoto: String,
  userGender: {
    type: String,
    enum: ['male', 'female', 'x'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
    select: false,
  },
  googleId: String,
  facebookId: String,
  lineId: String,
  githubId: String,
}

const User_Schema = new mongoose.Schema(
  userSchema,
  {
    versionKey: false,
  }
)

const User = mongoose.model('User', User_Schema);

module.exports = User;