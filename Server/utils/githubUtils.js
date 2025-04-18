const axios = require('axios');

// Function to invalidate GitHub session
exports.clearGitHubSessions = async (req, res, next) => {
  try {
    // Set headers to clear cookies
    res.setHeader('Clear-Site-Data', '"cookies", "storage"');
    
    // Force redirect to GitHub logout first
    if (req.query.logout === 'true') {
      // Calculate the return URL which should point to our GitHub link endpoint but without the logout parameter
      const baseUrl = `${process.env.BACKEND_URL}/api/users/github/link`;
      const timestamp = Date.now();
      const returnUrl = `${baseUrl}?timestamp=${timestamp}&force_login=true`;
      
      // Redirect to GitHub's logout page with a return URL
      return res.redirect(`https://github.com/logout?return_to=${encodeURIComponent(returnUrl)}`);
    }
    
    next();
  } catch (error) {
    console.error('Error clearing GitHub sessions:', error);
    next();
  }
};