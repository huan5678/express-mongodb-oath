const Post = require('../models/post');
const errorHandle = require('../utils/errorHandle');
const successHandle = require('../utils/successHandle');

const postController = {
  getAllPosts: async (res) =>
  {
    const getAllPosts = await Post.find();
    successHandle(res, '成功取得所有貼文', getAllPosts)
  },
  createPost: async (req, res) =>
  {
    try {
      const data = req.body;
      await Post.create(data);
      const getAllPosts = await Post.find();
      successHandle(res, '成功新增一則貼文', getAllPosts)
    } catch (err) {
      errorHandle(res, err)
    }
  },
  updatePost: async (req, res) =>
  {
    try {
      const id = req.params.id;
      const data = req.body;
      await Post.findByIdAndUpdate(id, data);
      const getAllPosts = await Post.find();
      successHandle(res, '成功更新一則貼文', getAllPosts)
    } catch (err) {
      errorHandle(res, err)
    }
  },
  deleteAllPost: async (res) =>
  {
    await Post.deleteMany({})
    successHandle(res, '成功刪除全部貼文')
  },
  deletePost: async (req, res) =>
  {
    try {
      const id = req.params.id;
      await Post.findByIdAndDelete(id);
      const getAllPosts = await Post.find();
      successHandle(res, '成功刪除該則貼文', getAllPosts)
    } catch (err) {
      errorHandle(res, err)
    }
  }
}

module.exports = postController;
