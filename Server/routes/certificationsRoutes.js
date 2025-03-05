const express = require('express');
const router = express.Router();

const certificationController = require('../controllers/CertifiacationsController');

router.post('/addCertification', certificationController.createCertification);
router.put('/updateCertification/:id', certificationController.updateCertification);
router.get('/', certificationController.getAllCertifications);
router.get('/:id', certificationController.getCertificationById);
router.delete('/:id', certificationController.deleteCertification);

module.exports = router;
