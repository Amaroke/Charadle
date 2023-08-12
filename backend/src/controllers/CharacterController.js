// Exemple de contrôleur pour la gestion des mots mystères

// Supposons que vous avez une liste de mots dure pour le jeu Wordle
const words = ["apple", "banana", "cherry", "grape", "melon"];

// Contrôleur pour récupérer un mot mystère aléatoire
exports.getRandomWord = (req, res) => {
  const randomIndex = Math.floor(Math.random() * words.length);
  const randomWord = words[randomIndex];
  res.json({ word: randomWord });
};
