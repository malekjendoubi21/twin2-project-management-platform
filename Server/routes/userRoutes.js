const express = require('express');
const router = express.Router();
const { getAllUsers, addUser, updateUser ,login,getUser} = require('../controllers/UserController');


router.get('/', getAllUsers);
router.post('/addUser', addUser);
router.post('/login', login);
router.put('/updateUser/:id', updateUser);
router.get('/getUser/:id', getUser);


module.exports = router;