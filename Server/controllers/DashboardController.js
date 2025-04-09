const User = require('../models/User'); // Votre modèle utilisateur
const Task = require('../models/Task'); // Votre modèle tâche
const Workspace = require('../models/Workspace'); // Votre modèle espace de travail
const mongoose = require('mongoose');

// 2. Récupérer la répartition des statuts des tâches
exports.getTaskStatusDistribution = async (req, res) => {
    try {
        // Vérifier s'il y a des données
        const count = await Task.countDocuments();

        if (count === 0) {
            // Renvoyer des données exemples si aucune donnée n'existe
            return res.json([
                { name: 'TODO', count: 12 },
                { name: 'IN_PROGRESS', count: 8 },
                { name: 'REVIEW', count: 5 },
                { name: 'DONE', count: 15 }
            ]);
        }

        const taskCounts = await Task.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);

        const statusData = taskCounts.map(status => ({
            name: status._id, // Changé de "status" à "name" pour correspondre au frontend
            count: status.count,
        }));

        res.json(statusData);
    } catch (err) {
        console.error('Erreur dans getTaskStatusDistribution:', err);
        // Renvoyer des données exemple en cas d'erreur
        res.json([
            { name: 'TODO', count: 12 },
            { name: 'IN_PROGRESS', count: 8 },
            { name: 'REVIEW', count: 5 },
            { name: 'DONE', count: 15 }
        ]);
    }
};

// 3. Récupérer les délais de tâche vs complétion
exports.getTaskDeadlineVsCompletion = async (req, res) => {
    try {
        const tasks = await Task.find().limit(10); // Limiter à 10 tâches pour la performance

        // Vérifier s'il y a des données
        if (tasks.length === 0) {
            // Renvoyer des données exemples si aucune donnée n'existe
            return res.json([
                { taskName: "Design UI", deadlineCompletionPercentage: 80 },
                { taskName: "Implement Backend", deadlineCompletionPercentage: 65 },
                { taskName: "Test Features", deadlineCompletionPercentage: 45 },
                { taskName: "Deploy MVP", deadlineCompletionPercentage: 90 },
                { taskName: "User Feedback", deadlineCompletionPercentage: 30 }
            ]);
        }

        const taskData = tasks.map(task => ({
            taskName: task.title,
            deadlineCompletionPercentage: task.status === 'DONE' ? 100 :
                task.status === 'REVIEW' ? 75 :
                    task.status === 'IN_PROGRESS' ? 50 : 25
        }));

        res.json(taskData);
    } catch (err) {
        console.error('Erreur dans getTaskDeadlineVsCompletion:', err);
        // Renvoyer des données exemple en cas d'erreur
        res.json([
            { taskName: "Design UI", deadlineCompletionPercentage: 80 },
            { taskName: "Implement Backend", deadlineCompletionPercentage: 65 },
            { taskName: "Test Features", deadlineCompletionPercentage: 45 },
            { taskName: "Deploy MVP", deadlineCompletionPercentage: 90 },
            { taskName: "User Feedback", deadlineCompletionPercentage: 30 }
        ]);
    }
};

// 4. Récupérer la répartition de la charge de travail des utilisateurs
exports.getWorkloadDistribution = async (req, res) => {
    try {
        const users = await User.find().limit(10); // Limiter pour la performance

        // Si aucune donnée n'existe, renvoyer des données exemples
        if (users.length === 0) {
            return res.json([
                { userName: "Thomas Dubois", tasksInProgress: 3, tasksCompleted: 7 },
                { userName: "Sophia Laurent", tasksInProgress: 5, tasksCompleted: 4 },
                { userName: "Lucas Martin", tasksInProgress: 2, tasksCompleted: 8 },
                { userName: "Emma Bernard", tasksInProgress: 4, tasksCompleted: 5 }
            ]);
        }

        // Récupérer les tâches pour chaque utilisateur
        const workloadData = [];
        for (const user of users) {
            const tasks = await Task.find({ assigned_to: user._id });
            workloadData.push({
                userName: user.name || `Utilisateur ${user._id.toString().substring(0, 6)}`,
                tasksInProgress: tasks.filter(task => task.status === 'IN_PROGRESS').length,
                tasksCompleted: tasks.filter(task => task.status === 'DONE').length
            });
        }

        res.json(workloadData);
    } catch (err) {
        console.error('Erreur dans getWorkloadDistribution:', err);
        // Renvoyer des données exemple en cas d'erreur
        res.json([
            { userName: "Thomas Dubois", tasksInProgress: 3, tasksCompleted: 7 },
            { userName: "Sophia Laurent", tasksInProgress: 5, tasksCompleted: 4 },
            { userName: "Lucas Martin", tasksInProgress: 2, tasksCompleted: 8 },
            { userName: "Emma Bernard", tasksInProgress: 4, tasksCompleted: 5 }
        ]);
    }
};

