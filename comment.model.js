const { Schema, model, Types } = require('mongoose');

const authorSchema = new Schema({
  id: { type: Types.ObjectId, required: true },
  nickname: { type: String, required: true },
  correo: { type: String, required: true },
}, { _id: false });

const commentSchema = new Schema({
  postId: { type: Types.ObjectId, ref: 'Post', required: true, index: true },
  parentId: { type: Types.ObjectId, default: null }, // null => respuesta al post
  content: { type: String, required: true, trim: true, maxlength: 4000 },
  author: { type: authorSchema, required: true },
}, { timestamps: true });

module.exports = model('Comment', commentSchema);
