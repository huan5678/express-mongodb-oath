const asyncWrapper = require('./async');
const appError = require('../utils/appError');

const jwtSecret = process.env.JWT_SECRET;
const jwtExpires = process.env.JWT_EXPIRES_DAY;

const checkDate = (time, next) => {
  const now = new Date().getTime();
  if (now > time * 1000) {
    return appError(400, '驗證碼已過期，請重新登入！', next);
  }
};

const isAuthor = asyncWrapper(async (req, res, next) => {
  const accessToken = req.header('Authorization').split('Bearer ').pop();
  if (!accessToken || !req.header('Authorization')) {
    return appError(401, '未帶入驗證碼，請重新登入！', next);
  }
  const decoded = jwt.verify(accessToken, jwtSecret, (err, payload) => {
    if (err) {
      return appError(400, err.message, next);
    } else {
      return payload;
    }
  });
  checkDate(decoded.exp, next);
  const currentUser = await User.findById(decoded.id).exec();
  req.user = currentUser;
  next();
});

const generateToken = (user) => {
  const payload = {
    id: user._id,
    name: user.name,
    photo: user.photo,
  };
  return jwt.sign(payload, jwtSecret, {expiresIn: jwtExpires});
};

module.exports = {isAuthor, generateToken};
