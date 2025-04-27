const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const app = express();
const mongoose = require('mongoose');
const Project = require('./models/Project');
const Ressource = require('./models/Ressource');
const Workspace = require('./models/Workspace');
const axios = require('axios'); // Ajout de l'importation d'axios
require("dotenv").config();
const cookieParser = require("cookie-parser");

// Initialisation d'Express
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configuration CORS unique
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL || "http://localhost:5173",
      "http://localhost:3000"
    ],
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Connexion à MongoDB (appel unique)
connectDB();

// Importation des routes
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const projectRoutes = require("./routes/projectRoutes");
const workspaceRoutes = require("./routes/WorkspaceRoutes");
const experienceRoutes = require("./routes/experienceRoutes");
const ressourceRoutes = require("./routes/ressourceRoutes");
const certificationRoutes = require('./routes/certificationsRoutes');
const skillsRoutes = require('./routes/skillsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const messageRoutes = require('./routes/messageRoutes');

// Utilisation des routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api", taskRoutes);
app.use('/api', messageRoutes);
app.use("/api/experiences", experienceRoutes);
app.use("/api/ressources", ressourceRoutes);
app.use('/api/certifications', certificationRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Route pour le matching de profils (non modifiée)
app.post('/api/match-profiles', async (req, res) => {
  const { workspace_id, task_description } = req.body;
  
  try {
    const path = require('path');
    const scriptPath = path.resolve(__dirname, '../Moetaz.py');
    const pythonPath = 'C:\\Users\\moeta\\OneDrive\\Desktop\\pi\\project-management-platform\\venv\\Scripts\\python.exe';
    
    console.log(`Running Python script with:`, {
      workspace_id,
      task_description,
      scriptPath,
      pythonPath
    });
    
    const { spawn } = require('child_process');
    const python = spawn(pythonPath, [
      scriptPath,
      '--workspace_id', workspace_id,
      '--task_description', task_description
    ]);
    
    let matchData = '';
    let errorData = '';
    
    python.stdout.on('data', (data) => {
      matchData += data.toString();
    });
    
    python.stderr.on('data', (data) => {
      errorData += data.toString();
      console.error(`Python script log: ${data}`);
    });
    
    python.on('close', (code) => {
      if (code !== 0) {
        console.error(`Python process exited with code ${code}`);
        return res.status(500).json({ 
          error: 'Profile matching failed', 
          details: errorData || 'Unknown error' 
        });
      }
      
      try {
        let jsonStr = matchData.trim();
        if (jsonStr.includes('[{') && jsonStr.includes('}]')) {
          const jsonStart = jsonStr.indexOf('[{');
          const jsonEnd = jsonStr.lastIndexOf('}]') + 2;
          jsonStr = jsonStr.substring(jsonStart, jsonEnd);
        }
        
        const results = JSON.parse(jsonStr);
        res.json(results);
      } catch (error) {
        console.error('Failed to parse Python output:', error);
        console.error('Raw output:', matchData);
        return res.status(500).json({ 
          error: 'Failed to parse matching results',
          details: 'Check server logs for the raw output' 
        });
      }
    });
  } catch (error) {
    console.error('Error executing Python script:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route corrigée pour prédire le retard d'un projet spécifique
app.post('/api/projects/:id/predict-delay', async (req, res) => {
  try {
    const projectId = req.params.id;
    console.log('Project ID reçu:', projectId);

    // Vérifier si le projet existe dans MongoDB
    const project = await Project.findById(projectId);
    console.log('Projet trouvé:', project);
    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    // Envoyer une requête POST à Flask avec uniquement le projectId
    console.log('Envoi de la requête à Flask avec:', { projectId });
    const flaskResponse = await axios.post('http://127.0.0.1:5000/predict', {
      projectId: projectId
    });

    // Renvoyer la réponse de Flask au frontend
    console.log('Réponse de Flask:', flaskResponse.data);
    res.status(200).json(flaskResponse.data);
  } catch (error) {
    console.error('Erreur complète lors de la prédiction via Flask:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la prédiction', 
      error: error.message, 
      stack: error.stack 
    });
  }
});

// Route de base
app.get("/", (req, res) => {
  res.send("Project Management Platform Backend");
});

// Initialisation du serveur avec Socket.IO
const http = require('http');
const { initializeSocket } = require('./Socket');
const server = http.createServer(app);
initializeSocket(server);

// Utilisation du port 3000 pour cohérence avec les tests précédents
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});