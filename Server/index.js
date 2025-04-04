const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const app = express();
require("dotenv").config();
const cookieParser = require("cookie-parser");
app.use(cookieParser());
const fileUpload = require('express-fileupload');
app.use(express.json({ limit: '50mb' })); // Increase from default ~1MB to 50MB
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST",'PATCH', "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
  fileUpload({
    useTempFiles: true,
    limits: { fileSize: 10 * 1024 * 1024 }, // 5 MB limit
    responseOnLimit: 'File size limit has been reached',
  })

);

connectDB();

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

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/experiences", experienceRoutes);
app.use("/api/ressources", ressourceRoutes);
app.use('/api/certifications', certificationRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/notifications', notificationRoutes);

app.get("/", (req, res) => {
  res.send("Project Management Platform Backend");
});

const http = require('http');
const { initializeSocket } = require('./Socket');

const server = http.createServer(app);

initializeSocket(server);

const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
