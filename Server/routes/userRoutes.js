const express = require('express');
const router = express.Router();
const {getUserWorkspacesCount,fixUserWorkspaces, profilePictureUpload, getBasicUserInfo, getMe, getAllUsers, addUser, updateUser, dropUser, getUserById, changePassword,  updateLoggedUserPassword, UpdateLoggeduserData, deleteLoggedUser,getUserProfile ,getUserCount} = require('../controllers/UserController');
const { protection, allowTo } =require('../controllers/AuthController');
const User = require('../models/User');
const AuthController = require('../controllers/AuthController');
const { clearGitHubSessions } = require('../utils/githubUtils');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { parseCV } = require('../controllers/CVParserController');

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
router.get('/count', getUserCount);

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
    console.error('Error adding workspace to user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

router.get('/:userId/profile', protection, getUserProfile);
router.get('/:userId/workspaces/count',protection ,getUserWorkspacesCount);
router.post('/:userId/fix-workspaces', protection ,fixUserWorkspaces);
router.get('/verified', protection, async (req, res) => {
  try {
    const search = req.query.search || '';
    const excludeUser = req.query.excludeUser; // Get the user ID to exclude
    
    const query = { 
      isVerified: true,
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    };
    
    // If we have a user to exclude, add it to the query
    if (excludeUser) {
      query._id = { $ne: excludeUser }; // $ne means "not equal"
    }
    
    const users = await User.find(query)
      .select('name email profile_picture')
      .limit(10);
      
    res.json(users);
  } catch (error) {
    console.error('Error fetching verified users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
// Add this new route
router.get('/github/link', protection,clearGitHubSessions, AuthController.initiateGithubLinking);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/cv');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${req.user._id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'));
    }
  }
});
router.post('/parse-cv', protection, upload.single('cv'), parseCV);











module.exports = router