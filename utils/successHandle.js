const successHandle = (res, message = '', data = []) => {
  data.length > 1 || typeof data === 'object'
    ? res.send({
        status: true,
        message: message,
        data,
      })
    : res.send({
        status: true,
        message: message,
      });
};

module.exports = successHandle;
