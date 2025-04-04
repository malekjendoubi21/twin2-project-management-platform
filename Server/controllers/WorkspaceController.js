const Workspace = require('../models/Workspace');
const User = require('../models/User');
const Invitation = require('../models/Invitation');
const { validateWorkspace } = require('../validators/WorkspaceValidator');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const notificationController = require('./notificationController');

// Create a new workspace
exports.addWorkspace = async (req, res) => {
  const { error } = validateWorkspace(req.body);
  if (error) return res.status(400).json({ errors: error.details.map(err => err.message) });

  try {
    const newWorkspace = new Workspace(req.body);
    const savedWorkspace = await newWorkspace.save();
    res.status(201).json(savedWorkspace);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all workspaces
exports.getAllWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find().populate('owner members.user projects');
    res.status(200).json(workspaces);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get a single workspace by ID
exports.getWorkspaceById = async (req, res) => {
  try {
    const query = Workspace.findById(req.params.id);
    query.populate('owner', 'name email profile_picture');

    if (req.query.populate === 'projects') {
      query.populate('projects.createdBy', 'name email');
    }

    const workspace = await query.exec();
    
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });
    res.status(200).json(workspace);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
// Update a workspace
exports.updateWorkspace = async (req, res) => {
  const { error } = validateWorkspace(req.body);
  if (error) return res.status(400).json({ errors: error.details.map(err => err.message) });

  try {
    const updatedWorkspace = await Workspace.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('owner members.user projects');
    if (!updatedWorkspace) return res.status(404).json({ message: 'Workspace not found' });
    res.status(200).json(updatedWorkspace);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete a workspace
exports.deleteWorkspace = async (req, res) => {
  try {
    const deletedWorkspace = await Workspace.findByIdAndDelete(req.params.id);
    if (!deletedWorkspace) return res.status(404).json({ message: 'Workspace not found' });
    res.status(200).json({ message: 'Workspace deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.inviteToWorkspace = async (req, res) => {
  const { email } = req.body;
  const workspaceId = req.params.id;
  
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    // Verify the workspace exists
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }
    
    // Verify the user is the workspace owner
    if (workspace.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the workspace owner can send invitations' });
    }
    
    // Check if user with this email already exists
    const existingUser = await User.findOne({ email });
    
    // Check if there's already a pending invitation for this email
    const existingInvitation = await Invitation.findOne({
      workspace: workspaceId,
      recipient_email: email,
      status: 'pending'
    });
    
    if (existingInvitation) {
      return res.status(400).json({ message: 'An invitation has already been sent to this email' });
    }
    
    // Check if user is already a member
    const isAlreadyMember = workspace.members.some(member => {
      if (existingUser && member.user.toString() === existingUser._id.toString()) {
        return true;
      }
      return false;
    });
    
    if (isAlreadyMember) {
      return res.status(400).json({ message: 'User is already a member of this workspace' });
    }
    
    // Generate token
    const token = crypto.randomBytes(20).toString('hex');
    
    // Set expiration date (48 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);
    
    // Create invitation
    const invitation = new Invitation({
      workspace: workspaceId,
      sender: req.user.id,
      recipient_email: email,
      token,
      expires_at: expiresAt
    });
    
    await invitation.save();
    
    // Add notification if the user already exists in the system
    if (existingUser) {
      console.log(`User with email ${email} found. Creating notification.`);
      
      const notificationData = {
        recipient: existingUser._id,
        type: 'invitation',
        message: `You've been invited to join the workspace "${workspace.name}"`,
        workspaceId: workspace._id,
        invitationId: invitation._id,
        actionLink: '/invitations',
        workspaceName: workspace.name
      };
      
      const notification = await notificationController.createNotification(notificationData);
      console.log('Notification created:', notification ? 'SUCCESS' : 'FAILED');
    } else {
      console.log(`No existing user found for email ${email}. Skipping notification.`);
    }
    
    // Create a Nodemailer transporter
    let transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
          user: process.env.SMTP_EMAIL,
          pass: process.env.SMTP_PASSWORD
      }
    });
    
    // Get sender information
    const sender = await User.findById(req.user.id);
    
    // Invitation URL (adjust based on your frontend setup)
// Use the CLIENT_URL from environment for your frontend
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const invitationUrl = `${clientUrl}/invitations/${token}/accept`;    
    // Email options
    let mailOptions = {
      from: `Planify <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: `Invitation to join "${workspace.name}" workspace`,
      html: `
        <h2>Workspace Invitation</h2>
        <p>Hello,</p>
        <p>${sender.name || 'Someone'} has invited you to join the "${workspace.name}" workspace on Project Management Platform.</p>
        <p>Click the link below to accept the invitation:</p>
        <a href="${invitationUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Accept Invitation</a>
        <p>Or copy and paste this URL into your browser:</p>
        <p>${invitationUrl}</p>
        <p>This invitation will expire in 48 hours.</p>
        <p>If you don't want to join, simply ignore this email.</p>
      `
    };
    
    // Send the email
    await transporter.sendMail(mailOptions);
    
    res.status(201).json({
      message: 'Invitation sent successfully',
      invitation: {
        id: invitation._id,
        email,
        workspace: workspaceId,
        token,
        expires_at: expiresAt
      },
      userId: existingUser ? existingUser._id : null
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Accept or decline invitation
exports.respondToInvitation = async (req, res) => {
  const { token } = req.params;
  const { action, userData } = req.body; // Add userData for registration if needed
  
  if (!action || !['accept', 'decline'].includes(action)) {
    return res.status(400).json({ message: 'Invalid action. Must be "accept" or "decline"' });
  }
  
  try {
    // Find the invitation by token - REMOVED populate('workspace') here
    const invitation = await Invitation.findOne({ token });
    
    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }
    
    // Check if invitation has expired
    if (invitation.expires_at < new Date()) {
      return res.status(400).json({ message: 'Invitation has expired' });
    }
    
    // Check if invitation is still pending
    if (invitation.status !== 'pending') {
      return res.status(400).json({ message: `Invitation has already been ${invitation.status}` });
    }
    
    if (action === 'decline') {
      // Update invitation status to declined
      invitation.status = 'declined';
      await invitation.save();
      return res.status(200).json({ message: 'Invitation declined successfully' });
    }
    
    // Handle acceptance
    invitation.status = 'accepted';
    await invitation.save();
    
    // Find user by email
    let user = await User.findOne({ email: invitation.recipient_email });
    
    // If user doesn't exist, check if registration data was provided
    if (!user && userData) {
      // Create a new user with the provided data
      user = new User({
        email: invitation.recipient_email,
        name: userData.name,
        password: userData.password, // Make sure to hash this!
        // Other required fields
      });
      
      await user.save();
    } else if (!user) {
      return res.status(400).json({ 
        message: 'You need to register an account with this email first',
        email: invitation.recipient_email
      });
    }
    
    // THIS IS THE FIX: We directly use invitation.workspace as the ID
    const workspace = await Workspace.findById(invitation.workspace);
    
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace no longer exists' });
    }
    
    // Check if user is already a member
    const isAlreadyMember = workspace.members.some(member => 
      member.user && member.user.toString() === user._id.toString()
    );
    
    console.log('User:', user._id, 'Is already member:', isAlreadyMember);
    
    if (!isAlreadyMember) {
      // Add user as member with viewer role
      workspace.members.push({
        user: user._id,
        role: 'viewer'
      });
      
      // Save changes to workspace
      await workspace.save();
      console.log('User added to workspace members');
    }
    
    res.status(200).json({ 
      message: 'Invitation accepted successfully',
      workspace: workspace._id // Send just the ID, not the whole object
    });
  } catch (err) {
    console.error('Error responding to invitation:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all pending invitations for a workspace
exports.getWorkspaceInvitations = async (req, res) => {
  const workspaceId = req.params.id;
  
  try {
    // Verify the workspace exists
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }
    
    // Verify the user is the workspace owner
    if (workspace.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the workspace owner can view invitations' });
    }
    
    // Get all invitations for this workspace
    const invitations = await Invitation.find({ workspace: workspaceId })
      .populate('sender', 'name email')
      .select('-token');
      
    res.status(200).json(invitations);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// controllers/WorkspaceController.js
exports.createProject = async (req, res) => {
  try {
    const workspace = await Workspace.findByIdAndUpdate(
      req.params.workspaceId,
      { $push: { projects: {
        name: req.body.name,
        description: req.body.description,
        createdBy: req.user._id
      }}},
      { new: true, runValidators: true }
    ).populate('projects.createdBy', 'name email');

    const newProject = workspace.projects[workspace.projects.length - 1];
    
    res.status(201).json(newProject);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create project', details: err.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
      const workspace = await Workspace.findById(req.params.workspaceId)
          .select('projects')
          .lean();

      if (!workspace) {
          return res.status(404).json({ error: 'Workspace not found' });
      }

      res.json(workspace.projects.map(project => ({
          _id: project._id,
          name: project.name,
          description: project.description,
          createdAt: project.createdAt
      })));

  } catch (err) {
      console.error('Error fetching projects:', err);
      res.status(500).json({ 
          error: 'Failed to fetch projects',
          details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
  }
};
exports.verifyInvitation = async (req, res) => {
  const { token } = req.params;
  
  try {
    // Find the invitation
    const invitation = await Invitation.findOne({ token })
      .populate('workspace', 'name description')
      .populate('sender', 'name email');
      
    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }
    
    // Check if expired
    if (invitation.expires_at < new Date()) {
      return res.status(400).json({ message: 'This invitation has expired' });
    }
    
    // Check if already used
    if (invitation.status !== 'pending') {
      return res.status(400).json({ message: `This invitation has already been ${invitation.status}` });
    }
    
    // Return invitation details
    res.json({
      workspace: {
        id: invitation.workspace._id,
        name: invitation.workspace.name,
        description: invitation.workspace.description
      },
      sender: invitation.sender,
      email: invitation.recipient_email,
      expiresAt: invitation.expires_at
    });
  } catch (error) {
    console.error('Error verifying invitation:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
// Get all workspaces for which the user has access
exports.getUserWorkspaces = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find workspaces where user is either the owner OR a member
    const workspaces = await Workspace.find({
      $or: [
        { owner: userId },
        { 'members.user': userId }
      ]
    }).populate('owner', 'name email');
    
   
    res.status(200).json(workspaces);
  } catch (err) {
    console.error('Error fetching user workspaces:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
exports.getWorkspaceMembers = async (req, res) => {
  try {
    const { id: workspaceId } = req.params;
    
    // Find workspace and populate member details
    const workspace = await Workspace.findById(workspaceId)
      .populate('members.user', 'name email profile_picture');
    
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }
    
    // Also get the owner's details
    const owner = await User.findById(workspace.owner).select('name email profile_picture');
    
    // Format the response to include the owner and all members with their roles
    const allMembers = [
      {
        ...owner.toObject(),
        _id: owner._id.toString(),
        role: 'owner',
        isOwner: true
      },
      ...workspace.members.map(member => ({
        ...member.user.toObject(),
        _id: member.user._id.toString(),
        role: member.role
      }))
    ];
    
    res.status(200).json(allMembers);
    
  } catch (err) {
    console.error('Error fetching workspace members:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update a member's role
exports.updateMemberRole = async (req, res) => {
  try {
    const { id: workspaceId, memberId } = req.params;
    const { role } = req.body;
    
    if (!['admin', 'editor', 'viewer'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be admin, editor, or viewer' });
    }
    
    const workspace = await Workspace.findById(workspaceId);
    
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }
    
    // Check if the current user is the owner or an admin
    const isOwner = workspace.owner.toString() === req.user.id;
    const currentUserMember = workspace.members.find(m => m.user.toString() === req.user.id);
    const isAdmin = currentUserMember && currentUserMember.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'You do not have permission to update member roles' });
    }
    
    // Find the member and update their role
    const memberIndex = workspace.members.findIndex(m => m.user.toString() === memberId);
    
    if (memberIndex === -1) {
      return res.status(404).json({ message: 'Member not found in this workspace' });
    }
    
    workspace.members[memberIndex].role = role;
    await workspace.save();
    
    res.status(200).json({ message: 'Member role updated successfully' });
    
  } catch (err) {
    console.error('Error updating member role:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Remove a member from workspace
exports.removeMember = async (req, res) => {
  try {
    const { id: workspaceId, memberId } = req.params;
    
    const workspace = await Workspace.findById(workspaceId);
    
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }
    
    // Check if the current user is the owner or an admin
    const isOwner = workspace.owner.toString() === req.user.id;
    const currentUserMember = workspace.members.find(m => m.user.toString() === req.user.id);
    const isAdmin = currentUserMember && currentUserMember.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'You do not have permission to remove members' });
    }
    
    // Cannot remove the workspace owner
    if (workspace.owner.toString() === memberId) {
      return res.status(400).json({ message: 'Cannot remove the workspace owner' });
    }
    
    // Filter out the member
    workspace.members = workspace.members.filter(m => m.user.toString() !== memberId);
    await workspace.save();
    
    res.status(200).json({ message: 'Member removed successfully' });
    
  } catch (err) {
    console.error('Error removing workspace member:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
exports.getUserInvitations = async (req, res) => {
  try {
    // Find pending invitations for the current user's email
    const invitations = await Invitation.find({
      recipient_email: req.user.email,
      status: 'pending'
    })
    .populate('workspace', 'name description')
    .populate('sender', 'name email');
    
    res.json(invitations);
  } catch (error) {
    console.error('Error fetching user invitations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
exports.respondToInvitationById = async (req, res) => {
  const { invitationId } = req.params;
  const { action } = req.body;
  
  if (!action || !['accept', 'decline'].includes(action)) {
    return res.status(400).json({ message: 'Invalid action. Must be "accept" or "decline"' });
  }
  
  try {
    // Find the invitation by ID
    const invitation = await Invitation.findById(invitationId);
    
    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }
    
    // Verify the invitation is for the authenticated user
    if (invitation.recipient_email !== req.user.email) {
      return res.status(403).json({ message: 'This invitation is not for you' });
    }
    
    // Check if invitation has expired
    if (invitation.expires_at < new Date()) {
      return res.status(400).json({ message: 'Invitation has expired' });
    }
    
    // Check if invitation is still pending
    if (invitation.status !== 'pending') {
      return res.status(400).json({ message: `Invitation has already been ${invitation.status}` });
    }
    
    if (action === 'decline') {
      // Update invitation status to declined
      invitation.status = 'declined';
      await invitation.save();
      return res.status(200).json({ message: 'Invitation declined successfully' });
    }
    
    // Handle acceptance
    invitation.status = 'accepted';
    await invitation.save();
    
    // Add user to workspace
    const workspace = await Workspace.findById(invitation.workspace);
    
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace no longer exists' });
    }
    
    // Check if user is already a member
    const isAlreadyMember = workspace.members.some(member => 
      member.user && member.user.toString() === req.user.id
    );
    
    if (!isAlreadyMember) {
      // Add user as member with viewer role
      workspace.members.push({
        user: req.user.id,
        role: 'viewer'
      });
      
      // Save changes to workspace
      await workspace.save();
    }
    
    res.status(200).json({ 
      message: 'Invitation accepted successfully',
      workspace: workspace._id
    });
  } catch (error) {
    console.error('Error responding to invitation:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};