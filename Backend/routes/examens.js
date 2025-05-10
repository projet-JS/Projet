const express = require('express');
const { body, param, validationResult } = require('express-validator');
const Examen = require('../models/Examen');
const Question = require('../models/Question');

const router = express.Router();

/**
 * PATCH /:id/link
 * Met à jour le lien d'un examen spécifique.
 */
router.patch(
  '/:id/link',
  [
    param('id').isMongoId().withMessage('ID d\'examen invalide'),
    body('link').notEmpty().withMessage('Le lien est obligatoire'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const { link } = req.body;

      const exam = await Examen.findByIdAndUpdate(
        id,
        { link },
        { new: true }
      );

      if (!exam) {
        return res.status(404).json({ message: 'Examen non trouvé' });
      }

      res.json({ message: 'Lien mis à jour avec succès', exam });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du lien de l\'examen :', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }
);

/**
 * POST /
 * Crée un examen avec ses questions.
 */
router.post(
  '/',
  [
    body('title').notEmpty().withMessage('Le titre est obligatoire'),
    body('description').notEmpty().withMessage('La description est obligatoire'),
    body('audience').notEmpty().withMessage('Le public cible est obligatoire'),
    body('questions').isArray({ min: 1 }).withMessage('Au moins une question est requise'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, description, audience, questions } = req.body;

      // Créer un nouvel examen
      const newExam = new Examen({
        title,
        description,
        audience,
        questions,
        link: '', // Le lien peut être généré plus tard
      });

      // Sauvegarder l'examen dans la base de données
      const savedExam = await newExam.save();

      res.status(201).json({ message: 'Examen créé avec succès.', examId: savedExam._id });
    } catch (err) {
      console.error('Erreur lors de la création de l\'examen :', err);
      res.status(500).json({ message: 'Erreur serveur.' });
    }
  }
);

/**
 * GET /:idExam/questions
 * Récupère les questions d'un examen spécifique.
 */
router.get(
  '/:idExam/questions',
  [param('idExam').isMongoId().withMessage('ID d\'examen invalide')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { idExam } = req.params;
      const examen = await Examen.findById(idExam).populate('questions');

      if (!examen) {
        return res.status(404).json({ message: 'Examen non trouvé' });
      }

      res.status(200).json({ questions: examen.questions });
    } catch (err) {
      console.error('Erreur lors de la récupération des questions :', err);
      res.status(500).json({ message: 'Erreur serveur.' });
    }
  }
);

/**
 * POST /:idExam/submit
 * Soumet les réponses d'un utilisateur pour un examen spécifique.
 */
router.post(
  '/:idExam/submit',
  [
    param('idExam').isMongoId().withMessage('ID d\'examen invalide'),
    body('answers').isArray().withMessage('Les réponses doivent être un tableau'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { idExam } = req.params;
      const { answers } = req.body;

      const examen = await Examen.findById(idExam).populate('questions');

      if (!examen) {
        return res.status(404).json({ message: 'Examen non trouvé' });
      }

      let score = 0;
      examen.questions.forEach((question, index) => {
        if (question.correctAnswer === answers[index]) {
          score++;
        }
      });

      res.status(200).json({ message: 'Examen soumis avec succès', score });
    } catch (err) {
      console.error('Erreur lors de la soumission de l\'examen :', err);
      res.status(500).json({ message: 'Erreur serveur.' });
    }
  }
);

module.exports = router;