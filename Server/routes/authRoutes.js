const express = require('express');
const router = express.Router();
const { login, register, forgotPassword } = require('../controllers/AuthController');


router.post('/login', login);
router.post('/register', register);
router.post('/forgotPassword', forgotPassword);


module.exports = router;