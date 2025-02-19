const express = require('express');
const router = express.Router();
const { getAllUsers, addUser } = require('../controllers/UserController');


router.get('/', getAllUsers);
router.post('/addUser', addUser);

module.exports = router;