const express = require('express');
const router = express.Router();
const {
  getAllPosts,
  getPostByID,
  createPost,
  deleteAllPost,
  deletePostByID,
  updatePostByID,
} = require('../controllers/post');

router.route('/posts').get(getAllPosts).delete(deleteAllPost);
router.route('/post').post(createPost);
router.route('/post/:id').get(getPostByID).patch(updatePostByID).delete(deletePostByID);

module.exports = router;
