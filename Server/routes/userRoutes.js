const express = require('express');
const router = express.Router();
const { getAllUsers, addUser ,login} = require('../controllers/UserController');


router.get('/', getAllUsers);
router.post('/addUser', addUser);
router.post('/login', login);


module.exports = router;