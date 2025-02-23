const express = require('express');
const router = express.Router();
const { getAllUsers, addUser, updateUser, getUserById, changePassword, getLoggedUser, updateLoggedUserPassword, UpdateLoggeduserData} = require('../controllers/UserController');
const { protection, allowTo } =require('../controllers/AuthController');


router.get('/', protection, allowTo('admin'), getAllUsers);
router.post('/addUser', protection, allowTo('admin'), addUser);
router.put('/updateUser/:id', protection, allowTo('admin'), updateUser);
router.get('/getUser/:id', protection, allowTo('admin'), getUserById);
router.put('/changePassword/:id', protection, changePassword);

router.get('/getMe', protection, getLoggedUser, getUserById);
router.put('/updateMyPassword', protection, updateLoggedUserPassword);
router.put('/updateMe', protection, UpdateLoggeduserData);

module.exports = router