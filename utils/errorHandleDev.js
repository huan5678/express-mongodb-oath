const errorHandle = (err, res) => {
  res.status(err.statusCode || 500).send({
    status: false,
    name: err.name,
    message: err.message,
    err: err.stack,
  })
}

module.exports = errorHandle;