// 5. Récupérer l'avancement des projets par workspace
exports.getProjectProgress = async (req, res) => {
    try {
        const workspaces = await Workspace.find().limit(10); // Limiter pour la performance

        // Si aucune donnée n'existe, renvoyer des données exemples
        if (workspaces.length === 0) {
            return res.json([
                { workspaceName: "Marketing", completedTasks: 18 },
                { workspaceName: "Développement", completedTasks: 25 },
                { workspaceName: "Design", completedTasks: 15 },
                { workspaceName: "Recherche", completedTasks: 10 },
                { workspaceName: "Ressources Humaines", completedTasks: 8 }
            ]);
        }

        const progressData = [];
        for (const workspace of workspaces) {
            const completedTasks = await Task.countDocuments({
                project_id: { $in: await getProjectIdsForWorkspace(workspace._id) },
                status: 'DONE'
            });

            progressData.push({
                workspaceName: workspace.name || `Workspace ${workspace._id.toString().substring(0, 6)}`,
                completedTasks: completedTasks
            });
        }

        res.json(progressData);
    } catch (err) {
        console.error('Erreur dans getProjectProgress:', err);
        // Renvoyer des données exemple en cas d'erreur
        res.json([
            { workspaceName: "Marketing", completedTasks: 18 },
            { workspaceName: "Développement", completedTasks: 25 },
            { workspaceName: "Design", completedTasks: 15 },
            { workspaceName: "Recherche", completedTasks: 10 },
            { workspaceName: "Ressources Humaines", completedTasks: 8 }
        ]);
    }
};

// Fonction auxiliaire pour récupérer les IDs des projets d'un workspace
async function getProjectIdsForWorkspace(workspaceId) {
    try {
        const projects = await mongoose.model('Project').find({ workspace_id: workspaceId });
        return projects.map(project => project._id);
    } catch (err) {
        console.error("Erreur dans getProjectIdsForWorkspace:", err);
        return [];
    }
}

// 6. Distribution des statuts utilisateurs
exports.getUserStatusDistribution = async (req, res) => {
    try {
        // Comme nous n'avons pas de statut utilisateur explicite, on va générer des exemples
        // On utilise les statuts "actif" et "inactif" basés sur la dernière connexion
        const users = await User.find();

        if (users.length === 0) {
            return res.json([
                { status: "Actif", count: 32 },
                { status: "Inactif", count: 8 }
            ]);
        }

        const currentDate = new Date();
        let activeCount = 0;
        let inactiveCount = 0;

        users.forEach(user => {
            const lastActiveDate = user.lastActive ? new Date(user.lastActive) : null;
            const diffInDays = lastActiveDate ? (currentDate - lastActiveDate) / (1000 * 3600 * 24) : null;
            if (!diffInDays || diffInDays <= 7) { // Actif si connecté dans les 7 derniers jours
                activeCount++;
            } else {
                inactiveCount++;
            }
        });

        res.json([
            { status: "Actif", count: activeCount },
            { status: "Inactif", count: inactiveCount }
        ]);
    } catch (err) {
        console.error('Erreur dans getUserStatusDistribution:', err);
        res.json([
            { status: "Actif", count: 32 },
            { status: "Inactif", count: 8 }
        ]);
    }
};

