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
const {isAuthor} = require('../middleware/handleAuthor');

router.route('/posts').get(isAuthor, getAllPosts).delete(isAuthor, deleteAllPost);
router.route('/post').post(isAuthor, createPost);
router
  .route('/post/:id')
  .get(isAuthor, getPostByID)
  .patch(isAuthor, updatePostByID)
  .delete(isAuthor, deletePostByID);

module.exports = router;
