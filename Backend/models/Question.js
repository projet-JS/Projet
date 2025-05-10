const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  type: { type: String, required: true },
  statement: { type: String, required: true },
  media: { type: Array, default: [] },
  options: { type: Array, default: [] },
  answer: { type: String, default: '' },
  tolerance: { type: Number, default: 0 },
  score: { type: Number },
  duration: { type: Number}
});


module.exports = mongoose.model('Question', questionSchema);
