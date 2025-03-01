const Workspace = require('../models/Workspace');
const User = require('../models/User');
const Invitation = require('../models/Invitation');
const { validateWorkspace } = require('../validators/WorkspaceValidator');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

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
    const workspace = await Workspace.findById(req.params.id).populate('owner members.user projects');
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
    const invitationUrl = `http://yourdomain.com/invitations/${token}/respond`;
    
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
      }
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
    // Find the invitation by token
    const invitation = await Invitation.findOne({ token }).populate('workspace');
    
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
      // Make sure to validate and hash password if needed
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
    
    // Add user to workspace members
    const workspace = invitation.workspace;
    const isAlreadyMember = workspace.members.some(member => 
      member.user.toString() === user._id.toString()
    );
    
    if (!isAlreadyMember) {
      workspace.members.push({
        user: user._id,
        role: 'viewer' // Default role for invited members
      });
      
      await workspace.save();
    }
    
    res.status(200).json({ 
      message: 'Invitation accepted successfully',
      workspace: {
        id: workspace._id,
        name: workspace.name
      }
    });
  } catch (err) {
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

