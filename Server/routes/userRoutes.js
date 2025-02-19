const express = require('express');
const router = express.Router();
const { getAllUsers, addUser, updateUser ,login} = require('../controllers/UserController');


router.get('/', getAllUsers);
router.post('/addUser', addUser);
router.post('/login', login);
router.put('/updateUser/:id', updateUser);


module.exports = router;