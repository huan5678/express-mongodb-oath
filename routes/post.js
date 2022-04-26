const postController = require('../controllers/post');
var express = require('express');
var router = express.Router();

router.get('/', (req, res) =>
{
  postController.getAllPosts(res);
}
);

router.post('/', (req, res) =>
{
  postController.createPost(req, res);
})

router.delete('/', (req, res) =>
{
  postController.deleteAllPost(res)
})

router.patch('/:id', (req, res) =>
{
  postController.updatePost(req, res)
})

router.delete('/:id', (req, res) =>
{
  postController.deletePost(req, res)
})

module.exports = router;