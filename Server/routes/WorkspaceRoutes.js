const express = require('express');
const router = express.Router();
const workspaceController = require('../controllers/WorkspaceController');

router.post('/addWorkspace', workspaceController.addWorkspace);
router.get('/', workspaceController.getAllWorkspaces);
router.get('/:id', workspaceController.getWorkspaceById);
router.put('/updateWorkspace/:id', workspaceController.updateWorkspace);
router.delete('/:id', workspaceController.deleteWorkspace);

module.exports = router;
