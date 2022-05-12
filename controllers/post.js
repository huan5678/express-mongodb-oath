const Post = require('../models/post');
const User = require('../models/user');
const handleErrorAsync = require('../utils/handleErrorAsync');
const successHandle = require('../utils/successHandle');
const appError = require('../utils/appError');

const postController = {
  getAllPosts: handleErrorAsync(async (req, res, next) => {
    const timeSort = req.query.timeSort == 'asc' ? 'createdAt' : '-createdAt';
    const q = req.query.q !== undefined ? {content: new RegExp(req.query.q)} : {};
    const getAllPosts = await Post.find(q)
      .populate({
        path: 'user',
        select: 'name photo',
      })
      .sort(timeSort);
    successHandle(res, '成功取得所有貼文', getAllPosts);
  }),
  getPostByID: handleErrorAsync(async (req, res, next) => {
    const {id} = req.params;
    if (typeof id === undefined || id === null || id.trim() === '') {
      return appError(404, '請正確的帶入貼文的 id', next);
    }
    const post = await Post.findById(id);
    post.populate({
      path: 'user',
      select: 'name photo',
    });
    successHandle(res, '成功取得該貼文', post);
  }),
  createPost: handleErrorAsync(async (req, res, next) => {
    const data = req.body;
    if (typeof data.content === undefined || data.content === null || data.content?.trim() === '') {
      return appError(400, '請正確填寫內容欄位，內容欄位不得為空', next);
    }
    data.content = data.content?.trim();
    const userId = req.body.user;
    if (typeof userId === undefined || userId === null || userId.trim() === '') {
      return appError(400, '請正確填入 id 欄位', next);
    }
    const user = await User.findById(userId).exec();
    if (!user) {
      return appError(400, '請確認使用者 id 是否正確', next);
    }
    await Post.create(data);
    const getAllPosts = await Post.find().populate({
      path: 'user',
      select: 'name photo',
    });
    successHandle(res, '成功新增一則貼文', getAllPosts);
  }),
  updatePostByID: handleErrorAsync(async (req, res, next) => {
    const {id} = req.params;
    const data = req.body;
    if (typeof id === undefined || id === null || id.trim() === '') {
      return appError(404, '請正確的帶入貼文的 id', next);
    }
    const postId = await Post.findById(id).exec();
    if (!postId) {
      return appError(404, '請確認貼文 id 是否正確', next);
    }
    if (typeof data.content === undefined || data.content === null || data.content?.trim() === '') {
      return appError(400, '請正確填寫內容欄位，內容欄位不得為空', next);
    }
    data.content = data.content?.trim();
    await Post.findByIdAndUpdate(id, data);
    const getAllPosts = await Post.find().populate({
      path: 'user',
      select: 'name photo',
    });
    successHandle(res, '成功更新一則貼文', getAllPosts);
  }),
  deleteAllPost: handleErrorAsync(async (req, res, next) => {
    await Post.deleteMany({});
    successHandle(res, '成功刪除全部貼文');
  }),
  deletePostByID: handleErrorAsync(async (req, res, next) => {
    const {id} = req.params;
    if (typeof id === undefined || id === null || id.trim() === '') {
      return appError(404, '請正確的帶入貼文的 id', next);
    }

    const postId = Post.findById(id);
    if (!postId) {
      return appError(404, '請確認貼文 id 是否正確', next);
    }

    await Post.findByIdAndDelete(id);
    const getAllPosts = await Post.find().populate({
      path: 'user',
      select: 'name photo',
    });
    successHandle(res, '成功刪除該則貼文', getAllPosts);
  }),
};

module.exports = postController;
