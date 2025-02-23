const express = require('express');
const router = express.Router();
const { login, register, forgotPassword, verifyResetToken } = require('../controllers/AuthController');


router.post('/login', login);
router.post('/register', register);
router.post('/forgotPassword', forgotPassword);
router.post('/verifyResetToken', verifyResetToken);


module.exports = router;