const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const app = express();
require("dotenv").config();
const cookieParser = require("cookie-parser");
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

connectDB();

const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const projectRoutes = require("./routes/projectRoutes");
const workspaceRoutes = require("./routes/WorkspaceRoutes");
const experienceRoutes = require("./routes/experienceRoutes");
const ressourceRoutes = require("./routes/ressourceRoutes");

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/experiences", experienceRoutes);
app.use("/api/ressources", ressourceRoutes);


app.get("/", (req, res) => {
  res.send("Project Management Platform Backend");
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
