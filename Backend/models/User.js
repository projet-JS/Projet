const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email:       { type: String, required: true, unique: true },
  password:    { type: String, required: true },
  nom:         { type: String, required: true },
  prenom:      { type: String, required: true },
  naissance:   { type: Date,   required: true },
  sexe:        { type: String, required: true },
  etablissement:{ type: String,required: true },
  filiere:     { type: String, required: true },
  localisation: { type: String, required: false }
});

// Avant de sauvegarder, on hache le password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await require('bcrypt').genSalt(10);
  this.password = await require('bcrypt').hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', userSchema);
