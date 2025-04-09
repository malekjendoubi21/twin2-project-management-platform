// routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/DashboardController');

// Routes pour le tableau de bord
router.get('/task-status-distribution', DashboardController.getTaskStatusDistribution);
router.get('/task-deadline-vs-completion', DashboardController.getTaskDeadlineVsCompletion);
router.get('/workload-distribution', DashboardController.getWorkloadDistribution);
router.get('/project-progress', DashboardController.getProjectProgress);
router.get('/task-trend-over-time', DashboardController.getTaskTrendOverTime);
router.get('/user-status-distribution', DashboardController.getUserStatusDistribution);
router.get('/task-distribution-by-user', DashboardController.getTaskDistributionByUser);
router.get('/task-progress-by-deadline', DashboardController.getTaskProgressByDeadline);

module.exports = router;
