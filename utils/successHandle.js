const successHandle = (
  res,
  message = '',
  data = []
) => {
  res.send(
    {
      status: true,
      message: message,
      data,
    }
  );
}

module.exports = successHandle;