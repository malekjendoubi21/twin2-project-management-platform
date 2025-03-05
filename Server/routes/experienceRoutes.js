const express = require('express');
const router = express.Router();
const experienceController = require('../controllers/ExperienceController');


router.post('/addExperience', experienceController.createExperience);
router.get('/', experienceController.getAllExperiences);
router.get('/:id', experienceController.getExperienceById);
router.put('/updateExperience/:id', experienceController.updateExperience);
router.delete('/:id', experienceController.deleteExperience);

module.exports = router;
