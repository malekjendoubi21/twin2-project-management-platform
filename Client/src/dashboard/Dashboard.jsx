import api from '../utils/Api';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHome, FiUser, FiSettings, FiLogOut, FiList, FiActivity, FiPieChart, FiBarChart2 } from 'react-icons/fi';
import AdminProfile from "./AdminProfile.jsx";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, ArcElement } from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
    LineElement,
    ArcElement
);

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [workspaceCount, setWorkspaceCount] = useState(0);
    const [userCount, setUserCount] = useState(0);
    const [projectCount, setProjectCount] = useState(0);
    const [taskStatusDistribution, setTaskStatusDistribution] = useState([]);
    const [taskDeadlineVsCompletion, setTaskDeadlineVsCompletion] = useState([]);
    const [userStatusDistribution, setUserStatusDistribution] = useState([]);
    const [workspaceProgress, setWorkspaceProgress] = useState([]);
    const [taskDistributionByUser, setTaskDistributionByUser] = useState([]);
    const [taskProgressByDeadline, setTaskProgressByDeadline] = useState([]);
    const [taskTrendOverTime, setTaskTrendOverTime] = useState([]);
    const [dashboardStats, setDashboardStats] = useState({
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0
    });

    // Couleurs personnalisées pour une meilleure expérience visuelle
    const chartColors = {
        primary: ['rgba(101, 116, 205, 0.8)', 'rgba(101, 116, 205, 0.6)', 'rgba(101, 116, 205, 0.4)'],
        secondary: ['rgba(229, 62, 62, 0.8)', 'rgba(229, 62, 62, 0.6)', 'rgba(229, 62, 62, 0.4)'],
        accent: ['rgba(180, 83, 9, 0.8)', 'rgba(180, 83, 9, 0.6)', 'rgba(180, 83, 9, 0.4)'],
        success: ['rgba(72, 187, 120, 0.8)', 'rgba(72, 187, 120, 0.6)', 'rgba(72, 187, 120, 0.4)'],
        warning: ['rgba(237, 137, 54, 0.8)', 'rgba(237, 137, 54, 0.6)', 'rgba(237, 137, 54, 0.4)'],
        info: ['rgba(90, 103, 216, 0.8)', 'rgba(90, 103, 216, 0.6)', 'rgba(90, 103, 216, 0.4)'],
        status: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
    };

    // Options globales des graphiques
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: 'white'
                }
            },
            title: {
                display: true,
                color: 'white',
                font: {
                    size: 16
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                titleColor: 'white',
                bodyColor: 'white',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderWidth: 1
            }
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.7)'
                }
            },
            y: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.7)'
                }
            }
        }
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get('/api/users/getMe');
                setUser(response.data);
            } catch (error) {
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [navigate]);

    const fetchWorkspaceCount = async () => {
        try {
            const response = await api.get('/api/workspaces/count');
            setWorkspaceCount(response.data.count);
        } catch (error) {
            console.error('Error fetching workspace count:', error);
        }
    };

    const fetchUserCount = async () => {
        try {
            const response = await api.get('/api/users/count');
            setUserCount(response.data.count);
        } catch (error) {
            console.error('Error fetching user count:', error);
        }
    };

    const fetchProjectCount = async () => {
        try {
            const response = await api.get('/api/projects/count');
            setProjectCount(response.data.count);
        } catch (error) {
            console.error('Error fetching project count:', error);
        }
    };

    const fetchTaskStatusDistribution = async () => {
        try {
            const response = await api.get('/api/dashboard/task-status-distribution');
            setTaskStatusDistribution(response.data);

            // Calculer des statistiques globales sur les tâches
            const totalTasks = response.data.reduce((sum, item) => sum + item.count, 0);
            const completedTasks = response.data.find(item => item.name === 'DONE')?.count || 0;
            const pendingTasks = totalTasks - completedTasks;

            setDashboardStats({
                totalTasks,
                completedTasks,
                pendingTasks
            });
        } catch (error) {
            console.error('Error fetching task status distribution:', error);
        }
    };

    const fetchTaskDeadlineVsCompletion = async () => {
        try {
            const response = await api.get('/api/dashboard/task-deadline-vs-completion');
            setTaskDeadlineVsCompletion(response.data);
        } catch (error) {
            console.error('Error fetching task deadline vs completion:', error);
        }
    };

    const fetchUserStatusDistribution = async () => {
        try {
            const response = await api.get('/api/dashboard/user-status-distribution');
            setUserStatusDistribution(response.data);
        } catch (error) {
            console.error('Error fetching user status distribution:', error);
        }
    };

    const fetchWorkspaceProgress = async () => {
        try {
            const response = await api.get('/api/dashboard/workspace-progress');
            setWorkspaceProgress(response.data);
        } catch (error) {
            console.error('Error fetching workspace progress:', error);
        }
    };

    const fetchTaskDistributionByUser = async () => {
        try {
            const response = await api.get('/api/dashboard/task-distribution-by-user');
            setTaskDistributionByUser(response.data);
        } catch (error) {
            console.error('Error fetching task distribution by user:', error);
        }
    };

    const fetchTaskProgressByDeadline = async () => {
        try {
            const response = await api.get('/api/dashboard/task-progress-by-deadline');
            setTaskProgressByDeadline(response.data);
        } catch (error) {
            console.error('Error fetching task progress by deadline:', error);
        }
    };

    const fetchTaskTrendOverTime = async () => {
        try {
            const response = await api.get('/api/dashboard/task-trend-over-time');
            setTaskTrendOverTime(response.data);
        } catch (error) {
            console.error('Error fetching task trend over time:', error);
        }
    };

    useEffect(() => {
        fetchWorkspaceCount();
        fetchUserCount();
        fetchProjectCount();
        fetchTaskStatusDistribution();
        fetchTaskDeadlineVsCompletion();
        fetchUserStatusDistribution();
        fetchWorkspaceProgress();
        fetchTaskDistributionByUser();
        fetchTaskProgressByDeadline();
        fetchTaskTrendOverTime();
    }, []);

    const handleLogout = async () => {
        try {
            await api.get('/api/auth/logout');
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-[#0C0A1F] to-[#3C0B64]">
            <div className="text-white text-xl font-semibold animate-pulse flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Chargement du tableau de bord...
            </div>
        </div>
    );

    // Configuration des graphiques avec nos couleurs et options personnalisées
    const taskStatusChart = {
        labels: taskStatusDistribution.map(status => status.name),
        datasets: [{
            label: 'Répartition des statuts des tâches',
            data: taskStatusDistribution.map(status => status.count),
            backgroundColor: chartColors.status,
            borderColor: chartColors.status,
            borderWidth: 1,
        }],
    };

    const taskDeadlineVsCompletionChart = {
        labels: taskDeadlineVsCompletion.map(item => item.taskName),
        datasets: [
            {
                label: 'Pourcentage de complétion',
                data: taskDeadlineVsCompletion.map(item => item.deadlineCompletionPercentage),
                backgroundColor: chartColors.primary[0],
                borderColor: chartColors.primary[0],
                borderWidth: 2,
            },
        ],
    };

    const userStatusChart = {
        labels: userStatusDistribution.map(status => status.status),
        datasets: [{
            label: 'Répartition des statuts utilisateurs',
            data: userStatusDistribution.map(status => status.count),
            backgroundColor: [chartColors.info[0], chartColors.warning[0]],
            borderColor: [chartColors.info[0], chartColors.warning[0]],
            borderWidth: 1,
        }],
    };

    const workspaceProgressChart = {
        labels: workspaceProgress.map(workspace => workspace.workspaceName),
        datasets: [{
            label: 'Tâches complétées par espace de travail',
            data: workspaceProgress.map(workspace => workspace.completedTasks),
            backgroundColor: chartColors.success[0],
            borderColor: chartColors.success[0],
            borderWidth: 1,
        }],
    };

    const taskDistributionByUserChart = {
        labels: taskDistributionByUser.map(user => user.userName),
        datasets: [
            {
                label: 'Tâches en cours',
                data: taskDistributionByUser.map(user => user.tasksInProgress),
                backgroundColor: chartColors.warning[0],
                borderColor: chartColors.warning[0],
                borderWidth: 1,
            },
            {
                label: 'Tâches terminées',
                data: taskDistributionByUser.map(user => user.tasksCompleted),
                backgroundColor: chartColors.success[0],
                borderColor: chartColors.success[0],
                borderWidth: 1,
            }
        ],
    };

    const taskProgressByDeadlineChart = {
        labels: taskProgressByDeadline.map(task => task.taskName),
        datasets: [{
            label: 'Progression des tâches (%)',
            data: taskProgressByDeadline.map(task => task.completionPercentage),
            backgroundColor: chartColors.info[0],
            borderColor: chartColors.info[0],
            borderWidth: 1,
        }],
    };

    const taskTrendOverTimeChart = {
        labels: taskTrendOverTime.map(item => item.date),
        datasets: [
            {
                label: 'Tâches terminées',
                data: taskTrendOverTime.map(item => item.completedTasks),
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: chartColors.success[0],
                borderWidth: 2,
                fill: true,
                tension: 0.4,
            },
            {
                label: 'Tâches en cours',
                data: taskTrendOverTime.map(item => item.inProgressTasks),
                backgroundColor: 'rgba(255, 206, 86, 0.2)',
                borderColor: chartColors.warning[0],
                borderWidth: 2,
                fill: true,
                tension: 0.4,
            },
        ],
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-r from-[#0C0A1F] to-[#3C0B64] font-poppins">
            {/* Sidebar avec design amélioré */}
            <aside className="w-64 bg-slate-900 text-white shadow-md min-h-screen p-5 flex flex-col">
                <div className="mb-10">
                    <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">ProjectFlow</h2>
                    <p className="text-xs text-gray-400">Tableau de bord administrateur</p>
                </div>

                <nav className="flex-grow">
                    <ul className="space-y-2">
                        <li>
                            <Link to="/dashboard" className="flex items-center p-3 bg-purple-600 text-white rounded-md shadow-md">
                                <FiHome className="mr-2" /> Dashboard
                            </Link>
                        </li>
                        <li>
                            <Link to="/dashboard/listusers" className="flex items-center p-3 hover:bg-purple-600 hover:bg-opacity-50 rounded-md transition-all duration-200">
                                <FiList className="mr-2" /> Liste Utilisateurs
                            </Link>
                        </li>
                        <li>
                            <Link to="/dashboard/AdminProfile" className="flex items-center p-3 hover:bg-purple-600 hover:bg-opacity-50 rounded-md transition-all duration-200">
                                <FiUser className="mr-2" /> Profil
                            </Link>
                        </li>
                        <li>
                            <Link to="/settings" className="flex items-center p-3 hover:bg-purple-600 hover:bg-opacity-50 rounded-md transition-all duration-200">
                                <FiSettings className="mr-2" /> Paramètres
                            </Link>
                        </li>
                    </ul>
                </nav>

                <div className="mt-auto pt-5 border-t border-gray-700">
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center p-3 text-red-400 hover:bg-red-900 hover:bg-opacity-30 rounded-md transition-all duration-200"
                    >
                        <FiLogOut className="mr-2" /> Déconnexion
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 p-6 overflow-y-auto">
                <header className="mb-8">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                            Tableau de Bord Administration
                        </h1>
                        <div className="flex items-center space-x-4">
                            <div className="bg-slate-800 p-2 rounded-full">
                                <FiActivity className="text-purple-500" />
                            </div>
                            <div className="bg-slate-900 p-2 px-4 rounded-lg flex items-center">
                                <div className="bg-green-500 h-2 w-2 rounded-full mr-2"></div>
                                <span className="text-white font-medium">{user?.name || 'Admin'}</span>
                            </div>
                        </div>
                    </div>
                    <p className="text-gray-400 mt-1">Vue d'ensemble des projets et des utilisateurs</p>
                </header>

                {/* Stats Cards - Design moderne avec icônes */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-lg p-6 border border-gray-700 hover:shadow-purple-900/20 hover:border-purple-700/50 transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">Total Projets</p>
                                <h3 className="text-3xl font-bold text-white">{projectCount}</h3>
                                <p className="text-green-500 text-xs mt-1">+ 12.5% ce mois</p>
                            </div>
                            <div className="p-3 bg-purple-900/30 rounded-lg">
                                <FiBarChart2 className="h-6 w-6 text-purple-400" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-lg p-6 border border-gray-700 hover:shadow-blue-900/20 hover:border-blue-700/50 transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">Workspaces</p>
                                <h3 className="text-3xl font-bold text-white">{workspaceCount}</h3>
                                <p className="text-green-500 text-xs mt-1">+ 8.2% ce mois</p>
                            </div>
                            <div className="p-3 bg-blue-900/30 rounded-lg">
                                <FiPieChart className="h-6 w-6 text-blue-400" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-lg p-6 border border-gray-700 hover:shadow-green-900/20 hover:border-green-700/50 transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">Utilisateurs</p>
                                <h3 className="text-3xl font-bold text-white">{userCount}</h3>
                                <p className="text-green-500 text-xs mt-1">+ 5.1% ce mois</p>
                            </div>
                            <div className="p-3 bg-green-900/30 rounded-lg">
                                <FiUser className="h-6 w-6 text-green-400" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-lg p-6 border border-gray-700 hover:shadow-amber-900/20 hover:border-amber-700/50 transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">Tâches</p>
                                <h3 className="text-3xl font-bold text-white">{dashboardStats.totalTasks}</h3>
                                <div className="flex items-center space-x-2 mt-1">
                                    <span className="text-green-500 text-xs">{dashboardStats.completedTasks} terminées</span>
                                    <span className="text-gray-400">·</span>
                                    <span className="text-amber-500 text-xs">{dashboardStats.pendingTasks} en cours</span>
                                </div>
                            </div>
                            <div className="p-3 bg-amber-900/30 rounded-lg">
                                <FiActivity className="h-6 w-6 text-amber-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Graphs Section - Design amélioré avec des cartes uniformes et plus modernes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-slate-800/60 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-700 hover:shadow-purple-900/10 transition-all duration-300">
                        <h3 className="text-xl font-semibold text-white mb-4">Répartition des statuts des tâches</h3>
                        <div className="h-64">
                            <Doughnut
                                data={taskStatusChart}
                                options={{
                                    ...chartOptions,
                                    plugins: {
                                        ...chartOptions.plugins,
                                        title: { ...chartOptions.plugins.title, text: 'Distribution des statuts' }
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <div className="bg-slate-800/60 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-700 hover:shadow-blue-900/10 transition-all duration-300">
                        <h3 className="text-xl font-semibold text-white mb-4">Tâches par délai vs complétion</h3>
                        <div className="h-64">
                            <Line
                                data={taskDeadlineVsCompletionChart}
                                options={{
                                    ...chartOptions,
                                    plugins: {
                                        ...chartOptions.plugins,
                                        title: { ...chartOptions.plugins.title, text: 'Progression des tâches' }
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <div className="bg-slate-800/60 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-700 hover:shadow-purple-900/10 transition-all duration-300">
                        <h3 className="text-xl font-semibold text-white mb-4">Répartition des statuts utilisateurs</h3>
                        <div className="h-64">
                            <Doughnut
                                data={userStatusChart}
                                options={{
                                    ...chartOptions,
                                    plugins: {
                                        ...chartOptions.plugins,
                                        title: { ...chartOptions.plugins.title, text: 'Activité des utilisateurs' }
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <div className="bg-slate-800/60 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-700 hover:shadow-green-900/10 transition-all duration-300">
                        <h3 className="text-xl font-semibold text-white mb-4">Progression par espace de travail</h3>
                        <div className="h-64">
                            <Bar
                                data={workspaceProgressChart}
                                options={{
                                    ...chartOptions,
                                    plugins: {
                                        ...chartOptions.plugins,
                                        title: { ...chartOptions.plugins.title, text: 'Tâches terminées par workspace' }
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <div className="bg-slate-800/60 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-700 hover:shadow-amber-900/10 transition-all duration-300">
                        <h3 className="text-xl font-semibold text-white mb-4">Tâches par utilisateur</h3>
                        <div className="h-64">
                            <Bar
                                data={taskDistributionByUserChart}
                                options={{
                                    ...chartOptions,
                                    plugins: {
                                        ...chartOptions.plugins,
                                        title: { ...chartOptions.plugins.title, text: 'Charge de travail par utilisateur' }
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <div className="bg-slate-800/60 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-700 hover:shadow-cyan-900/10 transition-all duration-300">
                        <h3 className="text-xl font-semibold text-white mb-4">Tendance des tâches au fil du temps</h3>
                        <div className="h-64">
                            <Line
                                data={taskTrendOverTimeChart}
                                options={{
                                    ...chartOptions,
                                    plugins: {
                                        ...chartOptions.plugins,
                                        title: { ...chartOptions.plugins.title, text: 'Évolution sur la période' }
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Section spéciale pour les rapports */}
                <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 mb-8 border border-gray-700">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                        <FiActivity className="mr-2 text-purple-400" />
                        Activité récente
                    </h2>
                    <div className="space-y-3">
                        {taskProgressByDeadline.slice(0, 5).map((task, index) => (
                            <div key={index} className="flex items-center justify-between bg-slate-700/30 p-3 rounded-lg">
                                <div className="flex items-center">
                                    <div className="h-2 w-2 rounded-full mr-3" style={{
                                        backgroundColor: task.completionPercentage > 75 ? '#4ade80' :
                                            task.completionPercentage > 50 ? '#facc15' :
                                                task.completionPercentage > 25 ? '#fb923c' : '#f87171'
                                    }}></div>
                                    <span className="text-white">{task.taskName}</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-32 bg-gray-700 rounded-full h-2 mr-3">
                                        <div
                                            className="h-2 rounded-full"
                                            style={{
                                                width: `${task.completionPercentage}%`,
                                                backgroundColor: task.completionPercentage > 75 ? '#4ade80' :
                                                    task.completionPercentage > 50 ? '#facc15' :
                                                        task.completionPercentage > 25 ? '#fb923c' : '#f87171'
                                            }}
                                        ></div>
                                    </div>
                                    <span className="text-white text-sm">{task.completionPercentage}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 text-right">
                        <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">Voir tous les rapports →</button>
                    </div>
                </div>

                {/* Footer with copyright */}
                <footer className="text-center text-gray-500 text-xs mt-8">
                    © 2025 ProjectFlow. Tous droits réservés.
                </footer>
            </div>
        </div>
    );
};

export default Dashboard;
