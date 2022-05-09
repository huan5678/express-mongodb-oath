const Post = require('../models/post');
const errorHandle = require('../utils/errorHandle');
const successHandle = require('../utils/successHandle');

const postController = {
  getAllPosts: async (req, res) => {
    const getAllPosts = await Post.find();
    successHandle(res, '成功取得所有貼文', getAllPosts)
  },
  getPostById: async (req, res) => {
    const id = req.params.id;
    if (id) {
      const post = await Post.findById(id);
      successHandle(res, '成功取得指定貼文', post);
    } else {
      res.send({
        status: false,
        message: '請在確認 ID 是否正確'
      })
    }
  },
  createPost: async (req, res) => {
    try {
      const data = req.body;
      if (data.content) {
        await Post.create(data);
        const getAllPosts = await Post.find();
        successHandle(res, '成功新增一則貼文', getAllPosts)
      } else {
        errorHandle(res)
      }
    } catch (err) {
      errorHandle(res, err);
    }
  },
  updatePost: async (req, res) => {
    try {
      const id = req.params.id;
      const data = req.body;
      if (data.content) {
        await Post.findByIdAndUpdate(id, data);
        const getAllPosts = await Post.find();
        successHandle(res, '成功更新一則貼文', getAllPosts)
      } else {
        errorHandle(res);
      }
    } catch (err) {
      errorHandle(res, err);
    }
  },
<<<<<<< HEAD
  deleteAllPost: async (req, res) => {
=======
  deleteAllPost: async ({res}) => {
>>>>>>> 75aaa8f20bc49a131c65bbb7ec08627f87d997a5
    await Post.deleteMany({})
    successHandle(res, '成功刪除全部貼文')
  },
  deletePost: async (req, res) => {
    try {
      const id = req.params.id;
      if (id) {
        await Post.findByIdAndDelete(id);
        const getAllPosts = await Post.find();
        successHandle(res, '成功刪除該則貼文', getAllPosts)
      } else {
        errorHandle(res)
      }
    } catch (err) {
      errorHandle(res, err)
    }
  }
}

module.exports = postController;
