const postController = require('../controllers/post');
const express = require('express');
const router = express.Router();

router.get('/', postController.getAllPosts);

router.get('/:id', postController.getPostById);

router.post('/', postController.createPost);

router.delete('/', postController.deleteAllPost);

router.patch('/:id', postController.updatePost);

router.delete('/:id', postController.deletePost);

module.exports = router;