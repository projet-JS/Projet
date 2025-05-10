const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken'); // Pour décoder le token JWT

/**
 * POST /update-location
 * Met à jour la géolocalisation d'un utilisateur.
 */
router.post(
    '/update-location',
    [
        body('latitude')
            .isFloat({ min: -90, max: 90 })
            .withMessage('Latitude invalide. Elle doit être comprise entre -90 et 90.'),
        body('longitude')
            .isFloat({ min: -180, max: 180 })
            .withMessage('Longitude invalide. Elle doit être comprise entre -180 et 180.'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { latitude, longitude } = req.body;

            // Extraire le token JWT de l'en-tête Authorization
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                return res.status(401).json({ message: 'Token manquant ou invalide.' });
            }

            // Vérifier et décoder le token JWT
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userId = decoded.userId;

            // Mettre à jour la localisation dans la base de données pour l'utilisateur connecté
            const user = await User.findByIdAndUpdate(
                userId,
                { localisation: `${latitude}, ${longitude}` },
                { new: true }
            );

            if (!user) {
                return res.status(404).json({ message: 'Utilisateur non trouvé.' });
            }

            console.log(`Géolocalisation reçue : Latitude ${latitude}, Longitude ${longitude}`);

            res.status(200).json({ message: 'Géolocalisation mise à jour avec succès.', localisation: user.localisation });
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la géolocalisation :', error);
            if (error.name === 'JsonWebTokenError') {
                return res.status(403).json({ message: 'Token invalide.' });
            }
            res.status(500).json({ message: 'Erreur serveur.' });
        }
    }
);

module.exports = router;