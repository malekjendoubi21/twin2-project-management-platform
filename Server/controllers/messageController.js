const Message = require('../models/Message');
const Workspace = require('../models/Workspace');
const socketUtils = require('../Socket');

// Get messages for a workspace
exports.getWorkspaceMessages = async (req, res) => {
  const { workspaceId } = req.params;
  const { limit = 50, before } = req.query;
  
  try {
    // Check if user is a member of the workspace
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }
    
    // Check if user is a member of the workspace
    const isMember = workspace.members.some(member => 
      member.user.toString() === req.user.id
    );
    
    const isOwner = workspace.owner.toString() === req.user.id;
    
    if (!isMember && !isOwner) {
      return res.status(403).json({ message: 'You are not a member of this workspace' });
    }
    
    // Query to fetch messages
    let query = { workspace: workspaceId };
    
    // If "before" parameter is provided, fetch messages before that timestamp
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }
    
    // Fetch messages with populated sender information
    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('sender', 'name email profile_picture')
      .lean();
    
    // Return messages in ascending order for chat display
    res.json(messages.reverse());
    
  } catch (error) {
    console.error('Error fetching workspace messages:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Send a new message
// Update the sendMessage function to properly handle real-time messages

// Fix the authorization check in the sendMessage function

exports.sendMessage = async (req, res) => {
  const { workspaceId } = req.params;
  const { content } = req.body;
  
  if (!content || !content.trim()) {
    return res.status(400).json({ message: 'Message content is required' });
  }
  
  try {
    // Check if workspace exists
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }
    
    // Fix the authorization check to properly verify workspace membership
    const userId = req.user._id.toString();
    const isOwner = workspace.owner.toString() === userId;
    
    // Check if user is a member of the workspace
    // Handle both array of objects and array of IDs
    let isMember = false;
    
    if (workspace.members) {
      // Check if members is an array of objects with a user field
      if (workspace.members[0] && typeof workspace.members[0] === 'object' && workspace.members[0].user) {
        isMember = workspace.members.some(member => 
          member.user.toString() === userId
        );
      } 
      // Check if members is an array of user IDs
      else {
        isMember = workspace.members.some(memberId => 
          memberId.toString() === userId
        );
      }
    }

    if (!isMember && !isOwner) {
      return res.status(403).json({ 
        message: 'You are not a member of this workspace',
        userId,
        members: workspace.members,
        owner: workspace.owner
      });
    }
    
    // Create and save the message
    const newMessage = new Message({
      workspace: workspaceId,
      sender: req.user._id,
      content,
      read_by: [{ user: req.user._id }] // Sender has read the message
    });
    
    await newMessage.save();
    
    // Populate sender information
    await newMessage.populate('sender', 'name email profile_picture');
    
    // Convert to plain object to ensure proper socket transmission
    const messageToReturn = newMessage.toObject();
    
    // Emit the message to all workspace members via socket
    socketUtils.getIO().to(`workspace:${workspaceId}`).emit('new-message', messageToReturn);
    
    res.status(201).json(messageToReturn);
    
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
  const { workspaceId } = req.params;
  const { messageIds } = req.body;
  
  if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
    return res.status(400).json({ message: 'Message IDs are required' });
  }
  
  try {
    // Update each message to mark as read by the current user
    await Message.updateMany(
      {
        _id: { $in: messageIds },
        workspace: workspaceId,
        'read_by.user': { $ne: req.user.id }
      },
      {
        $push: { read_by: { user: req.user.id, read_at: new Date() } }
      }
    );
    
    res.status(200).json({ message: 'Messages marked as read' });
    
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
exports.getUnreadCount = async (req, res) => {
  const { workspaceId } = req.params;
  
  try {
    // Check if user is a member of the workspace
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }
    
    // Check if user is a member of the workspace
    const isMember = workspace.members.some(member => 
      member.user.toString() === req.user.id
    );
    
    const isOwner = workspace.owner.toString() === req.user.id;
    
    if (!isMember && !isOwner) {
      return res.status(403).json({ message: 'You are not a member of this workspace' });
    }
    
    // Count unread messages (where current user is not in read_by)
    const count = await Message.countDocuments({
      workspace: workspaceId,
      sender: { $ne: req.user.id }, // Not sent by current user
      'read_by.user': { $ne: req.user.id } // Not read by current user
    });
    
    res.json({ count });
    
  } catch (error) {
    console.error('Error getting unread message count:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};