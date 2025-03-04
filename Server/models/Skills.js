const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true, // Enlève les espaces inutiles avant et après
  },
  description: {
    type: String,
    trim: true, // Enlève les espaces inutiles avant et après
    required: true, // Le champ description est requis
  },
  category: {
    type: String,
    required: true, // Le champ catégorie est requis
    enum: ['Technical', 'Soft Skill', 'Management'], // Liste de catégories possibles (par exemple)
  },
  tags: {
    type: [String], // Liste de tags pour classifier la compétence
    default: [],
  }
}, {
  timestamps: true, // Enregistre automatiquement les dates de création et de mise à jour
});

module.exports = mongoose.model('Skill', skillSchema);
