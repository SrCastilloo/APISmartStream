const { Schema, model, Types } = require('mongoose');

const authorSchema = new Schema({
  id: { type: Types.ObjectId, required: true },
  nickname: { type: String, required: true },
  correo: { type: String, required: true },
}, { _id: false });

const postSchema = new Schema({
  content: { type: String, required: true, trim: true, maxlength: 4000 },
  author: { type: authorSchema, required: true },
}, { timestamps: true });

module.exports = model('Post', postSchema);
