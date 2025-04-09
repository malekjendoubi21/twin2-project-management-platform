const express = require('express');
const router = express.Router();
const experienceController = require('../controllers/ExperienceController');
const authController = require('../controllers/AuthController');

// Routes protégées avec authController.protection
router.get('/', authController.protection, experienceController.getAllExperiences); // Protégé
router.get('/:id', authController.protection, experienceController.getExperienceById); // Protégé
router.post('/add', authController.protection, experienceController.createExperience); // Protégé (renommé /add pour cohérence)
router.put('/update/:id', authController.protection, experienceController.updateExperience); // Protégé (renommé /update/:id)
router.delete('/:id', authController.protection, experienceController.deleteExperience); // Protégé

module.exports = router;