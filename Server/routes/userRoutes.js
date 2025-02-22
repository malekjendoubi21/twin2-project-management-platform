const express = require('express');
const router = express.Router();
const { getAllUsers, addUser, updateUser, getUserById, changePassword} = require('../controllers/UserController');
const { protection } =require('../controllers/AuthController');


router.get('/', protection, getAllUsers);
router.post('/addUser', protection, addUser);
router.put('/updateUser/:id', protection, updateUser);
router.get('/getUser/:id', protection, getUserById);
router.put('/changePassword/:id', protection, changePassword);


module.exports = router