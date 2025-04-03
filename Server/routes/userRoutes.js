const express = require('express');
const router = express.Router();
const {profilePictureUpload, getBasicUserInfo, getMe, getAllUsers, addUser, updateUser, dropUser, getUserById, changePassword, getLoggedUser, updateLoggedUserPassword, UpdateLoggeduserData, deleteLoggedUser} = require('../controllers/UserController');
const { protection, allowTo } =require('../controllers/AuthController');
const User = require('../models/User');

// admin
router.get('/', protection, allowTo('admin'), getAllUsers);
router.post('/addUser', protection, allowTo('admin'), addUser);
router.put('/updateUser/:id', protection, allowTo('admin'), updateUser);
router.get('/getUser/:id', protection, allowTo('admin'), getUserById);
router.delete('/dropUser/:id', protection, allowTo('admin'), dropUser);
router.put('/changePassword/:id', protection, allowTo('admin'), changePassword);

// user
router.post('/upload-profile-picture', protection, profilePictureUpload);
router.get('/basic/:id', protection, getBasicUserInfo);
router.get('/getMe',protection, getMe );
router.put('/updateMyPassword', protection, updateLoggedUserPassword);
router.put('/updateMe', protection, UpdateLoggeduserData);
router.put('/deleteMe', protection, deleteLoggedUser);
router.patch('/:id/add-workspace',protection, async (req, res) => {
  try {
    const { workspaceId } = req.body;
    const userId = req.params.id;
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $push: { workspaces: workspaceId } },
      { new: true } // Return the updated document
    ).populate('workspaces'); // Populate workspaces
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});
module.exports = router