require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt'); // Pour comparer les mots de passe
const jwt = require('jsonwebtoken'); // Pour générer et vérifier le JWT
const { body, validationResult } = require('express-validator'); // Pour valider les données
const User = require('../models/User'); // Import du modèle User
const router = express.Router();

/**
 * POST /api/auth/login
 * Authentifie un utilisateur et renvoie un JWT si la connexion est réussie.
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email invalide'),
    body('password').notEmpty().withMessage('Le mot de passe est obligatoire'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password } = req.body;

      // Vérifier que l'utilisateur existe
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Utilisateur non trouvé.' });
      }

      // Comparer les mots de passe
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Mot de passe incorrect.' });
      }

      // Générer un JWT
      const payload = { userId: user._id, email: user.email };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

      // Retourner le token au client
      res.json({ token });
    } catch (err) {
      console.error('Erreur lors de la connexion :', err);
      res.status(500).json({ message: 'Erreur serveur.' });
    }
  }
);

/**
 * Middleware: authenticateToken
 * Vérifie la présence et la validité du JWT dans l'en-tête Authorization.
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token manquant.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token invalide.' });
    }
    req.user = user; // { userId, email, iat, exp }
    next();
  });
}

/**
 * GET /api/auth
 * Vérifie si le token JWT est valide.
 */
router.get('/', authenticateToken, (req, res) => {
  res.json({ message: 'Authenticated', user: req.user });
});

module.exports = router;