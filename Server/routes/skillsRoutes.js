const express = require('express');
const router = express.Router();
const skillController = require('../controllers/SkillsController');

router.get('/', skillController.getAllSkills);
router.get('/:id', skillController.getSkillById);
router.post('/add', skillController.createSkill);
router.put('/update/:id', skillController.updateSkill);
router.delete('/:id', skillController.deleteSkill);

module.exports = router;
