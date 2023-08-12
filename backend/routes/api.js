// Exemple de définition de route pour l'API

const express = require('express');
const router = express.Router();
const wordController = require('../controllers/wordController');

// Route pour obtenir un mot mystère aléatoire
router.get('/random-word', wordController.getRandomWord);

module.exports = router;
