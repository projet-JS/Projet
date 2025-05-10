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

const examenSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  audience: { type: String, required: true },
  link: { type: String, default: '' },
  questions: [questionSchema], // Tableau de questions
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Examen', examenSchema);
