require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth'); // Routes pour l'authentification
const examenRoutes = require('./routes/examens'); // Routes pour les examens
const geolocalisationRoutes = require('./routes/geolocalisation'); // Routes pour la géolocalisation

const app = express();

// Middleware pour parser le JSON et les cookies
app.use(express.json());
app.use(cookieParser());
app.use(cors()); // Si vous utilisez un frontend séparé

// Servir les fichiers statiques depuis le dossier frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Connexion à MongoDB
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://admin:1234@localhost:27017/examdb?authSource=admin', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connecté'))
  .catch((err) => console.error('Erreur MongoDB:', err));

// Routes
app.use('/api/auth', authRoutes); // Routes pour l'authentification
app.use('/api/examens', examenRoutes); // Routes pour les examens
app.use('/api/geolocalisation', geolocalisationRoutes); // Routes pour la géolocalisation

// Route racine : redirige vers login.html
app.get('/', (req, res) => {
  res.redirect('/login.html');
});

// Middleware 404 : Page non trouvée
app.use((req, res) => {
  res.status(404).json({ message: 'Page non trouvée' });
});

// Middleware global pour gérer les erreurs serveur (500)
app.use((err, req, res, next) => {
  console.error('Erreur interne du serveur:', err);
  res.status(500).json({ message: 'Erreur interne du serveur', error: err.message });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000; // Ajout d'une valeur par défaut pour le port
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});