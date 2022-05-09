const mongoose = require('mongoose');

const userSchema = {
  userEmail: {
    type: String,
    // required: [true, 'email為必要資訊'],
  },
  userPassword: {
    type: String,
    minLength: 8,
    // required: [true, '密碼欄位，請確實填寫，至少 8 碼'],
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
  thirdPartyAuthor: {
    googleId: String,
    facebookId: String,
    lineId: String,
    githubId: String,
  },
  name: {
    type: String,
  },
  photo: {
    type: String,
  }
}

const User_Schema = new mongoose.Schema(
  userSchema,
  {
    versionKey: false,
  }
)

const User = mongoose.model('User', User_Schema);

module.exports = User;