const express = require('express');
const router = express.Router();
const { login, register, forgotPassword, verifyResetToken, resetPassword } = require('../controllers/AuthController');


router.post('/login', login);
router.post('/register', register);
router.post('/forgotPassword', forgotPassword);
router.post('/verifyResetToken', verifyResetToken);
router.put('/resetPassword', resetPassword);


module.exports = router;