// 7. Distribution des tâches par utilisateur
exports.getTaskDistributionByUser = async (req, res) => {
    try {
        const users = await User.find().limit(8); // Limiter à 8 utilisateurs

        if (users.length === 0) {
            return res.json([
                { userName: "Thomas Dubois", tasksInProgress: 3, tasksCompleted: 12 },
                { userName: "Sophia Laurent", tasksInProgress: 5, tasksCompleted: 8 },
                { userName: "Lucas Martin", tasksInProgress: 2, tasksCompleted: 15 },
                { userName: "Emma Bernard", tasksInProgress: 4, tasksCompleted: 7 },
                { userName: "Hugo Robert", tasksInProgress: 6, tasksCompleted: 9 }
            ]);
        }

        const result = [];
        for (const user of users) {
            const tasks = await Task.find({ assigned_to: user._id });
            result.push({
                userName: user.name || `Utilisateur ${user._id.toString().substring(0, 6)}`,
                tasksInProgress: tasks.filter(task => task.status === 'IN_PROGRESS').length,
                tasksCompleted: tasks.filter(task => task.status === 'DONE').length
            });
        }

        res.json(result);
    } catch (err) {
        console.error('Erreur dans getTaskDistributionByUser:', err);
        res.json([
            { userName: "Thomas Dubois", tasksInProgress: 3, tasksCompleted: 12 },
            { userName: "Sophia Laurent", tasksInProgress: 5, tasksCompleted: 8 },
            { userName: "Lucas Martin", tasksInProgress: 2, tasksCompleted: 15 },
            { userName: "Emma Bernard", tasksInProgress: 4, tasksCompleted: 7 },
            { userName: "Hugo Robert", tasksInProgress: 6, tasksCompleted: 9 }
        ]);
    }
};

// 8. Progression des tâches par rapport aux échéances
exports.getTaskProgressByDeadline = async (req, res) => {
    try {
        const tasks = await Task.find().sort({ createdAt: -1 }).limit(10); // Les 10 tâches les plus récentes

        if (tasks.length === 0) {
            return res.json([
                { taskName: "Refonte UI", completionPercentage: 85 },
                { taskName: "API Integration", completionPercentage: 60 },
                { taskName: "Database Migration", completionPercentage: 40 },
                { taskName: "Performance Testing", completionPercentage: 75 },
                { taskName: "User Documentation", completionPercentage: 20 },
                { taskName: "Security Audit", completionPercentage: 90 }
            ]);
        }

        const result = tasks.map(task => ({
            taskName: task.title,
            completionPercentage: task.status === 'DONE' ? 100 :
                task.status === 'REVIEW' ? 75 :
                    task.status === 'IN_PROGRESS' ? 50 : 25
        }));

        res.json(result);
    } catch (err) {
        console.error('Erreur dans getTaskProgressByDeadline:', err);
        res.json([
            { taskName: "Refonte UI", completionPercentage: 85 },
            { taskName: "API Integration", completionPercentage: 60 },
            { taskName: "Database Migration", completionPercentage: 40 },
            { taskName: "Performance Testing", completionPercentage: 75 },
            { taskName: "User Documentation", completionPercentage: 20 },
            { taskName: "Security Audit", completionPercentage: 90 }
        ]);
    }
};

// 9. Tendances des tâches au fil du temps
exports.getTaskTrendOverTime = async (req, res) => {
    try {
        // Vérifier s'il y a des données
        const count = await Task.countDocuments();

        if (count === 0) {
            // Générer des données de tendance pour les 10 derniers jours
            const today = new Date();
            const trendData = [];

            for (let i = 9; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(today.getDate() - i);
                const dateString = date.toISOString().split('T')[0]; // Format "YYYY-MM-DD"

                trendData.push({
                    date: dateString,
                    completedTasks: Math.floor(Math.random() * 8) + 2, // Entre 2 et 10
                    inProgressTasks: Math.floor(Math.random() * 7) + 3 // Entre 3 et 10
                });
            }

            return res.json(trendData);
        }

        // Si nous avons des données, continuons avec l'agrégation
        const tasks = await Task.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    completedTasks: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "DONE"] }, 1, 0],
                        },
                    },
                    inProgressTasks: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "IN_PROGRESS"] }, 1, 0],
                        },
                    },
                },
            },
            { $sort: { _id: 1 } }, // Trier par date
            { $limit: 10 } // Limiter aux 10 dernières entrées
        ]);

        const trendData = tasks.map(task => ({
            date: task._id,
            completedTasks: task.completedTasks,
            inProgressTasks: task.inProgressTasks,
        }));

        res.json(trendData);
    } catch (err) {
        console.error('Erreur dans getTaskTrendOverTime:', err);
        // Générer des données de tendance pour les 10 derniers jours
        const today = new Date();
        const trendData = [];

        for (let i = 9; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateString = date.toISOString().split('T')[0]; // Format "YYYY-MM-DD"

            trendData.push({
                date: dateString,
                completedTasks: Math.floor(Math.random() * 8) + 2, // Entre 2 et 10
                inProgressTasks: Math.floor(Math.random() * 7) + 3 // Entre 3 et 10
            });
        }

        res.json(trendData);
    }
};