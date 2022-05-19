const appError = require('./appError');
const passwordRules = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){7,}$/gm;
const passwordCheck = (password, next) => {
  if (passwordRules.test(password)) {
    return appError(
      400,
      '密碼強度不足，請確認是否具至少有 1 個數字， 1 個大寫英文， 1 個小寫英文及 1 個特殊符號',
      next
    );
  }
};

module.exports = {passwordCheck, passwordRules};
