const express = require('express');
const router = express.Router();
const {
    login,
    register,
    forgotPassword,
    verifyResetToken,
    resetPassword,
    logout,
    initiateGoogleAuth,
    handleGoogleCallback
} = require('../controllers/AuthController');

// Local authentication
router.post('/login', login);
router.post('/register', register);
router.post('/forgotPassword', forgotPassword);
router.post('/verifyResetToken', verifyResetToken);
router.put('/resetPassword', resetPassword);
router.get('/logout', logout);

// Google authentication
router.get('/google', initiateGoogleAuth);
router.get('/google/callback', handleGoogleCallback);

module.exports = router;