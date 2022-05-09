const mongoose = require('mongoose');

const postSchema = {
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, '名稱必填'],
  },
  tags: {
    type: ['String'],
  },
  type: {
    type: String,
  },
  image: String,
  createdAt: {
    type: Date,
    default: Date.now,
    select: false,
  },
  content: {
    type: String,
    required: [true, '貼文內容必填']
  },
  likes: Number,
  comments: Number,
}

const Post_Schema = new mongoose.Schema(
  postSchema,
  {
    versionKey: false,
  }
)

const Post = mongoose.model('Post', Post_Schema);

module.exports = Post;