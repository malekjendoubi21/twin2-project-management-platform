const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const { protection } =require('../controllers/AuthController');

// Get messages for a workspace
router.get('/workspaces/:workspaceId/messages', protection, messageController.getWorkspaceMessages);

// Send a new message
router.post('/workspaces/:workspaceId/messages', protection, messageController.sendMessage);

// Mark messages as read
router.post('/workspaces/:workspaceId/messages/read', protection, messageController.markAsRead);
router.get('/workspaces/:workspaceId/messages/unread/count', protection, messageController.getUnreadCount);
module.exports = router;