const express = require('express');
const router = express.Router();
const workspaceController = require('../controllers/WorkspaceController');
const { protection, allowTo } =require('../controllers/AuthController');

router.post('/addWorkspace', workspaceController.addWorkspace);
router.get('/', workspaceController.getAllWorkspaces);
router.get('/:id', workspaceController.getWorkspaceById);
router.put('/updateWorkspace/:id', workspaceController.updateWorkspace);
router.delete('/:id', workspaceController.deleteWorkspace);

// Invitation routes
router.post('/:id/invite', protection, workspaceController.inviteToWorkspace);
router.get('/:id/invitations',  workspaceController.getWorkspaceInvitations);
router.post('/invitations/:token/respond',  workspaceController.respondToInvitation);


module.exports = router;
