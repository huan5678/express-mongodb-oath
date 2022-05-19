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

router.route('/user/create').post(userCreate);
router.route('/user/login').post(userLogin);
router.route('/user/update_password').post(isAuthor, updatePassword);
router.route('/user/profile').get(isAuthor, getProfile);
router.route('/user/profile').patch(isAuthor, updateProfile);

module.exports = router;
