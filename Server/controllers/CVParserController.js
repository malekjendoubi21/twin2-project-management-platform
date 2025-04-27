const path = require('path');
const { spawn } = require('child_process');
const User = require('../models/User');
const Skill = require('../models/Skills');
const Experience = require('../models/Experience');
const Certification = require('../models/Certifications');

/**
 * Parse uploaded CV and extract information using Python script
 */
exports.parseCV = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No CV file uploaded' });
  }

  try {
    const userId = req.user._id;
    const filePath = req.file.path;
    const fileType = path.extname(filePath).toLowerCase();
    
    // Update this path to point to the correct location of your Python script
// Update this path to point to the correct location of your Python script
const pythonScriptPath = path.join(process.cwd(), '..', 'cv_parser_ocr.py'); 
    console.log('Python script path:', pythonScriptPath);
    console.log('File path:', filePath);
    console.log('File type:', fileType);
    const pythonVenvPath = path.join(process.cwd(), '..', 'venv', 'Scripts', 'python.exe');

    // Call Python script for CV parsing
    const pythonProcess = spawn(pythonVenvPath, [
        pythonScriptPath,
        filePath,
        fileType,
        userId.toString()
      ]);

    let dataString = '';
    let errorString = '';

    pythonProcess.stdout.on('data', (data) => {
        dataString += data.toString();
        console.log(`CV Parser output: ${data}`); // Add this to see live output
      });

    pythonProcess.stderr.on('data', (data) => {
      errorString += data.toString();
      console.error(`CV Parser Error: ${data}`);
    });

    pythonProcess.on('close', async (code) => {
      if (code !== 0) {
        console.error(`CV Parser process exited with code ${code}`);
        console.error(`Error: ${errorString}`);
        return res.status(500).json({ 
          success: false,
          message: 'Error processing CV'
        });
      }

      try {
        // Parse the JSON output from Python script
        const parsedData = JSON.parse(dataString);
        console.log('Extracted CV data:', JSON.stringify(parsedData, null, 2));
        
        // Update user profile with extracted data
        const user = await User.findById(userId);
        
        // Update basic profile info
        if (parsedData.fullName) user.name = parsedData.fullName;
        if (parsedData.email) user.email = parsedData.email;
        if (parsedData.phone) user.phone_number = parsedData.phone;
        if (parsedData.bio) user.bio = parsedData.bio;
        
        // Update skills
        if (parsedData.skills && Array.isArray(parsedData.skills)) {
          // Add skills to user's skills array
          user.skills = [...new Set([...user.skills, ...parsedData.skills])];
          
          // Also create Skill documents for each extracted skill
          for (const skillName of parsedData.skills) {
            // Check if skill already exists
            const existingSkill = await Skill.findOne({ 
              userId: userId,
              name: skillName
            });
            
            if (!existingSkill) {
              await Skill.create({
                name: skillName,
                userId: userId,
                category: 'Technical', // Default category
                description: `Extracted from CV: ${skillName}`,
                tags: 75 // Default proficiency
              });
            }
          }
        }
        
        // Save user changes
        await user.save();
        
        // Add experiences if available
        if (parsedData.experiences && Array.isArray(parsedData.experiences)) {
          for (const exp of parsedData.experiences) {
            // Check if a similar experience already exists
            const existingExp = await Experience.findOne({
              userId: userId,
              job_title: exp.title,
              company: exp.company
            });
            
            if (!existingExp) {
              await Experience.create({
                userId: userId,
                job_title: exp.title,
                company: exp.company,
                employment_type: exp.type || 'Temps plein',
                start_date: exp.startDate || new Date(),
                end_date: exp.endDate,
                is_current: !exp.endDate,
                location: exp.location || '',
                description: exp.description || '',
                location_type: exp.locationType || 'Sur place'
              });
            }
          }
        }
        
        // Add certifications if available
        if (parsedData.certifications && Array.isArray(parsedData.certifications)) {
          for (const cert of parsedData.certifications) {
            // Check if a similar certification already exists
            const existingCert = await Certification.findOne({
              userId: userId,
              certifications_name: cert.name
            });
            
            if (!existingCert) {
              await Certification.create({
                userId: userId,
                certifications_name: cert.name,
                issued_by: cert.issuer || '',
                obtained_date: cert.date || new Date(),
                description: cert.description || ''
              });
            }
          }
        }

        // Return success response
        res.status(200).json({
          success: true,
          message: 'CV processed successfully',
          extractedData: {
            name: user.name,
            skillCount: parsedData.skills?.length || 0,
            experienceCount: parsedData.experiences?.length || 0,
            certificationCount: parsedData.certifications?.length || 0
          }
        });
        
      } catch (jsonError) {
        console.error('Error parsing CV data:', jsonError);
        res.status(500).json({ 
          success: false,
          message: 'Error processing extracted CV data'
        });
      }
    });

  } catch (error) {
    console.error('CV parsing error:', error);
    console.error('Error parsing CV data:', jsonError);
    console.error('Raw output:', dataString);
    res.status(500).json({ 
      success: false,
      message: 'Server error during CV processing'
    });
  }
};