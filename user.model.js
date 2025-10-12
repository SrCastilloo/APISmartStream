const { Schema, model } = require('mongoose');

//definimos la estructura del usuario (como una tabla en SQL)
const userSchema = new Schema({
  nickname: { type: String, required: true, trim: true },
  correo:   { type: String, required: true, unique: true, lowercase: true, trim: true },
  contrasena:{ type: String, required: true }
}, { timestamps: true });

module.exports = model('Usuario', userSchema);
