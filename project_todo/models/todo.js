const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  text: String,
  done: Boolean
});

module.exports = mongoose.model('Todo', todoSchema);
