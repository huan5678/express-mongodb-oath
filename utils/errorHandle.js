const errorHandle = (res, err) =>
{
  res.status(400).json(
    {
      status: false,
      message: '請檢查欄位，或是檢查 ID 是否正確',
      error: err
    }
  ).end();
}

module.exports = errorHandle;