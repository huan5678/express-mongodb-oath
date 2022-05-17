const express = require('express');
const router = express.Router();
const User = require('../models/user');
const {
  userCreate,
  userLogin,
  getProfile,
  updatePassword,
  updateProfile,
} = require('../controllers/user');
const {isAuthor} = require('../middleware/handleAuthor');

router.route('/').post();

module.exports = router;
