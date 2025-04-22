import { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/Api';
import { toast } from 'react-hot-toast';
import 'react-phone-input-2/lib/style.css';
import { jsPDF } from 'jspdf';
import { useParams } from 'react-router-dom';
import GitHubLinkButton from '../components/profile/GitHubLinkButton';
import GitHubProfileFrame from '../components/profile/GitHubProfileFrame';
import GitHubCrownBadge from '../components/profile/GitHubCrownBadge';

// Composant pour le cercle de progression
const ProgressCircle = ({ percentage, size = 80, strokeWidth = 8 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;



    let strokeColor;
    if (percentage < 30) strokeColor = '#ef4444'; // red
    else if (percentage < 70) strokeColor = '#f59e0b'; // amber
    else strokeColor = '#10b981'; // emerald

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg height={size} width={size} className="transform -rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke="#e5e7eb" // couleur de fond
                    strokeWidth={strokeWidth}
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                />
            </svg>
            <span className="absolute text-lg font-bold" style={{ color: strokeColor }}>
                {percentage}%
            </span>
        </div>
    );
};

const Profile = () => {
    const { id } = useParams(); // Extract `id` from the URL

    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('profile');
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);
    const [selectedExperience, setSelectedExperience] = useState(null);
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'system');
    const [locationFilter, setLocationFilter] = useState('Tous');
    const [sortOrder, setSortOrder] = useState('newest'); // Par défaut, tri du plus récent au plus ancien
    const [projects, setProjects] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const location = useLocation();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone_number: '',
        bio: '',
        role: '',
        two_factor_enabled: false,
        profile_picture: '',
        password: '',
        newPassword: '',
        confirmPassword: '',
    });

    // États pour les compétences
    const [skills, setSkills] = useState([]);
    const [showSkillForm, setShowSkillForm] = useState(false);
    const [newSkill, setNewSkill] = useState({
        name: '',
        description: '',
        category: 'Technical',
        tags: 50 // Nouveau champ pour le pourcentage de maîtrise
    });
    const [editingSkillId, setEditingSkillId] = useState(null);
    const [editSkillData, setEditSkillData] = useState({
        name: '',
        description: '',
        category: 'Technical',
        tags: 50
    });
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [levelFilter, setLevelFilter] = useState('all');
    // État pour le quiz
    const [currentQuiz, setCurrentQuiz] = useState(null);
    const [isQuizLoading, setIsQuizLoading] = useState(false); // Nouvel état pour gérer le chargement
    const [userAnswers, setUserAnswers] = useState({}); // Nouvel état pour les réponses de l'utilisateur
    // Fonction pour générer un quiz
    const generateQuiz = async (skillName) => {
        if (isQuizLoading) {
            toast.info('Veuillez attendre avant de générer un autre quiz.');
            return;
        }

        setIsQuizLoading(true);
        try {
            const response = await fetch('https://opentdb.com/api.php?amount=20&category=18&type=multiple'); // Augmente à 20 pour avoir plus de choix
            const data = await response.json();
            console.log('Données brutes reçues:', data);

            if (!response.ok || data.response_code !== 0 || !data.results.length) {
                throw new Error('Aucune question trouvée dans la base de données');
            }

            // Filtrer les questions contenant le nom de la compétence (par exemple, "Java")
            const filteredQuestions = data.results.filter(result =>
                result.question.toLowerCase().includes(skillName.toLowerCase())
            );

            // Si pas assez de questions spécifiques, utiliser toutes les questions de la catégorie
            const questionsToUse = filteredQuestions.length >= 10
                ? filteredQuestions.slice(0, 10)
                : data.results.slice(0, 10);

            const questions = questionsToUse.map(q => ({
                question: q.question,
                options: {
                    a: q.incorrect_answers[0],
                    b: q.incorrect_answers[1],
                    c: q.incorrect_answers[2],
                    d: q.correct_answer,
                },
                correct_answer: 'd', // Bonne réponse à la dernière position
            }));

            if (questions.length < 10) {
                console.warn('Moins de 10 questions pertinentes trouvées, utilisant des questions générales.');
            }

            setCurrentQuiz({
                skill: skillName,
                questions: questions,
            });
            setUserAnswers({}); // Réinitialiser les réponses
            toast.success(`Quiz généré pour ${skillName} !`);
        } catch (error) {
            console.error('Erreur lors de la génération du quiz:', error);
            toast.error(error.message || 'Échec de la génération du quiz');
        } finally {
            setTimeout(() => setIsQuizLoading(false), 2000);
        }
    };

    // Fonction pour soumettre le quiz et mettre à jour les tags
    const submitQuiz = async () => {
        if (!currentQuiz) {
            toast.error('Aucun quiz en cours.');
            return;
        }

        let correctAnswers = 0;
        currentQuiz.questions.forEach((question, index) => {
            const userAnswer = userAnswers[index];
            if (userAnswer === question.correct_answer) {
                correctAnswers++;
            }
        });

        const score = correctAnswers * 10; // Score en pourcentage
        toast.success(`Score : ${correctAnswers}/10 (${score}%)`);

        // Trouver la compétence à mettre à jour
        const skillToUpdate = skills.find(skill => skill.name.toLowerCase() === currentQuiz.skill.toLowerCase());
        if (!skillToUpdate) {
            toast.error(`Compétence ${currentQuiz.skill} non trouvée.`);
            setCurrentQuiz(null);
            setUserAnswers({});
            return;
        }

        // Calculer l'augmentation des tags
        let tagIncrease = 0;
        if (score >= 90) tagIncrease = 10; // 9/10 ou 10/10
        else if (score >= 80) tagIncrease = 5; // 8/10
        else if (score >= 60) tagIncrease = 2; // 6/10 ou 7/10

        if (tagIncrease > 0) {
            const newTags = Math.min(100, skillToUpdate.tags + tagIncrease);
            console.log('Tentative de mise à jour des tags:', {
                skillId: skillToUpdate._id,
                skillName: skillToUpdate.name,
                oldTags: skillToUpdate.tags,
                newTags,
            });

            try {
                // Envoyer uniquement le champ tags
                const response = await api.put(`/api/skills/update/${skillToUpdate._id}`, {
                    tags: newTags,
                });

                console.log('Réponse API:', response.data);

                // Vérifier que response.data est valide
                if (!response.data || !response.data._id) {
                    throw new Error('Réponse API invalide');
                }

                // Mettre à jour l'état skills
                setSkills(skills.map(skill =>
                    skill._id === skillToUpdate._id ? { ...skill, tags: newTags } : skill
                ));

                toast.success(`Maîtrise de ${currentQuiz.skill} augmentée à ${newTags}% !`);
            } catch (error) {
                console.error('Erreur lors de la mise à jour des tags:', {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status,
                });
                toast.error(`Échec de la mise à jour : ${error.response?.data?.message || error.message}`);
            }
        } else {
            toast.info('Score insuffisant pour augmenter la maîtrise.');
        }

        setCurrentQuiz(null);
        setUserAnswers({});
    };
    console.log('GitHub ID value:', user?.githubId);

    // Gestion des réponses de l'utilisateur
    const handleAnswerChange = (questionIndex, answer) => {
        setUserAnswers(prev => ({
            ...prev,
            [questionIndex]: answer,
        }));
    };
    // États pour les certifications
    const [certifications, setCertifications] = useState([]);
    const [showCertificationForm, setShowCertificationForm] = useState(false);
    const [newCertification, setNewCertification] = useState({
        certifications_name: '',
        issued_by: '',
        obtained_date: '',
        description: '',
        image: null,
    });
    const [editingCertificationId, setEditingCertificationId] = useState(null);
    const [editCertificationData, setEditCertificationData] = useState({
        certifications_name: '',
        issued_by: '',
        obtained_date: '',
        description: '',
        image: null,
    });
    const [certificationImagePreview, setCertificationImagePreview] = useState(null);
    const certificationFileInputRef = useRef(null);


    // États pour les expériences

    const [locationTypeFilter, setLocationTypeFilter] = useState('Tous');
    const [experienceSortOption, setExperienceSortOption] = useState('date-desc');
    const [experiences, setExperiences] = useState([]);
    const [showExperienceForm, setShowExperienceForm] = useState(false);
    const [newExperience, setNewExperience] = useState({
        job_title: '',
        company: '',
        employment_type: 'Temps plein',
        is_current: false,
        start_date: '',
        end_date: '',
        location: '',
        location_type: 'Sur place',
        description: '',

        job_source: '',

    });
    const [editingExperienceId, setEditingExperienceId] = useState(null);
    const [editExperienceData, setEditExperienceData] = useState({
        job_title: '',
        company: '',
        employment_type: 'Temps plein',
        is_current: false,
        start_date: '',
        end_date: '',
        location: '',
        location_type: 'Sur place',
        description: '',

        job_source: ''
    });


    const generateCV = async () => {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });

        const marginLeft = 15;
        const marginRight = 15;
        const marginTop = 15;
        const pageWidth = 210; // A4 width in mm
        const sidebarWidth = 60; // Left sidebar for personal info
        const mainContentWidth = pageWidth - marginLeft - marginRight - sidebarWidth - 5; // Main content area
        let currentY = marginTop;
        let mainContentY = marginTop;

        // Helper to convert image URL to base64
        const getBase64Image = async (url) => {
            try {
                const response = await fetch(url);
                const blob = await response.blob();
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(blob);
                });
            } catch (error) {
                console.error('Error fetching profile picture:', error);
                return null;
            }
        };

        // Add Sidebar Background
        doc.setFillColor(0, 51, 102); // Dark blue
        doc.rect(marginLeft, 0, sidebarWidth, 297, 'F'); // Full height sidebar

        // Profile Picture
        let profileImage = null;
        if (formData.profile_picture) {
            profileImage = await getBase64Image(formData.profile_picture);
        }
        if (profileImage) {
            try {
                doc.addImage(profileImage, 'JPEG', marginLeft + 10, currentY, 40, 40, undefined, 'FAST'); // 40x40mm image
                currentY += 45;
            } catch (error) {
                console.error('Error adding profile picture to PDF:', error);
                currentY += 5; // Space even if image fails
            }
        } else {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.setTextColor(255, 255, 255);
            doc.text('Photo indisponible', marginLeft + 10, currentY + 10);
            currentY += 15;
        }

        // Name and Tagline in Sidebar
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.setTextColor(255, 255, 255); // White text
        const nameLines = doc.splitTextToSize(formData.name || 'Nom Prénom', sidebarWidth - 10);
        nameLines.forEach((line) => {
            doc.text(line, marginLeft + 5, currentY);
            currentY += 6;
        });

        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10);
        doc.setTextColor(200, 200, 200); // Light gray
        doc.text('Développeur Full Stack', marginLeft + 5, currentY); // Example tagline
        currentY += 10;

        // Contact Info in Sidebar
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        doc.text('Email:', marginLeft + 5, currentY);
        doc.setTextColor(173, 216, 230); // Light blue for clickable link
        doc.textWithLink(formData.email || 'email@example.com', marginLeft + 15, currentY, {
            url: `mailto:${formData.email || 'email@example.com'}`,
        });
        currentY += 6;
        doc.setTextColor(255, 255, 255);
        doc.text(`Téléphone: ${formData.phone_number || '+33 123 456 789'}`, marginLeft + 5, currentY);
        currentY += 10;

        // Skills in Sidebar
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255);
        doc.text('Compétences', marginLeft + 5, currentY);
        currentY += 6;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(200, 200, 200);
        if (skills.length === 0) {
            doc.text('Aucune compétence', marginLeft + 5, currentY);
            currentY += 5;
        } else {
            const skillsText = skills.map((skill) => skill.name).join(', ');
            const skillsLines = doc.splitTextToSize(skillsText, sidebarWidth - 10);
            skillsLines.forEach((line) => {
                doc.text(line, marginLeft + 5, currentY);
                currentY += 5;
            });
        }

        // Main Content Area (Right Side)
        const mainContentX = marginLeft + sidebarWidth + 5;

        // Helper to add section header in main content
        const addSectionHeader = (title) => {
            doc.setFillColor(240, 240, 240); // Light gray background
            doc.rect(mainContentX, mainContentY, mainContentWidth, 6, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.setTextColor(0, 51, 102);
            doc.text(title, mainContentX, mainContentY + 4);
            mainContentY += 8;
        };

        // Helper to add a divider
        const addDivider = () => {
            doc.setDrawColor(0, 51, 102);
            doc.setLineWidth(0.3);
            doc.line(mainContentX, mainContentY, mainContentX + mainContentWidth, mainContentY);
            mainContentY += 3;
        };

        // Expériences Professionnelles
        addSectionHeader('Expériences Professionnelles');
        if (experiences.length === 0) {
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text('Aucune expérience enregistrée', mainContentX, mainContentY);
            mainContentY += 5;
        } else {
            experiences.forEach((exp) => {
                const startDate = new Date(exp.start_date).toLocaleDateString('fr-FR');
                const endDate = exp.is_current ? 'Présent' : new Date(exp.end_date).toLocaleDateString('fr-FR');

                doc.setFont('helvetica', 'bold');
                doc.setFontSize(11);
                doc.setTextColor(0, 51, 102);
                doc.text(`${exp.job_title} - ${exp.company}`, mainContentX, mainContentY);
                mainContentY += 5;

                doc.setFont('helvetica', 'italic');
                doc.setFontSize(9);
                doc.setTextColor(50, 50, 50);
                doc.text(`${startDate} - ${endDate} | ${exp.employment_type} (${exp.location_type})`, mainContentX, mainContentY);
                mainContentY += 5;

                doc.setFont('helvetica', 'normal');
                doc.setFontSize(9);
                const descriptionLines = doc.splitTextToSize(exp.description || 'Aucune description', mainContentWidth);
                descriptionLines.forEach((line) => {
                    doc.text(line, mainContentX, mainContentY);
                    mainContentY += 4;
                });

                mainContentY += 3;
                if (mainContentY > 260) {
                    doc.addPage();
                    mainContentY = marginTop;
                }
            });
        }

        // Certifications
        mainContentY += 5;
        addSectionHeader('Certifications');
        if (certifications.length === 0) {
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text('Aucune certification enregistrée', mainContentX, mainContentY);
            mainContentY += 5;
        } else {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(50, 50, 50);
            certifications.forEach((cert) => {
                doc.text(
                    `• ${cert.certifications_name} - ${cert.issued_by} (${new Date(cert.obtained_date).toLocaleDateString('fr-FR')})`,
                    mainContentX,
                    mainContentY
                );
                mainContentY += 5;

                if (mainContentY > 260) {
                    doc.addPage();
                    mainContentY = marginTop;
                }
            });
        }

        // Projets
        mainContentY += 5;
        addSectionHeader('Projets');
        if (projects.length === 0) {
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text('Aucun projet associé à cet utilisateur', mainContentX, mainContentY);
            mainContentY += 5;
        } else {
            projects.forEach((project) => {
                const startDate = new Date(project.start_date).toLocaleDateString('fr-FR');
                const endDate = new Date(project.end_date).toLocaleDateString('fr-FR');

                doc.setFont('helvetica', 'bold');
                doc.setFontSize(11);
                doc.setTextColor(0, 51, 102);
                doc.text(project.project_name, mainContentX, mainContentY);
                mainContentY += 5;

                doc.setFont('helvetica', 'italic');
                doc.setFontSize(9);
                doc.setTextColor(50, 50, 50);
                doc.text(`${startDate} - ${endDate}`, mainContentX, mainContentY);
                mainContentY += 5;

                doc.setFont('helvetica', 'normal');
                doc.setFontSize(9);
                const descriptionLines = doc.splitTextToSize(project.description || 'Aucune description', mainContentWidth);
                descriptionLines.forEach((line) => {
                    doc.text(line, mainContentX, mainContentY);
                    mainContentY += 4;
                });

                mainContentY += 3;
                if (mainContentY > 260) {
                    doc.addPage();
                    mainContentY = marginTop;
                }
            });
        }

        // Footer
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text('Généré le ' + new Date().toLocaleDateString('fr-FR'), marginLeft, 280);
        doc.text('Page 1', pageWidth - marginRight - 10, 280);

        doc.save('CV.pdf');
    };
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get('/api/users/getMe');
                if (!response.data || !response.data._id) {
                    throw new Error('Invalid user data received');
                }
                setUser(response.data);
                setFormData({
                    name: response.data?.name || '',
                    email: response.data?.email || '',
                    phone_number: response.data?.phone_number || '',
                    bio: response.data?.bio || '',
                    role: response.data?.role || 'user',
                    two_factor_enabled: response.data?.two_factor_enabled || false,
                    profile_picture: response.data?.profile_picture || '',
                    password: '',
                    newPassword: '',
                    confirmPassword: '',
                });
                setImagePreview(response.data?.profile_picture || null);

                await Promise.all([
                    fetchUserSkills(),
                    fetchUserExperiences(),
                    fetchCertifications(),
                    //fetchUserProjects(), // Add projects fetching
                ]);
            } catch (error) {
                console.error('Error fetching user:', error.response?.data || error.message);
                toast.error('Failed to load profile: ' + (error.response?.data?.message || error.message));
                if (error.response?.status === 401) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        const fetchUserSkills = async () => {
            try {
                const response = await api.get('/api/skills/');
                setSkills(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error('Error fetching user skills:', error.response?.data || error.message);
                setSkills([]);
                toast.error('Failed to load skills: ' + (error.response?.data?.message || error.message));
            }
        };

        const fetchUserExperiences = async () => {
            try {
                const response = await api.get('/api/experiences/');
                const fetchedExperiences = Array.isArray(response.data) ? response.data : [];
                setExperiences(fetchedExperiences);
            } catch (error) {
                console.error('Error fetching user experiences:', error.response?.data || error.message);
                setExperiences([]);
                toast.error('Failed to load experiences: ' + (error.response?.data?.message || error.message));
            }
        };

        const fetchCertifications = async () => {
            try {
                const response = await api.get('/api/certifications'); // Appelle getUserCertifications
                const validCertifications = Array.isArray(response.data)
                    ? response.data.map((cert) => ({
                        _id: cert._id || '',
                        certifications_name: cert.certifications_name || 'Unnamed Certification',
                        issued_by: cert.issued_by || 'Unknown Issuer',
                        obtained_date: cert.obtained_date || new Date().toISOString().split('T')[0],
                        description: cert.description || '',
                        image: cert.image || null,
                    }))
                    : [];
                setCertifications(validCertifications);
            } catch (error) {
                console.error('Error fetching certifications:', error.response?.data || error.message);
                toast.error('Failed to load certifications');
                setCertifications([]);
            }
        };



        fetchCertifications();
        //  fetchUserExperiences();
        fetchUser();
    }, [navigate]);
    useEffect(() => {
        if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', systemTheme);
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = (e) => document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        } else {
            document.documentElement.setAttribute('data-theme', theme);
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
          :root { transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, fill 0.3s ease, stroke 0.3s ease, outline-color 0.3s ease, box-shadow 0.3s ease; }
          button, input, select, textarea, .btn, .badge, .card, .navbar, .dropdown, .modal, .alert, .tab, .menu { transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease; }
          svg { transition: fill 0.3s ease, stroke 0.3s ease; }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        // Check if GitHub was just linked
        if (params.get('githubLinked') === 'success') {
            toast.success("GitHub account linked successfully!");
            // Check if there's also a token and save it
            const token = params.get('token');
            if (token) {
                document.cookie = `token=${token}; path=/; secure; HttpOnly`;
            }

            // Force refresh of user data
            fetchUserData();

            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [location]);
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size should be less than 5MB');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target.result);
        reader.readAsDataURL(file);
    };
    const handleUploadImage = async () => {
        if (!imagePreview || imagePreview === user?.profile_picture) return;
        setIsSaving(true);
        try {
            const response = await api.put('/api/users/updateMe', { profile_picture: imagePreview });

            // The updated user is directly in response.data, not response.data.user
            if (response.data) {
                setUser(response.data);
                setFormData(prev => ({
                    ...prev,
                    profile_picture: response.data.profile_picture
                }));
                setImagePreview(response.data.profile_picture);
                toast.success('Profile picture updated successfully');
            } else {
                throw new Error('Failed to update profile picture');
            }
        } catch (error) {
            console.error('Upload error:', error.response?.data || error.message);
            toast.error(error.response?.data?.message || 'Failed to upload profile picture');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const response = await api.put('/api/users/updateMe', {
                name: formData.name,
                phone_number: formData.phone_number,
                bio: formData.bio,
                profile_picture: imagePreview || formData.profile_picture,
            });
            if (response.data?.user) {
                setUser(response.data.user);
                setFormData(prev => ({
                    ...prev,
                    name: response.data.user.name,
                    phone_number: response.data.user.phone_number,
                    bio: response.data.user.bio,
                    profile_picture: response.data.user.profile_picture,
                }));
                setIsEditing(false);
                toast.success('Profile updated successfully');
            }
        } catch (error) {
            console.error('Update error:', error.response?.data || error.message);
            toast.error(error.response?.data?.error || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        // First validate passwords match
        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        setIsSaving(true);
        try {
            // Use the correct endpoint and field names to match the backend
            const response = await api.put('/api/users/updateMyPassword', {
                currentPassword: formData.password,  // Current password 
                password: formData.newPassword,      // This is what the backend expects (new password)
            });

            // If the backend returns a new token, update it
            if (response.data?.token) {
                localStorage.setItem('token', response.data.token);
            }

            toast.success('Password changed successfully');

            // Clear password fields
            setFormData((prev) => ({
                ...prev,
                password: '',
                newPassword: '',
                confirmPassword: '',
            }));
        } catch (error) {
            console.error('Password change error:', error);

            // Better error handling with specific messages from the backend
            if (error.response?.status === 401) {
                toast.error('Current password is incorrect');
            } else {
                toast.error(error.response?.data?.message || 'Failed to change password');
            }
        } finally {
            setIsSaving(false);
        }
    };

    const formatPhoneDisplay = (number) => {
        if (!number) return 'Not provided';
        if (number.length === 8 && !number.startsWith('+')) return `+216 ${number.slice(0, 2)} ${number.slice(2, 5)} ${number.slice(5)}`;
        if (number.startsWith('216')) return `+216 ${number.slice(3, 5)} ${number.slice(5, 8)} ${number.slice(8)}`;
        if (number.startsWith('33')) return `+33 ${number.slice(2, 3)} ${number.slice(3, 5)} ${number.slice(5, 7)} ${number.slice(7)}`;
        if (number.startsWith('1')) return `+1 (${number.slice(1, 4)}) ${number.slice(4, 7)}-${number.slice(7)}`;
        return `+${number}`;
    };

    const handleThemeChange = (newTheme) => setTheme(newTheme);

    const handleAddSkill = async (e) => {
        e.preventDefault();
        try {
            // First, create the skill in the skills collection
            const response = await api.post('/api/skills/add', newSkill);
            setSkills([...skills, response.data]);

            // Only add to user's skills array if proficiency level is >= 70
            if (newSkill.tags >= 70) {
                // Ensure skills is treated as an array
                const currentSkills = Array.isArray(user.skills) ? user.skills : [];

                // Check if skill already exists to avoid duplicates
                if (!currentSkills.includes(newSkill.name)) {
                    try {
                        // Log the request we're about to make to debug
                        console.log('Updating user skills with:', { skills: [...currentSkills, newSkill.name] });

                        // Make the API request - ensure this matches the field name in your model
                        const updateResponse = await api.put('/api/users/updateMe', {
                            skills: [...currentSkills, newSkill.name]
                        });

                        console.log('User update response:', updateResponse.data);

                        // Update the local user object
                        setUser(prev => ({
                            ...prev,
                            skills: [...currentSkills, newSkill.name]
                        }));

                        toast.success('Skill added to profile successfully');
                    } catch (updateError) {
                        console.error('Error updating user skills:', updateError.response?.data || updateError.message);

                        // Let's try a different approach if the first one fails
                        try {
                            // Some APIs might expect a patch instead of put for partial updates
                            await api.patch('/api/users/updateMe', {
                                skills: [...currentSkills, newSkill.name]
                            });

                            // Update the local user object
                            setUser(prev => ({
                                ...prev,
                                skills: [...currentSkills, newSkill.name]
                            }));

                            toast.success('Skill added to profile successfully (alternative method)');
                        } catch (alternativeError) {
                            console.error('Alternative update method also failed:', alternativeError.response?.data);
                            toast.error('Skill added but failed to update your profile');
                        }
                    }
                }
            }

            // Reset form and close
            setNewSkill({ name: '', description: '', category: 'Technical', tags: 50 });
            setShowSkillForm(false);
            toast.success('Skill added to collection successfully');
        } catch (error) {
            console.error('Error adding skill:', error.response?.data || error.message);
            toast.error(`Failed to add skill: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleEditSkill = (skill) => {
        setEditingSkillId(skill._id);
        setEditSkillData({
            name: skill.name,
            description: skill.description,
            category: skill.category,
            tags: skill.tags
        });
        setShowSkillForm(true);
    };

    const handleUpdateSkill = async (e) => {
        e.preventDefault();
        try {
            // First update the skill in the skills collection
            const response = await api.put(`/api/skills/update/${editingSkillId}`, editSkillData);

            // Update the skills state
            setSkills(skills.map((skill) => (skill._id === editingSkillId ? response.data : skill)));

            // Check if this skill is in the user's skills array
            // Note: The skill name might have changed, so we need to update it in the user's skills array
            if (user.skills && Array.isArray(user.skills)) {
                // Get the old skill name
                const oldSkill = skills.find(skill => skill._id === editingSkillId);

                // If the name changed and the old name is in user's skills, update it
                if (oldSkill && oldSkill.name !== editSkillData.name && user.skills.includes(oldSkill.name)) {
                    // Replace the old skill name with the new one
                    const updatedSkills = user.skills.map(skillName =>
                        skillName === oldSkill.name ? editSkillData.name : skillName
                    );

                    // Update the user's skills in the database
                    await api.put('/api/users/updateMe', {
                        skills: updatedSkills
                    });

                    // Update the local user object
                    setUser(prev => ({
                        ...prev,
                        skills: updatedSkills
                    }));

                    toast.success('User skills updated successfully');
                }
            }

            // Reset form state
            setEditingSkillId(null);
            setEditSkillData({ name: '', description: '', category: 'Technical', tags: 50 });
            setShowSkillForm(false);
            toast.success('Skill updated successfully');
        } catch (error) {
            console.error('Error updating task:', error);
            console.log('Response status:', error.response?.status);
            console.log('Response data:', error.response?.data);

            // Check if the error contains validation errors
            if (error.response?.data?.errors && error.response.data.errors.length > 0) {
                // Extract and display specific validation errors
                const validationErrors = error.response.data.errors.messages || error.response.data.errors;

                // Display the specific error message to the user
                toast.error(validationErrors);
            } else {
                // Fall back to a generic error message if we don't have specific validation errors
                toast.error(error.response?.data?.message || 'Failed to update task');
            }
        }
    };

    const handleDeleteSkill = async (skillId) => {
        try {
            // First find the skill to get its name
            const skillToDelete = skills.find(skill => skill._id === skillId);

            if (!skillToDelete) {
                toast.error('Skill not found');
                return;
            }

            // Delete the skill from the skills collection
            await api.delete(`/api/skills/delete/${skillId}`);

            // Update the skills state
            setSkills(skills.filter((skill) => skill._id !== skillId));

            // Check if this skill is in the user's skills array
            if (user.skills && Array.isArray(user.skills) && user.skills.includes(skillToDelete.name)) {
                // Remove the skill from user's skills array
                const updatedSkills = user.skills.filter(skillName => skillName !== skillToDelete.name);

                // Update the user's skills in the database
                await api.put('/api/users/updateMe', {
                    skills: updatedSkills
                });

                // Update the local user object
                setUser(prev => ({
                    ...prev,
                    skills: updatedSkills
                }));

                toast.success('Skill removed from user profile successfully');
            }

            toast.success('Skill deleted successfully');
        } catch (error) {
            console.error('Delete skill error:', error.response?.data || error.message);
            toast.error(error.response?.data?.message || 'Failed to delete skill');
        }
    };

    // Gestion des certifications
    const [sortOption, setSortOption] = useState('date-desc');


    // Gestion de la sélection d'image
    const handleCertificationImageSelect = (e, isEditing = false) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size should be less than 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const imageData = event.target.result;
            if (isEditing) {
                setEditCertificationData((prev) => ({ ...prev, image: file }));
            } else {
                setNewCertification((prev) => ({ ...prev, image: file }));
            }
            setCertificationImagePreview(imageData);
        };
        reader.readAsDataURL(file);

        console.log('Selected file:', file);
    };

    // Ajouter une certification
    const handleAddCertification = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append('certifications_name', newCertification.certifications_name);
            formData.append('issued_by', newCertification.issued_by);
            formData.append('obtained_date', newCertification.obtained_date);
            formData.append('description', newCertification.description || '');
            if (newCertification.image instanceof File) {
                formData.append('image', newCertification.image);
            } else {
                console.log('No valid file to upload:', newCertification.image);
            }

            // Log détaillé du contenu de FormData
            console.log('Contenu de FormData avant envoi:');
            for (let [key, value] of formData.entries()) {
                console.log(`${key}:`, value instanceof File ? `File { name: "${value.name}", size: ${value.size} }` : value);
            }

            // Envoyer la requête avec Content-Type explicite
            const response = await api.post('/api/certifications/add', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data', // Forcer le Content-Type
                },
                onUploadProgress: (progressEvent) => {
                    console.log('Progression de l\'upload:', progressEvent.loaded, '/', progressEvent.total);
                },
            });

            console.log('Réponse du serveur:', response.data);

            setCertifications([...certifications, response.data]);
            setNewCertification({
                certifications_name: '',
                issued_by: '',
                obtained_date: '',
                description: '',
                image: null,
            });
            setCertificationImagePreview(null);
            setShowCertificationForm(false);
            if (certificationFileInputRef.current) certificationFileInputRef.current.value = null;
            toast.success('Certification added successfully');
        } catch (error) {
            console.error('Error adding certification:', error.response?.data || error.message);
            if (error.request) {
                console.log('Requête envoyée:', error.request);
            }
            toast.error(error.response?.data?.message || 'Failed to add certification');
        } finally {
            setIsSaving(false);
        }
    };
    // Mettre à jour une certification
    const handleUpdateCertification = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append('certifications_name', editCertificationData.certifications_name);
            formData.append('issued_by', editCertificationData.issued_by);
            formData.append('obtained_date', editCertificationData.obtained_date);
            formData.append('description', editCertificationData.description);
            if (editCertificationData.image instanceof File) {
                formData.append('image', editCertificationData.image); // Fichier brut
            }

            const response = await api.put(`/api/certifications/update/${editingCertificationId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setCertifications(certifications.map((cert) => (cert._id === editingCertificationId ? response.data : cert)));
            setEditingCertificationId(null);
            setEditCertificationData({
                certifications_name: '',
                issued_by: '',
                obtained_date: '',
                description: '',
                image: null,
            });
            setCertificationImagePreview(null);
            setShowCertificationForm(false);
            if (certificationFileInputRef.current) certificationFileInputRef.current.value = null;
            toast.success('Certification updated successfully');
        } catch (error) {
            console.error('Error updating certification:', error.response?.data || error.message);
            toast.error(error.response?.data?.message || 'Failed to update certification');
        } finally {
            setIsSaving(false);
        }
    };

    // Annuler l'image sélectionnée
    const handleCancelCertificationImage = () => {
        if (editingCertificationId) {
            const existingCert = certifications.find((cert) => cert._id === editingCertificationId);
            setEditCertificationData((prev) => ({
                ...prev,
                image: existingCert?.image || null, // Revenir à l'URL existante
            }));
            setCertificationImagePreview(existingCert?.image || null);
        } else {
            setNewCertification((prev) => ({
                ...prev,
                image: null,
            }));
            setCertificationImagePreview(null);
        }
        if (certificationFileInputRef.current) certificationFileInputRef.current.value = null;
    };
    //handleDeleteCertification
    const handleDeleteCertification = async (certificationId) => {
        try {
            await api.delete(`/api/certifications/${certificationId}`);
            setCertifications(certifications.filter((cert) => cert._id !== certificationId));
            toast.success('Certification deleted successfully');
        } catch (error) {
            console.error('Error deleting certification:', error.response?.data || error.message);
            toast.error(error.response?.data?.message || 'Failed to delete certification');
        }
    };
    const handleEditCertification = (certification) => {
        setEditingCertificationId(certification._id);
        setEditCertificationData({
            certifications_name: certification.certifications_name || '',
            issued_by: certification.issued_by || '',
            obtained_date: certification.obtained_date ? certification.obtained_date.split('T')[0] : '',
            description: certification.description || '',
            image: certification.image || null,
        });
        setCertificationImagePreview(certification.image || null);
        setShowCertificationForm(true);
    };


    // Gestion des expériences
    const handleAddExperience = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            // Préparez les données à envoyer en incluant tous les champs nécessaires
            const experienceData = {
                job_title: newExperience.job_title,
                company: newExperience.company,
                employment_type: newExperience.employment_type,
                is_current: newExperience.is_current,
                start_date: newExperience.start_date,
                end_date: newExperience.is_current ? null : newExperience.end_date, // Ne pas envoyer end_date si poste actuel
                location: newExperience.location,
                location_type: newExperience.location_type,
                description: newExperience.description,

                job_source: newExperience.job_source,
            };

            const response = await api.post('/api/experiences/add', experienceData);

            // Vérifiez que la réponse contient bien les données attendues
            if (!response.data || !response.data._id) {
                throw new Error('Réponse invalide du serveur');
            }

            setExperiences([...experiences, response.data]);
            setNewExperience({
                job_title: '',
                company: '',
                employment_type: 'Temps plein',
                is_current: false,
                start_date: '',
                end_date: '',
                location: '',
                location_type: 'Sur place',
                description: '',

                job_source: '',
            });
            setShowExperienceForm(false);
            toast.success('Experience added successfully');
        } catch (error) {
            console.error('Error adding experience:', error.response?.data || error.message);
            toast.error(`Failed to add experience: ${error.response?.data?.message || error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleEditExperience = (experience) => {
        setEditingExperienceId(experience._id);
        setEditExperienceData({
            job_title: experience.job_title || '',
            company: experience.company || '',
            employment_type: experience.employment_type || 'Temps plein',
            is_current: experience.is_current || false,
            start_date: experience.start_date ? new Date(experience.start_date).toISOString().split('T')[0] : '',
            end_date: experience.end_date ? new Date(experience.end_date).toISOString().split('T')[0] : '',
            location: experience.location || '',
            location_type: experience.location_type || 'Sur place',
            description: experience.description || '',

            job_source: experience.job_source || '',
        });
        setShowExperienceForm(true);
    };

    const handleUpdateExperience = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const response = await api.put(
                `/api/experiences/update/${editingExperienceId}`,
                {
                    job_title: editExperienceData.job_title,
                    company: editExperienceData.company,
                    employment_type: editExperienceData.employment_type,
                    is_current: editExperienceData.is_current,
                    start_date: editExperienceData.start_date,
                    end_date: editExperienceData.is_current ? null : editExperienceData.end_date,
                    location: editExperienceData.location,
                    location_type: editExperienceData.location_type,
                    description: editExperienceData.description,

                    job_source: editExperienceData.job_source,
                }
            );

            setExperiences(experiences.map(exp =>
                exp._id === editingExperienceId ? response.data : exp
            ));

            // Réinitialisation
            setEditingExperienceId(null);
            setEditExperienceData({
                job_title: '',
                company: '',
                employment_type: 'Temps plein',
                is_current: false,
                start_date: '',
                end_date: '',
                location: '',
                location_type: 'Sur place',
                description: '',

                job_source: '',
            });
            setShowExperienceForm(false);
            toast.success('Experience updated successfully');
        } catch (error) {
            console.error('Error updating experience:', error);
            toast.error(`Failed to update experience: ${error.response?.data?.message || error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteExperience = async (experienceId) => {
        try {
            await api.delete(`/api/experiences/${experienceId}`);
            setExperiences(experiences.filter(exp => exp._id !== experienceId));
            toast.success('Experience deleted successfully');
        } catch (error) {
            console.error('Error deleting experience:', error);
            toast.error(`Failed to delete experience: ${error.response?.data?.message || error.message}`);
        }
    };
    // Add this to your useEffect that handles URL parameters


    // Add a function to fetch fresh user data
    const fetchUserData = async () => {
        try {
            const response = await api.get('/api/users/getMe');
            setUser(response.data);
            toast.success("Profile data refreshed!");
        } catch (error) {
            console.error("Error fetching user data:", error);
            toast.error("Failed to refresh profile data");
        }
    };
    //Find the current position
    const currentPosition = experiences.find((exp) => exp.is_current) || null;
    if (loading) {
        return (
            <div className="min-h-screen bg-base-200 flex items-center justify-center">
                <div className="text-center">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                    <p className="mt-4 text-lg">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-200 font-poppins">
            <nav className="navbar bg-base-100 shadow-lg px-4 lg:px-8">
                <div className="flex-1">
                    <Link to="/acceuil" className="btn btn-ghost text-xl text-primary">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                            />
                        </svg>
                        PlaniFy
                    </Link>
                </div>
                <div className="flex-none gap-4">
                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} className="btn btn-ghost btn-circle avatar">
                            {user?.profile_picture ? (
                                <div className="w-10 h-10 rounded-full overflow-hidden">
                                    <img
                                        src={user.profile_picture}
                                        alt={`${user.name}'s profile`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                            )}
                        </div>
                        <ul
                            tabIndex={0}
                            className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
                        >
                            <li className="px-4 py-2 border-b">
                                <span className="font-bold">{user?.name || 'User'}</span>

                            </li>
                            <li>
                                <Link to="/acceuil">Dashboard</Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-5xl mx-auto">
                    <div className="bg-base-100 shadow-xl rounded-t-lg overflow-hidden">
                        <div className="h-40 bg-gradient-to-r from-purple-500 to-pink-500 opacity-80"></div>
                        <div className="px-8 pb-6 relative">
                            <div className="absolute -top-16 left-8 group">
                                <div className="w-32 h-32 rounded-full border-4 border-base-100 overflow-hidden bg-base-200 shadow-lg relative">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-primary text-white text-4xl font-bold">
                                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                    )}
                                    <div
                                        className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-8 w-8 text-white"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                        </svg>
                                    </div>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    accept="image/*"
                                />
                                {imagePreview && imagePreview !== user?.profile_picture && (
                                    <div className="mt-4 flex justify-center">
                                        <button
                                            onClick={handleUploadImage}
                                            className="btn btn-sm btn-primary"
                                            disabled={isSaving}
                                        >
                                            {isSaving ? (
                                                <>
                                                    <span className="loading loading-spinner loading-xs"></span>
                                                    Uploading...
                                                </>
                                            ) : 'Save Photo'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setImagePreview(user?.profile_picture || null);
                                                if (fileInputRef.current) fileInputRef.current.value = null;
                                            }}
                                            className="btn btn-sm btn-outline ml-2"
                                            disabled={isSaving}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="pt-16 sm:ml-36 sm:pt-0">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h1 className="text-3xl font-bold">{user?.name || 'User'}</h1>
                                            {user?.isVerified && (
                                                <div className="tooltip tooltip-right" data-tip="User verified">
                                                    <div className="flex items-center justify-center h-5 w-5 bg-blue-500 rounded-full">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            )}
                                            {(user?.githubId || user?.github_id || user?.github) && (
                                                <GitHubCrownBadge />
                                            )}
                                        </div>
                                        {user?.bio && (
                                            <div className="mt-1 text-base-content opacity-90">
                                                <p>{user.bio}</p>
                                            </div>
                                        )}
                                        <div className="mt-1 flex items-center gap-2">
                                            {/* <span className="badge badge-primary">{user?.role || 'user'}</span> */}
                                            {skills
                                                .filter((skill) => skill.tags >= 70)
                                                .map((skill) => {
                                                    const getSkillColorScheme = (skillName) => {
                                                        const name = skillName.toLowerCase();

                                                        // Technology-specific color schemes
                                                        if (name.includes('react')) {
                                                            return {
                                                                gradient: "from-cyan-400/80 to-blue-500/80",
                                                                hoverEffect: "hover:shadow-blue-300/40",
                                                                borderColor: "border-blue-300/40"
                                                            };
                                                        }

                                                        if (name.includes('javascript') || name.includes('js')) {
                                                            return {
                                                                gradient: "from-yellow-400/80 to-amber-500/80",
                                                                hoverEffect: "hover:shadow-yellow-300/40",
                                                                borderColor: "border-yellow-300/30"
                                                            };
                                                        }

                                                        if (name.includes('python')) {
                                                            return {
                                                                gradient: "from-blue-500/80 to-green-500/80",
                                                                hoverEffect: "hover:shadow-green-300/40",
                                                                borderColor: "border-green-300/30"
                                                            };
                                                        }

                                                        if (name.includes('node')) {
                                                            return {
                                                                gradient: "from-green-500/80 to-emerald-600/80",
                                                                hoverEffect: "hover:shadow-green-300/40",
                                                                borderColor: "border-green-300/30"
                                                            };
                                                        }

                                                        if (name.includes('angular')) {
                                                            return {
                                                                gradient: "from-red-500/80 to-rose-600/80",
                                                                hoverEffect: "hover:shadow-red-300/40",
                                                                borderColor: "border-red-300/30"
                                                            };
                                                        }

                                                        if (name.includes('vue')) {
                                                            return {
                                                                gradient: "from-emerald-400/80 to-teal-500/80",
                                                                hoverEffect: "hover:shadow-emerald-300/40",
                                                                borderColor: "border-emerald-300/30"
                                                            };
                                                        }

                                                        if (name.includes('java')) {
                                                            return {
                                                                gradient: "from-orange-500/80 to-red-600/80",
                                                                hoverEffect: "hover:shadow-red-300/40",
                                                                borderColor: "border-red-300/30"
                                                            };
                                                        }

                                                        if (name.includes('docker')) {
                                                            return {
                                                                gradient: "from-blue-400/80 to-blue-600/80",
                                                                hoverEffect: "hover:shadow-blue-300/40",
                                                                borderColor: "border-blue-300/30"
                                                            };
                                                        }

                                                        if (name.includes('kubernetes')) {
                                                            return {
                                                                gradient: "from-purple-500/80 to-indigo-600/80",
                                                                hoverEffect: "hover:shadow-indigo-300/40",
                                                                borderColor: "border-indigo-300/30"
                                                            };
                                                        }

                                                        if (name.includes('git')) {
                                                            return {
                                                                gradient: "from-gray-400/80 to-gray-600/80",
                                                                hoverEffect: "hover:shadow-gray-300/40",
                                                                borderColor: "border-gray-300/30"
                                                            };
                                                        }

                                                        if (name.includes('php')) {
                                                            return {
                                                                gradient: "from-indigo-500/80 to-indigo-700/80",
                                                                hoverEffect: "hover:shadow-indigo-300/40",
                                                                borderColor: "border-indigo-300/30"
                                                            };
                                                        }

                                                        if (name.includes('ruby')) {
                                                            return {
                                                                gradient: "from-pink-400/80 to-red-500/80",
                                                                hoverEffect: "hover:shadow-red-300/40",
                                                                borderColor: "border-red-300/30"
                                                            };
                                                        }

                                                        if (name.includes('c++')) {
                                                            return {
                                                                gradient: "from-blue-300/80 to-blue-500/80",
                                                                hoverEffect: "hover:shadow-blue-300/40",
                                                                borderColor: "border-blue-300/30"
                                                            };
                                                        }

                                                        if (name.includes('c#')) {
                                                            return {
                                                                gradient: "from-purple-400/80 to-purple-600/80",
                                                                hoverEffect: "hover:shadow-purple-300/40",
                                                                borderColor: "border-purple-300/30"
                                                            };
                                                        }

                                                        if (name.includes('go')) {
                                                            return {
                                                                gradient: "from-blue-500/80 to-teal-600/80",
                                                                hoverEffect: "hover:shadow-teal-300/40",
                                                                borderColor: "border-teal-300/30"
                                                            };
                                                        }

                                                        if (name.includes('swift')) {
                                                            return {
                                                                gradient: "from-orange-400/80 to-orange-600/80",
                                                                hoverEffect: "hover:shadow-orange-300/40",
                                                                borderColor: "border-orange-300/30"
                                                            };
                                                        }
                                                        if (name.includes('typescript')) {
                                                            return {
                                                                gradient: "from-blue-500/80 to-blue-600/80",
                                                                hoverEffect: "hover:shadow-blue-300/40",
                                                                borderColor: "border-blue-300/30",
                                                                fill: "#3178C6"
                                                            };
                                                        }

                                                        if (name.includes('html')) {
                                                            return {
                                                                gradient: "from-orange-500/80 to-orange-600/80",
                                                                hoverEffect: "hover:shadow-orange-300/40",
                                                                borderColor: "border-orange-300/30",
                                                                fill: "#E34F26"
                                                            };
                                                        }

                                                        if (name.includes('css')) {
                                                            return {
                                                                gradient: "from-blue-600/80 to-blue-700/80",
                                                                hoverEffect: "hover:shadow-blue-400/40",
                                                                borderColor: "border-blue-400/30",
                                                                fill: "#1572B6"
                                                            };
                                                        }

                                                        // Default to category-based color schemes if no specific match
                                                        const categoryConfig = {
                                                            Technical: {
                                                                gradient: "from-blue-400/80 to-indigo-500/80",
                                                                hoverEffect: "hover:shadow-blue-300/40",
                                                                borderColor: "border-blue-200/30"
                                                            },
                                                            'Soft Skill': {
                                                                gradient: "from-emerald-400/80 to-green-500/80",
                                                                hoverEffect: "hover:shadow-green-300/40",
                                                                borderColor: "border-green-200/30"
                                                            },
                                                            Management: {
                                                                gradient: "from-purple-400/80 to-fuchsia-500/80",
                                                                hoverEffect: "hover:shadow-purple-300/40",
                                                                borderColor: "border-purple-200/30"
                                                            }
                                                        };

                                                        return categoryConfig[skill.category] || categoryConfig.Technical;
                                                    };
                                                    // Function to get technology-specific icon based on skill name
                                                    const getSkillIcon = (skillName) => {
                                                        const name = skillName.toLowerCase();
                                                        if (name.includes('react')) {
                                                            return (
                                                                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="#61DAFB">
                                                                    <path d="M12 9.861A2.139 2.139 0 1 0 12 14.139 2.139 2.139 0 1 0 12 9.861zM6.008 16.255l-.472-.12C2.018 15.246 0 13.737 0 11.996s2.018-3.25 5.536-4.139l.472-.119.133.468a23.53 23.53 0 0 0 1.363 3.578l.101.213-.101.213a23.307 23.307 0 0 0-1.363 3.578l-.133.467zM5.317 8.95c-2.674.751-4.315 1.9-4.315 3.046 0 1.145 1.641 2.294 4.315 3.046a24.95 24.95 0 0 1 1.182-3.046A24.752 24.752 0 0 1 5.317 8.95zM17.992 16.255l-.133-.469a23.357 23.357 0 0 0-1.364-3.577l-.101-.213.101-.213a23.42 23.42 0 0 0 1.364-3.578l.133-.468.473.119c3.517.889 5.535 2.398 5.535 4.14s-2.018 3.25-5.535 4.139l-.473.12zm-.491-4.259c.48 1.039.877 2.06 1.182 3.046 2.675-.752 4.315-1.901 4.315-3.046 0-1.146-1.641-2.294-4.315-3.046a24.788 24.788 0 0 1-1.182 3.046zM5.31 8.945l-.133-.467C4.188 4.992 4.488 2.494 6 1.622c1.483-.856 3.864.155 6.359 2.716l.34.349-.34.349a23.552 23.552 0 0 0-2.422 2.967l-.135.193-.235.02a23.657 23.657 0 0 0-3.785.61l-.472.119zm1.896-6.63c-.268 0-.505.058-.705.173-.994.573-1.17 2.565-.485 5.253a25.122 25.122 0 0 1 3.233-.501 24.847 24.847 0 0 1 2.052-2.544c-1.56-1.519-3.037-2.381-4.095-2.381zm9.589 20.362c-.001 0-.001 0 0 0-1.425 0-3.255-1.073-5.154-3.023l-.34-.349.34-.349a23.53 23.53 0 0 0 2.421-2.968l.135-.193.234-.02a23.63 23.63 0 0 0 3.787-.609l.472-.119.134.468c.987 3.484.688 5.983-.824 6.854a2.38 2.38 0 0 1-1.205.308zm-4.096-3.381c1.56 1.519 3.037 2.381 4.095 2.381h.001c.267 0 .505-.058.704-.173.994-.573 1.171-2.566.485-5.254a25.02 25.02 0 0 1-3.234.501 24.674 24.674 0 0 1-2.051 2.545zM18.69 8.945l-.472-.119a23.479 23.479 0 0 0-3.787-.61l-.234-.02-.135-.193a23.414 23.414 0 0 0-2.421-2.967l-.34-.349.34-.349C14.135 1.778 16.515.767 18 1.622c1.512.872 1.812 3.37.823 6.856l-.133.467zm-4.134-1.076c1.012.103 2.01.267 2.968.491.684-2.688.509-4.68-.485-5.253-.988-.571-2.845.304-4.8 2.208A24.849 24.849 0 0 1 14.556 7.869zM7.9 21.87c.015 0 .03.002.046.002a2.38 2.38 0 0 0 1.158-.306c1.514-.873 1.813-3.371.824-6.856l-.132-.468-.472.119a23.474 23.474 0 0 1-3.787.61l-.234.02-.135.193a23.537 23.537 0 0 1-2.422 2.968l-.34.349.34.349c1.898 1.95 3.728 3.023 5.151 3.023zm-1.19-6.427c-.686 2.688-.509 4.681.485 5.254.987.563 2.843-.305 4.8-2.208a24.998 24.998 0 0 1-2.052-2.545 24.976 24.976 0 0 1-3.233-.501zM12 16.878c-.823 0-1.669-.036-2.516-.106l-.235-.02-.135-.193a30.388 30.388 0 0 1-1.35-2.122 30.354 30.354 0 0 1-1.166-2.228l-.1-.213.1-.213a30.3 30.3 0 0 1 1.166-2.228c.414-.716.869-1.43 1.35-2.122l.135-.193.235-.02a29.785 29.785 0 0 1 5.033 0l.234.02.134.193a30.006 30.006 0 0 1 2.517 4.35l.101.213-.101.213a29.6 29.6 0 0 1-2.517 4.35l-.134.193-.234.02c-.847.07-1.694.106-2.517.106zm-2.197-1.084c1.48.111 2.914.111 4.395 0a29.006 29.006 0 0 0 2.196-3.798 28.585 28.585 0 0 0-2.197-3.798 29.031 29.031 0 0 0-4.394 0 28.477 28.477 0 0 0-2.197 3.798 29.114 29.114 0 0 0 2.197 3.798z" />
                                                                </svg>
                                                            );
                                                        }
                                                        if (name.includes('javascript') || name === 'js') {
                                                            return (
                                                                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="#F7DF1E">
                                                                    <path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z" />
                                                                </svg>
                                                            );
                                                        }
                                                        if (name.includes('angular')) return (
                                                            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-white">
                                                                <path d="M9.931 12.645h4.138l-2.07-4.908m0-7.737L.68 3.982l1.726 14.771L12 24l9.596-5.242L23.32 3.984 11.999.001zm7.064 18.31h-2.638l-1.422-3.503H8.996l-1.422 3.504h-2.64L12 2.65z" />
                                                            </svg>
                                                        );
                                                        if (name.includes('vue')) return (
                                                            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-white">
                                                                <path d="M24 1.61h-9.94L12 5.16 9.94 1.61H0l12 20.78zm-18.77 3.22h2.9L12 12.93l3.87-8.1h2.9L12 18.39z" />
                                                            </svg>
                                                        );

                                                        // Backend/languages
                                                        if (name.includes('node') || name.includes('express')) return (
                                                            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-white">
                                                                <path d="M11.998,24c-0.321,0-0.641-0.084-0.922-0.247l-2.936-1.737c-0.438-0.245-0.224-0.332-0.08-0.383 c0.585-0.203,0.703-0.25,1.328-0.604c0.065-0.037,0.151-0.023,0.218,0.017l2.256,1.339c0.082,0.045,0.197,0.045,0.272,0l8.795-5.076 c0.082-0.047,0.134-0.141,0.134-0.238V6.921c0-0.099-0.053-0.192-0.137-0.242l-8.791-5.072c-0.081-0.047-0.189-0.047-0.271,0 L3.075,6.68C2.99,6.729,2.936,6.825,2.936,6.921v10.15c0,0.097,0.054,0.189,0.139,0.235l2.409,1.392 c1.307,0.654,2.108-0.116,2.108-0.89V7.787c0-0.142,0.114-0.253,0.256-0.253h1.115c0.139,0,0.255,0.112,0.255,0.253v10.021 c0,1.745-0.95,2.745-2.604,2.745c-0.508,0-0.909,0-2.026-0.551L2.28,18.675c-0.57-0.329-0.922-0.945-0.922-1.604V6.921 c0-0.659,0.353-1.275,0.922-1.603l8.795-5.082c0.557-0.315,1.296-0.315,1.848,0l8.794,5.082c0.57,0.329,0.924,0.944,0.924,1.603 v10.15c0,0.659-0.354,1.273-0.924,1.604l-8.794,5.078C12.643,23.916,12.324,24,11.998,24z M19.099,13.993 c0-1.9-1.284-2.406-3.987-2.763c-2.731-0.361-3.009-0.548-3.009-1.187c0-0.528,0.235-1.233,2.258-1.233 c1.807,0,2.473,0.389,2.747,1.607c0.024,0.115,0.129,0.199,0.247,0.199h1.141c0.071,0,0.138-0.031,0.186-0.081 c0.048-0.054,0.074-0.123,0.067-0.196c-0.177-2.098-1.571-3.076-4.388-3.076c-2.508,0-4.004,1.058-4.004,2.833 c0,1.925,1.488,2.457,3.895,2.695c2.88,0.282,3.103,0.703,3.103,1.269c0,0.983-0.789,1.402-2.642,1.402 c-2.327,0-2.839-0.584-3.011-1.742c-0.02-0.124-0.126-0.215-0.253-0.215h-1.137c-0.141,0-0.254,0.112-0.254,0.253 c0,1.482,0.806,3.248,4.655,3.248C17.501,17.007,19.099,15.91,19.099,13.993z" />
                                                            </svg>
                                                        );
                                                        if (name.includes('python')) return (
                                                            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-white">
                                                                <path d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09zm13.09 3.95l.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.88.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46.26-.38.3-.32.33-.24.35-.2.35-.14.33-.1.3-.06.26-.04.21-.02.13-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01zm-6.47 14.25l-.23.33-.08.41.08.41.23.33.33.23.41.08.41-.08.33-.23.23-.33.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08z" />
                                                            </svg>
                                                        );
                                                        if (name.includes('java')) return (
                                                            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-white">
                                                                <path d="M8.851 18.56s-.917.534.653.714c1.902.218 2.874.187 4.969-.211 0 0 .552.346 1.321.646-4.699 2.013-10.633-.118-6.943-1.149M8.276 15.933s-1.028.761.542.924c2.032.209 3.636.227 6.413-.308 0 0 .384.389.987.602-5.679 1.661-12.007.13-7.942-1.218M13.116 11.475c1.158 1.333-.304 2.533-.304 2.533s2.939-1.518 1.589-3.418c-1.261-1.772-2.228-2.652 3.007-5.688 0-.001-8.216 2.051-4.292 6.573M19.33 20.504s.679.559-.747.991c-2.712.822-11.288 1.069-13.669.033-.856-.373.75-.89 1.254-.998.527-.114.828-.093.828-.093-.953-.671-6.156 1.317-2.643 1.887 9.58 1.553 17.462-.7 14.977-1.82M9.292 13.21s-4.362 1.036-1.544 1.412c1.189.159 3.561.123 5.77-.062 1.806-.152 3.618-.477 3.618-.477s-.637.272-1.098.587c-4.429 1.165-12.986.623-10.522-.568 2.082-1.006 3.776-.892 3.776-.892M17.116 17.584c4.503-2.34 2.421-4.589.968-4.285-.355.074-.515.138-.515.138s.132-.207.385-.297c2.875-1.011 5.086 2.981-.928 4.562 0-.001.07-.062.09-.118M14.401 0s2.494 2.494-2.365 6.33c-3.896 3.077-.888 4.832-.001 6.836-2.274-2.053-3.943-3.858-2.824-5.539 1.644-2.469 6.197-3.665 5.19-7.627M9.734 23.924c4.322.277 10.959-.153 11.116-2.198 0 0-.302.775-3.572 1.391-3.688.694-8.239.613-10.937.168 0 0 .553.457 3.393.639" />
                                                            </svg>
                                                        );

                                                        // DevOps tools
                                                        if (name.includes('docker')) return (
                                                            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-white">
                                                                <path d="M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.185.185.186m-2.93 0h2.12a.186.186 0 00.184-.186V6.29a.185.185 0 00-.185-.185H8.1a.185.185 0 00-.185.185v1.887c0 .102.083.185.185.186m-2.964 0h2.119a.186.186 0 00.185-.186V6.29a.185.185 0 00-.185-.185H5.136a.186.186 0 00-.186.185v1.887c0 .102.084.185.186.186m5.893 2.715h2.118a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.185-.186H5.136a.186.186 0 00-.186.185v1.888c0 .102.084.185.186.185m-2.92 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.082.185.185.185M23.763 9.89c-.065-.051-.672-.51-1.954-.51-.338.001-.676.03-1.01.087-.248-1.7-1.653-2.53-1.716-2.566l-.344-.199-.226.327c-.284.438-.49.922-.612 1.43-.23.97-.09 1.882.403 2.661-.595.332-1.55.413-1.744.42H.751a.751.751 0 00-.75.748 11.376 11.376 0 00.692 4.062c.545 1.428 1.355 2.48 2.41 3.124 1.18.723 3.1 1.137 5.275 1.137.983.003 1.963-.086 2.93-.266a12.248 12.248 0 003.823-1.389c.98-.567 1.86-1.288 2.61-2.136 1.252-1.418 1.998-2.997 2.553-4.4h.221c1.372 0 2.215-.549 2.68-1.009.309-.293.55-.65.707-1.046l.098-.288Z" />
                                                            </svg>
                                                        );
                                                        if (name.includes('kubernetes') || name.includes('k8s')) return (
                                                            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-white">
                                                                <path d="M10.204 14.35l.007.01-.999 2.413a5.171 5.171 0 0 1-2.075-2.597l2.578-.437.004.005a.44.44 0 0 1 .484.606zm-.833-2.129a.44.44 0 0 0 .173-.756l.002-.011L7.585 9.7a5.143 5.143 0 0 0-.73 3.255l2.514-.725.002-.009zm1.145-1.98a.44.44 0 0 0 .699-.337l.01-.005.15-2.62a5.144 5.144 0 0 0-3.01 1.442l2.147 1.523.004-.002zm.76 2.75l.723.349.722-.347.18-.78-.5-.623h-.804l-.5.623.179.779zm1.5-3.095a.44.44 0 0 0 .7.336l.008.003 2.134-1.513a5.188 5.188 0 0 0-2.992-1.442l.148 2.615.002.001zm1.145 1.98a.44.44 0 0 0 .173.755l.002.01 2.516.726a5.186 5.186 0 0 0-.732-3.254l-1.955 1.755-.004.007zm-1.371 3.65a.44.44 0 0 0 .485-.606l.007-.012-.999-2.41a5.147 5.147 0 0 0-2.074 2.597l2.578.437.003-.006zM12 5.436l-.17.988.323.948h2.609l-2.325 1.681.284 1.136 1.99-.226-1.528 2.3 1.528 2.3-1.99-.226-.284 1.136 2.325 1.681h-2.609l-.323.948.17.988.17-.988-.323-.948H9.264l2.325-1.681-.284-1.136-1.99.226 1.528-2.3-1.528-2.3 1.99.226.284-1.136L9.264 7.372h2.609l.323-.948L12 5.436z" />
                                                                <path d="M23.677 11.983a11.831 11.831 0 0 0-.426-3.133 11.74 11.74 0 0 0-1.347-2.778 12.029 12.029 0 0 0-2.118-2.25 12.336 12.336 0 0 0-2.652-1.628A12.134 12.134 0 0 0 14.176 1.5a11.83 11.83 0 0 0-3.169-.431 11.931 11.931 0 0 0-3.153.414 11.995 11.995 0 0 0-2.926 1.27 11.824 11.824 0 0 0-2.437 1.994 11.707 11.707 0 0 0-1.853 2.584 12.052 12.052 0 0 0-1.133 2.914 12.44 12.44 0 0 0-.378 3.03 12.306 12.306 0 0 0 .526 3.163 11.931 11.931 0 0 0 1.46 2.803 12.19 12.19 0 0 0 2.207 2.292 12.414 12.414 0 0 0 2.77 1.621 12.063 12.063 0 0 0 3.064.728 12.481 12.481 0 0 0 3.168.049 12.282 12.282 0 0 0 3.097-.741 12.59 12.59 0 0 0 2.781-1.62 12.487 12.487 0 0 0 2.267-2.253 12.135 12.135 0 0 0 1.7-2.72 12.577 12.577 0 0 0 .931-2.931c.178-.907.27-1.833.274-2.76-.01-.873-.092-1.742-.246-2.598v-.001zm-2.137 4.992a9.529 9.529 0 0 1-1.256 2.373 9.357 9.357 0 0 1-1.953 1.925 8.91 8.91 0 0 1-2.503 1.269 9.004 9.004 0 0 1-2.637.384 9.03 9.03 0 0 1-3.055-.516 9.25 9.25 0 0 1-2.578-1.458 9.119 9.119 0 0 1-1.91-2.155 8.962 8.962 0 0 1-1.102-2.67 9.255 9.255 0 0 1-.245-2.781 9.01 9.01 0 0 1 .576-2.73 9.03 9.03 0 0 1 1.333-2.302 9.354 9.354 0 0 1 1.96-1.817 8.979 8.979 0 0 1 2.53-1.19 9.03 9.03 0 0 1 2.75-.299 8.972 8.972 0 0 1 2.768.636 9.338 9.338 0 0 1 2.406 1.52 9.364 9.364 0 0 1 1.786 2.193 9.014 9.014 0 0 1 .89 2.704c.13.902.115 1.823-.045 2.72a8.979 8.979 0 0 1-.714 2.175h-.001z" />
                                                            </svg>
                                                        );
                                                        if (name.includes('aws')) return (
                                                            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-white">
                                                                <path d="M6.763 10.036c0 .296.032.535.088.71.064.176.144.368.256.576.04.063.056.127.056.183 0 .08-.048.16-.152.24l-.503.335a.383.383 0 0 1-.208.072c-.08 0-.16-.04-.239-.112a2.47 2.47 0 0 1-.287-.375 6.18 6.18 0 0 1-.248-.471c-.622.734-1.405 1.101-2.347 1.101-.67 0-1.205-.191-1.596-.574-.391-.384-.59-.894-.59-1.533 0-.678.239-1.23.726-1.644.487-.415 1.133-.623 1.955-.623.272 0 .551.024.846.064.296.04.6.104.918.176v-.583c0-.607-.127-1.03-.375-1.277-.255-.248-.686-.367-1.3-.367-.28 0-.568.031-.863.103-.295.072-.59.158-.885.256a2.29 2.29 0 0 1-.286.08 1.46 1.46 0 0 1-.096.023c-.08 0-.15-.023-.199-.087-.047-.064-.08-.159-.08-.287v-.451c0-.128.016-.224.056-.28a.597.597 0 0 1 .224-.167c.279-.135.614-.249 1.005-.343.39-.095.806-.143 1.244-.143.944 0 1.638.216 2.075.648.431.43.647 1.085.647 1.964v2.577zm-3.24 1.214c.263 0 .534-.048.822-.144.287-.096.543-.271.758-.51.128-.152.224-.32.272-.512.047-.191.08-.423.08-.694v-.335a6.66 6.66 0 0 0-.735-.136 6.02 6.02 0 0 0-.75-.048c-.535 0-.926.104-1.19.32-.263.215-.39.518-.39.917 0 .375.095.647.285.815.191.16.454.239.798.239zm6.41.862c-.104 0-.175-.024-.232-.064-.063-.04-.12-.16-.168-.312L7.338 6.4c-.047-.16-.08-.287-.08-.369 0-.152.071-.24.231-.24h.944c.18 0 .304.025.367.072.064.04.12.16.168.312l1.788 5.05 1.669-5.05c.04-.16.088-.272.168-.312a.74.74 0 0 1 .367-.072h.775c.183 0 .304.024.36.072.072.04.12.16.167.312l1.694 5.114 1.837-5.114c.048-.16.104-.272.168-.312a.69.69 0 0 1 .367-.072h.903c.152 0 .231.096.231.24 0 .05-.008.111-.032.183-.024.078-.057.16-.088.247l-2.38 5.336c-.048.16-.104.271-.167.319a.653.653 0 0 1-.24.063h-.832c-.08 0-.215-.016-.279-.08-.063-.062-.12-.175-.159-.319l-1.661-4.9-1.65 4.892c-.048.152-.088.264-.16.327-.064.063-.183.08-.32.08h-.831m13.179-.862c-.455 0-.815-.071-1.12-.223-.296-.152-.503-.36-.59-.616-.032-.111-.048-.184-.048-.24 0-.152.072-.24.216-.24h.91c.166 0 .279.023.32.071.08.068.175.136.287.229.112.088.232.159.39.206.152.048.32.08.519.08.287 0 .519-.056.686-.16.183-.104.27-.255.27-.454 0-.136-.048-.247-.127-.344-.08-.095-.215-.151-.39-.223-.18-.063-.43-.144-.694-.216-.39-.111-.71-.223-.99-.351a1.817 1.817 0 0 1-.637-.519c-.16-.2-.23-.447-.23-.74 0-.351.095-.654.295-.926.2-.271.47-.48.838-.623.367-.144.783-.223 1.254-.223.367 0 .694.048 1.004.136.311.088.574.223.774.391.208.176.319.372.358.63.8.08.020.136.020.16 0 .151-.08.247-.223.247h-.877c-.151 0-.263-.024-.327-.08-.064-.048-.136-.12-.232-.215-.192-.152-.423-.23-.694-.23-.263 0-.455.048-.592.151-.128.104-.2.24-.2.383 0 .12.048.223.128.319.088.08.207.151.374.206.160.056.43.144.734.232.375.112.695.224.966.344.271.12.479.272.63.471.144.208.224.456.224.758 0 .36-.104.671-.296.966-.199.295-.478.52-.846.678-.375.144-.819.224-1.334.224m-9.844.814c-3.519 0-6.335-.088-8.258-.255-.767-.064-1.285-.444-1.445-1.07a15.417 15.417 0 0 1-.414-3.845c0-1.468.127-2.7.375-3.7.16-.623.679-1.022 1.46-1.101 1.924-.183 4.74-.28 8.282-.28 3.527 0 6.359.097 8.275.28.779.08 1.301.478 1.45 1.101.26 1 .391 2.215.391 3.7 0 1.468-.13 2.699-.391 3.689-.15.635-.678 1.022-1.45 1.07-1.916.175-4.748.272-8.275.272zm.134-12.779c-3.631 0-6.519.104-8.59.295-.904.1-1.558.67-1.766 1.534-.271 1.062-.407 2.351-.407 3.88 0 1.47.136 2.716.407 3.78.208.872.862 1.45 1.766 1.541 2.071.191 4.959.287 8.59.287 3.631 0 6.519-.096 8.598-.287.903-.08 1.558-.669 1.766-1.541.256-1.038.39-2.284.39-3.78 0-1.505-.134-2.794-.39-3.85-.216-.872-.863-1.453-1.775-1.533-2.08-.2-4.966-.304-8.589-.304z" />
                                                            </svg>
                                                        );

                                                        // Databases
                                                        if (name.includes('mongodb')) return (
                                                            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="#589636" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M22.088 7.844c-.706-1.652-1.75-3.005-2.802-4.055C17.927 2.43 15.826 1.04 12 1.04s-5.926 1.39-7.286 2.75C3.663 4.834 2.62 6.188 1.917 7.84c-.043.104-.105.147-.105.147s0 .005 0 .005c0 1.362.934 2.623 1.861 3.527 1.029 1.063 2.234 1.894 3.482 2.488 1.87.882 3.49 1.324 4.69 1.324s2.82-.442 4.69-1.324c1.247-.594 2.452-1.425 3.483-2.488.93-.904 1.863-2.165 1.863-3.527 0 0-.063-.043-.106-.147z" />
                                                            </svg>
                                                        );

                                                        if (name.includes('mysql')) return (
                                                            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-white">
                                                                <path d="M16.405 5.501c-.115 0-.193.014-.274.033v.013h.014c.054.104.146.18.214.273.054.107.1.214.154.32l.014-.015c.094-.066.14-.172.14-.333-.04-.047-.046-.094-.08-.14-.04-.067-.126-.1-.18-.153zM5.77 18.695h-.927a50.854 50.854 0 00-.27-4.41h-.008l-1.41 4.41H2.45l-1.4-4.41h-.01a72.892 72.892 0 00-.195 4.41H0c.055-1.966.192-3.81.41-5.53h1.15l1.335 4.064h.008l1.347-4.064h1.095c.242 2.015.384 3.86.428 5.53zm4.017-4.08c-.378 2.045-.876 3.533-1.492 4.46-.482.716-1.01 1.073-1.583 1.073-.153 0-.34-.046-.566-.138v-.494c.11.017.24.026.386.026.268 0 .483-.075.647-.222.197-.18.295-.382.295-.605 0-.155-.077-.47-.23-.944L6.23 14.615h.91l.727 2.36c.164.536.233.91.205 1.123.4-1.064.678-2.227.835-3.483zm12.325 4.08h-2.63v-5.53h.885v4.85h1.745zm-3.32.135l-1.016-.5c.09-.076.177-.158.255-.25.433-.506.648-1.258.648-2.253 0-1.83-.718-2.746-2.155-2.746-.704 0-1.254.232-1.65.697-.43.508-.646 1.256-.646 2.245 0 .972.19 1.686.574 2.14.337.405.83.607 1.482.607.223 0 .41-.02.566-.06l1.03 1.05.12-.62L20.79 18.83zM17.1 16.1c-.213.34-.676.517-1.067.517-.263 0-.47-.058-.632-.173-.197-.138-.296-.44-.296-.91v-.03c0-.758.209-1.138.627-1.138.34 0 .577.13.71.39.132.255.198.663.198 1.225 0 .64-.095.99-.286 1.133zm3.082-8.07c-.15-.972-.936-1.994-1.015-2.003.03-.01-1.06-.33-1.79-.46.02-.02-.075-.082-.11-.096a7.257 7.257 0 01-.935-.595c-.227-.168-.405-.332-.615-.528-.404-.4-.71-.923-1.195-1.253-.315-.213-.872-.434-1.567-.464-.36-.017-.728.008-1.055.073-.335.068-.636.177-.903.328a3.266 3.266 0 00-.865.675c-.84.113-.795.223-.83.344-.13.044.95.16.207.247.114.09.84.033.12.126a.756.756 0 01.116.555c-.044.367-.26.584-.453.74-.162.136-.435.21-.756.244-.35.04-.718.013-1.05-.052-.377-.073-.695-.22-.92-.398-.223-.18-.317-.4-.317-.664 0-.08.01-.17.026-.265a.931.931 0 01.056-.265c.02-.064.06-.13.122-.2.262-.3.519-.43.908-.344.215.046.458.052.684.006a2.19 2.19 0 00.6-.192c.005-.002.03-.013.09-.04.006-.002.01-.005.016-.01.103-.065.19-.134.228-.216a.449.449 0 00.023-.343.514.514 0 00-.084-.157.742.742 0 00-.192-.206 2.162 2.162 0 00-.677-.366c-.275-.1-.602-.155-.92-.156-.34-.002-.666.053-.984.155-.305.102-.578.262-.82.494-.134.126-.235.282-.313.452a1.635 1.635 0 00-.146.554 1.9 1.9 0 00.036.783c.537 2.045 3.147 2.86 3.865 3.394.29.218.82.654.83.716-.053.363-.36 1.37.325 2.005.334.306 1.13.123 1.457.022.963-.292 2.19-1.958 3.057-2.457.384-.22.842-.414 1.345-.63.367-.155.6-.272.838-.334.117-.03.25-.05.4-.053.15-.004.297.008.44.04.255.058.49.193.676.407.55.64-.003 1.94-.7 2.626-.386.383-2.863 1.504-2.917 1.636.125.058.668.377.95.504.285.13 1.27.53 1.94.333.252-.76.624-.2.937-.348.04-.02.302-.124.43-.193.243-.13.513-.308.732-.497.386-.32.604-.757.637-1.306.03-.522-.158-.902-.43-1.302-.138-.201.38-1.237.12-2.364-.106-.474-.25-.92-.456-1.367-.084-.182-1.76-3.344-1.853-3.5-.06-.104.182-.178.225-.21.104-.086.204-.172.315-.25.206-.15.43-.285.674-.386.184-.075.414-.123.614-.12.05.001.983-.09 1.005-.086-.398-.24-2.856-1.764-3.066-2.942-.05-.284-.028-.554.06-.81.737.086 1.447.15 1.466.15.37.008.73.008 1.085.832.737.837 1.414 1.683 2.048 2.532.28.036.227.29.217.352.434.024.87.035 1.302.03.355-.004.874-.044 1.195-.1.075-.014.152-.03.23-.05l.056-.018c-.482-.814-.71-1.896-.635-3.293.077-1.423.516-3.118 1.154-4.402l.146-.288.917-.155c-.096-.5-.672-3.194-1.878-3.657-.446-.17-2.234-.602-3.097-.763-1.66-.31-3.363-.425-5.723-.684-1.006-.11-2.442-.097-2.395-.174-.005-.075-1.976-.214-2.128-.23-.006-.001-.587-.056-1.158-.056-1.446.001-3.096.211-3.98.668-.273.142-.547.298-.666.358-.08.04-.378.187-.416.21l.006.003c-.297.15-.47.28-.572.344" fillRule="evenodd" />
                                                            </svg>
                                                        );
                                                        if (name.includes('git')) {
                                                            return (
                                                                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="#F05032">
                                                                    {/* SVG path for Git logo from Simple Icons */}
                                                                    <path d="M12 0C5.37 0 0 5.37 0 12a12 12 0 0 0 8.21 11.39c.6.11.82-.26.82-.58 0-.29-.01-1.06-.02-2.08-3.34.73-4.04-1.61-4.04-1.61-.55-1.4-1.35-1.77-1.35-1.77-1.1-.75.08-.74.08-.74 1.22.09 1.86 1.26 1.86 1.26 1.08 1.84 2.83 1.31 3.52 1 .11-.78.42-1.31.77-1.61-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.3-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.93.43.37.82 1.1.82 2.21 0 1.6-.02 2.88-.02 3.28 0 .32.22.7.82.58A12 12 0 0 0 24 12C24 5.37 18.63 0 12 0Z" />
                                                                </svg>
                                                            );
                                                        }

                                                        // PHP Icon
                                                        if (name.includes('php')) {
                                                            return (
                                                                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="#777BB4">
                                                                    {/* Simplified SVG path for PHP logo */}
                                                                    <path d="M12 2C7.58 2 4 3 4 3v18s3.58 1 8 1 8-1 8-1V3s-3.58-1-8-1zm0 2c4.08 0 7.5.52 7.5.52v16S16.08 20 12 20 4.5 20 4.5 20V4.52S7.92 4 12 4z" />
                                                                    <path d="M11.4 8h1.2v8h-1.2z" />
                                                                </svg>
                                                            );
                                                        }

                                                        // Ruby Icon
                                                        if (name.includes('ruby')) {
                                                            return (
                                                                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="#CC342D">
                                                                    {/* Simplified SVG path for Ruby (gem) logo */}
                                                                    <path d="M12 2L2 12l10 10 10-10L12 2zM12 18.5c-3.03 0-5.5-2.47-5.5-5.5S8.97 7.5 12 7.5 17.5 9.97 17.5 13 15.03 18.5 12 18.5z" />
                                                                </svg>
                                                            );
                                                        }

                                                        // C++ Icon
                                                        if (name.includes('c++')) {
                                                            return (
                                                                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="#00599C">
                                                                    {/* Minimal C++ badge with text */}
                                                                    <rect width="24" height="24" rx="4" />
                                                                    <text x="12" y="16" fontSize="10" textAnchor="middle" fill="#fff">C++</text>
                                                                </svg>
                                                            );
                                                        }

                                                        // C# Icon
                                                        if (name.includes('c#')) {
                                                            return (
                                                                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="#239120">
                                                                    {/* Minimal C# badge with text */}
                                                                    <rect width="24" height="24" rx="4" />
                                                                    <text x="12" y="16" fontSize="10" textAnchor="middle" fill="#fff">C#</text>
                                                                </svg>
                                                            );
                                                        }

                                                        // Go Icon
                                                        if (name.includes('go')) {
                                                            return (
                                                                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="#00ADD8">
                                                                    {/* Simplified Go logo */}
                                                                    <circle cx="12" cy="12" r="10" />
                                                                    <text x="12" y="16" fontSize="10" textAnchor="middle" fill="#fff">Go</text>
                                                                </svg>
                                                            );
                                                        }

                                                        // Swift Icon
                                                        if (name.includes('swift')) {
                                                            return (
                                                                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="#F05138">
                                                                    {/* Simplified Swift logo */}
                                                                    <path d="M12 2L2 12l10 10 10-10L12 2z" />
                                                                    <text x="12" y="16" fontSize="10" textAnchor="middle" fill="#fff">Swift</text>
                                                                </svg>
                                                            );
                                                        }

                                                        // TypeScript Icon
                                                        if (name.includes('typescript')) {
                                                            return (
                                                                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="#3178C6">
                                                                    {/* Simplified TypeScript badge */}
                                                                    <rect x="2" y="2" width="20" height="20" rx="4" />
                                                                    <text x="12" y="16" fontSize="10" textAnchor="middle" fill="#fff">TS</text>
                                                                </svg>
                                                            );
                                                        }

                                                        // HTML5 Icon
                                                        if (name.includes('html')) {
                                                            return (
                                                                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="#E34F26">
                                                                    {/* Simplified HTML5 badge */}
                                                                    <path d="M1.5 0h21l-1.905 21.5L12 24l-8.595-2.5L1.5 0z" />
                                                                    <text x="12" y="18" fontSize="6" textAnchor="middle" fill="#fff">HTML5</text>
                                                                </svg>
                                                            );
                                                        }

                                                        // CSS3 Icon
                                                        if (name.includes('css')) {
                                                            return (
                                                                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="#1572B6">
                                                                    {/* Simplified CSS3 badge */}
                                                                    <path d="M1.5 0h21l-1.905 21.5L12 24l-8.595-2.5L1.5 0z" />
                                                                    <text x="12" y="18" fontSize="6" textAnchor="middle" fill="#fff">CSS3</text>
                                                                </svg>
                                                            );
                                                        }


                                                    };

                                                    // Define category-specific properties
                                                    const colorScheme = getSkillColorScheme(skill.name);
                                                    return (
                                                        <span
                                                            key={skill._id}
                                                            className={`inline-flex items-center px-2 py-1 rounded-full bg-gradient-to-r ${colorScheme.gradient} shadow-sm backdrop-blur-sm text-white text-xs font-medium tracking-wide gap-1 ${colorScheme.borderColor} hover:scale-105 transition-all ${colorScheme.hoverEffect} cursor-default`}
                                                        >
                                                            <span className="flex-shrink-0">
                                                                {getSkillIcon(skill.name)}
                                                            </span>
                                                            {skill.name}
                                                        </span>
                                                    );
                                                })
                                            }
                                        </div>
                                    </div>
                                    {!isEditing && (
                                        <div className="flex flex-col gap-3 mt-4">
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                className="btn btn-primary"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-5 w-5 mr-2"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                    />
                                                </svg>
                                                Edit Profile
                                            </button>

                                            <button
                                                onClick={generateCV}
                                                className="btn btn-outline btn-secondary gap-2"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-5 w-5"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                    />
                                                </svg>
                                                Generate CV
                                            </button>
                                        </div>


                                    )}



                                </div>


                            </div>
                        </div>
                        <div className="tabs tabs-boxed bg-base-200 px-6">
                            <button
                                className={`tab ${activeTab === 'profile' ? 'tab-active' : ''}`}
                                onClick={() => setActiveTab('profile')}
                            >
                                Profile
                            </button>
                            <button
                                className={`tab ${activeTab === 'Skills' ? 'tab-active' : ''}`}
                                onClick={() => setActiveTab('Skills')}
                            >
                                Skills
                            </button>
                            <button
                                className={`tab ${activeTab === 'Certifications' ? 'tab-active' : ''}`}
                                onClick={() => setActiveTab('Certifications')}
                            >
                                Certifications
                            </button>
                            <button
                                className={`tab ${activeTab === 'Experience' ? 'tab-active' : ''}`}
                                onClick={() => setActiveTab('Experience')}
                            >
                                Experience
                            </button>
                            <button
                                className={`tab ${activeTab === 'security' ? 'tab-active' : ''}`}
                                onClick={() => setActiveTab('security')}
                            >
                                Security
                            </button>
                            <button
                                className={`tab ${activeTab === 'preferences' ? 'tab-active' : ''}`}
                                onClick={() => setActiveTab('preferences')}
                            >
                                Preferences
                            </button>
                        </div>
                        <div className="bg-base-100 shadow-xl rounded-b-lg p-6">

                        {activeTab === 'Skills' && (
                                <div className="mt-4 p-6 bg-base-100 rounded-lg border border-base-300">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-bold text-primary">My Skills</h2>
                                        <button
                                            onClick={() => {
                                                setShowSkillForm(true);
                                                setEditingSkillId(null);
                                                setNewSkill({ name: '', description: '', category: 'Technical', tags: 50 });
                                            }}
                                            className="btn btn-primary gap-2"
                                            disabled={showSkillForm}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            Add Skill
                                        </button>
                                    </div>

                                    {/* Filtres ajoutés ici */}
                                    <div className="mb-6 bg-base-200 p-4 rounded-lg">
                                        <div className="flex flex-wrap gap-4 items-center">
                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="label-text">Filter by Category</span>
                                                </label>
                                                <select
                                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                                    className="select select-bordered"
                                                    defaultValue="all"
                                                >
                                                    <option value="all">All Categories</option>
                                                    <option value="Technical">Technical</option>
                                                    <option value="Soft Skill">Soft Skill</option>
                                                    <option value="Management">Management</option>
                                                </select>
                                            </div>

                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="label-text">Filter by Skill Level</span>
                                                </label>
                                                <select
                                                    onChange={(e) => setLevelFilter(e.target.value)}
                                                    className="select select-bordered"
                                                    defaultValue="all"
                                                >
                                                    <option value="all">All Levels</option>
                                                    <option value="expert">Expert (70-100)</option>
                                                    <option value="advanced">Advanced (50-70)</option>
                                                    <option value="intermediate">Intermediate (30-50)</option>
                                                    <option value="beginner">Beginner (0-30)</option>
                                                </select>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    setCategoryFilter('all');
                                                    setLevelFilter('all');
                                                }}
                                                className="btn btn-ghost mt-6"
                                            >
                                                Reset Filters
                                            </button>
                                        </div>
                                    </div>

                                    {showSkillForm && (
                                        <div className="card bg-base-200 shadow-lg mb-8">
                                            <div className="card-body">
                                                <h3 className="card-title text-lg mb-4">
                                                    {editingSkillId ? 'Edit Skill' : 'New Skill'}
                                                </h3>
                                                <form
                                                    onSubmit={editingSkillId ? handleUpdateSkill : handleAddSkill}
                                                    className="space-y-4"
                                                >
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="form-control">
                                                            <label className="label">
                                                                <span className="label-text">Name*</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={editingSkillId ? editSkillData.name : newSkill.name}
                                                                onChange={(e) =>
                                                                    editingSkillId
                                                                        ? setEditSkillData({
                                                                            ...editSkillData,
                                                                            name: e.target.value,
                                                                        })
                                                                        : setNewSkill({
                                                                            ...newSkill,
                                                                            name: e.target.value,
                                                                        })
                                                                }
                                                                className="input input-bordered"
                                                                placeholder="Ex: React, Project Management"
                                                                required
                                                            />
                                                        </div>
                                                        <div className="form-control">
                                                            <label className="label">
                                                                <span className="label-text">Category*</span>
                                                            </label>
                                                            <select
                                                                value={editingSkillId ? editSkillData.category : newSkill.category}
                                                                onChange={(e) =>
                                                                    editingSkillId
                                                                        ? setEditSkillData({
                                                                            ...editSkillData,
                                                                            category: e.target.value,
                                                                        })
                                                                        : setNewSkill({
                                                                            ...newSkill,
                                                                            category: e.target.value,
                                                                        })
                                                                }
                                                                className="select select-bordered"
                                                                required
                                                            >
                                                                <option value="Technical">Technical</option>
                                                                <option value="Soft Skill">Soft Skill</option>
                                                                <option value="Management">Management</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="form-control">
                                                        <label className="label">
                                                            <span className="label-text">Description*</span>
                                                        </label>
                                                        <textarea
                                                            value={editingSkillId ? editSkillData.description : newSkill.description}
                                                            onChange={(e) =>
                                                                editingSkillId
                                                                    ? setEditSkillData({
                                                                        ...editSkillData,
                                                                        description: e.target.value,
                                                                    })
                                                                    : setNewSkill({
                                                                        ...newSkill,
                                                                        description: e.target.value,
                                                                    })
                                                            }
                                                            className="textarea textarea-bordered h-24"
                                                            placeholder="Describe your skill..."
                                                            required
                                                        />
                                                    </div>
                                                    <div className="form-control">
                                                        <label className="label">
                                                            <span className="label-text">Proficiency Level (0-100)*</span>
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            value={editingSkillId ? editSkillData.tags : newSkill.tags}
                                                            onChange={(e) => {
                                                                const value = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                                                                editingSkillId
                                                                    ? setEditSkillData({ ...editSkillData, tags: value })
                                                                    : setNewSkill({ ...newSkill, tags: value });
                                                            }}
                                                            className="input input-bordered"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="flex justify-end gap-3 mt-6">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setShowSkillForm(false);
                                                                setEditingSkillId(null);
                                                                setEditSkillData({ name: '', description: '', category: 'Technical', tags: 50 });
                                                            }}
                                                            className="btn btn-ghost"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button type="submit" className="btn btn-primary">
                                                            {editingSkillId ? 'Update' : 'Add'}
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    )}

                                    {skills.length === 0 && !showSkillForm ? (
                                        <div className="text-center py-12">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-12 w-12 mx-auto text-gray-400"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={1.5}
                                                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                                />
                                            </svg>
                                            <h3 className="mt-4 text-lg font-medium text-gray-500">No skills added yet</h3>
                                            <p className="mt-1 text-gray-400">Add your skills to display them here</p>
                                            <button
                                                onClick={() => setShowSkillForm(true)}
                                                className="btn btn-primary mt-6"
                                            >
                                                Add Skill
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {skills
                                                .filter(skill => {
                                                    // Filtre par catégorie
                                                    if (categoryFilter !== 'all' && skill.category !== categoryFilter) {
                                                        return false;
                                                    }

                                                    // Filtre par niveau
                                                    if (levelFilter !== 'all') {
                                                        switch (levelFilter) {
                                                            case 'expert':
                                                                return skill.tags > 70;
                                                            case 'advanced':
                                                                return skill.tags > 50 && skill.tags <= 70;
                                                            case 'intermediate':
                                                                return skill.tags > 30 && skill.tags <= 50;
                                                            case 'beginner':
                                                                return skill.tags <= 30;
                                                            default:
                                                                return true;
                                                        }
                                                    }

                                                    return true;
                                                })
                                                .map((skill) => {
                                                    const categoryColors = {
                                                        Technical: 'bg-blue-200 text-blue-800',
                                                        'Soft Skill': 'bg-green-200 text-green-800',
                                                        Management: 'bg-purple-200 text-purple-800',
                                                    };

                                                    // Déterminer le niveau de compétence
                                                    let skillLevel = "";
                                                    let levelClass = "";
                                                    if (skill.tags > 70) {
                                                        skillLevel = "Expert";
                                                        levelClass = "badge-success";
                                                    } else if (skill.tags > 50) {
                                                        skillLevel = "Advanced";
                                                        levelClass = "badge-warning";
                                                    } else if (skill.tags > 30) {
                                                        skillLevel = "Intermediate";
                                                        levelClass = "badge-info";
                                                    } else {
                                                        skillLevel = "Beginner";
                                                        levelClass = "badge-outline";
                                                    }

                                                    return (
                                                        <div
                                                            key={skill._id}
                                                            className="card bg-base-100 border border-base-300 hover:border-primary transition-colors h-full"
                                                        >
                                                            <div className="card-body p-3">
                                                                <div className="flex flex-row gap-4">
                                                                    {/* Partie gauche - Contenu textuel */}
                                                                    <div className="flex-1">
                                                                        <div className="flex justify-between items-start mb-2">
                                                                            <h3 className="card-title text-lg">
                                                                                {skill.name}
                                                                            </h3>
                                                                            <span className={`badge ${categoryColors[skill.category]} capitalize`}>
                                                                                {skill.category}
                                                                            </span>
                                                                        </div>

                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <span className={`badge ${levelClass}`}>
                                                                                {skillLevel}
                                                                            </span>

                                                                        </div>

                                                                        {skill.description && (
                                                                            <p className="text-base-content/80 line-clamp-3">
                                                                                {skill.description}
                                                                            </p>
                                                                        )}
                                                                    </div>

                                                                    {/* Partie droite - Cercle de progression et boutons */}
                                                                    <div className="flex flex-col items-center justify-between">
                                                                        <ProgressCircle percentage={skill.tags} size={60} strokeWidth={4} />

                                                                        <div className="flex gap-2 mt-2">
                                                                            <button
                                                                                onClick={() => handleEditSkill(skill)}
                                                                                className="btn btn-square btn-xs btn-ghost"
                                                                                title="Edit"
                                                                            >
                                                                                <svg
                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                    className="h-4 w-4"
                                                                                    fill="none"
                                                                                    viewBox="0 0 24 24"
                                                                                    stroke="currentColor"
                                                                                >
                                                                                    <path
                                                                                        strokeLinecap="round"
                                                                                        strokeLinejoin="round"
                                                                                        strokeWidth={2}
                                                                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                                                    />
                                                                                </svg>
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleDeleteSkill(skill._id)}
                                                                                className="btn btn-square btn-xs btn-ghost text-error"
                                                                                title="Delete"
                                                                            >
                                                                                <svg
                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                    className="h-4 w-4"
                                                                                    fill="none"
                                                                                    viewBox="0 0 24 24"
                                                                                    stroke="currentColor"
                                                                                >
                                                                                    <path
                                                                                        strokeLinecap="round"
                                                                                        strokeLinejoin="round"
                                                                                        strokeWidth={2}
                                                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                                                    />
                                                                                </svg>
                                                                            </button>
                                                                            <button
                                                                                onClick={() => generateQuiz(skill.name)}
                                                                                className="btn btn-square btn-xs btn-ghost"
                                                                                title="Générer un quiz"
                                                                            >
                                                                                <svg
                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                    className="h-4 w-4"
                                                                                    fill="none"
                                                                                    viewBox="0 0 24 24"
                                                                                    stroke="currentColor"
                                                                                >
                                                                                    <path
                                                                                        strokeLinecap="round"
                                                                                        strokeLinejoin="round"
                                                                                        strokeWidth={2}
                                                                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                                                    />
                                                                                </svg>
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    )}
                                    {currentQuiz && (
                                        <div className="mt-8 p-6 bg-base-100 rounded-lg border border-base-300">
                                            <h2 className="text-2xl font-bold mb-4">Quiz pour {currentQuiz.skill}</h2>
                                            {currentQuiz.questions.map((question, index) => (
                                                <div key={index} className="mb-4">
                                                    <p className="font-medium">{index + 1}. {question.question}</p>
                                                    {Object.entries(question.options).map(([key, value]) => (
                                                        <div key={key} className="ml-4">
                                                            <label className="flex items-center space-x-2">
                                                                <input
                                                                    type="radio"
                                                                    name={`question-${index}`}
                                                                    value={key}
                                                                    onChange={() => handleAnswerChange(index, key)}
                                                                    className="radio radio-primary"
                                                                />
                                                                <span className="text-sm text-base-content/80">
                                                                    {key.toUpperCase()}. {value}
                                                                </span>
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}
                                            <button
                                                onClick={submitQuiz}
                                                className="btn btn-primary mt-4"
                                                disabled={Object.keys(userAnswers).length !== currentQuiz.questions.length}
                                            >
                                                Soumettre le quiz
                                            </button>
                                            <button
                                                onClick={() => setCurrentQuiz(null)}
                                                className="btn btn-ghost ml-2 mt-4"
                                            >
                                                Fermer le quiz
                                            </button>
                                        </div>
                                    )}
                                </div>

                            )}
                            {activeTab === 'profile' && (
                                <div>
                                    {isEditing ? (
                                        <form onSubmit={handleSubmit} className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="form-control">
                                                    <label className="label">
                                                        <span className="label-text font-medium">Full Name</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formData.name}
                                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                        className="input input-bordered"
                                                        required
                                                    />
                                                </div>
                                                <div className="form-control">
                                                    <label className="label">
                                                        <span className="label-text font-medium">Email Address</span>
                                                    </label>
                                                    <input
                                                        type="email"
                                                        value={formData.email}
                                                        className="input input-bordered input-disabled"
                                                        disabled
                                                        readOnly
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="form-control">
                                                    <label className="label">
                                                        <span className="label-text font-medium">Phone Number</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formData.phone_number}
                                                        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                                        className="input input-bordered"
                                                        placeholder="e.g. +216 12 345 6789"
                                                    />
                                                </div>
                                                <div className="form-control">
                                                    <label className="label">
                                                        <span className="label-text font-medium">Role</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formData.role}
                                                        className="input input-bordered input-disabled"
                                                        disabled
                                                    />
                                                </div>
                                            </div>
                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="label-text font-medium">Bio</span>
                                                </label>
                                                <textarea
                                                    value={formData.bio}
                                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                                    className="textarea textarea-bordered h-24"
                                                    placeholder="Tell us about yourself"
                                                />
                                            </div>
                                            <div className="flex gap-4">
                                                <button
                                                    type="submit"
                                                    className="btn btn-primary flex-1"
                                                    disabled={isSaving}
                                                >
                                                    {isSaving ? (
                                                        <>
                                                            <span className="loading loading-spinner loading-xs"></span>
                                                            Saving...
                                                        </>
                                                    ) : 'Save Changes'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsEditing(false)}
                                                    className="btn btn-outline flex-1"
                                                    disabled={isSaving}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <h3 className="text-sm font-semibold text-base-content/60 uppercase">Contact Information</h3>
                                                    <div className="mt-3 space-y-4">
                                                        <div className="flex items-center">
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                className="h-5 w-5 text-primary mr-3"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth="2"
                                                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                                                />
                                                            </svg>
                                                            <span>{user?.email || 'user@example.com'}</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                className="h-5 w-5 text-primary mr-3"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth="2"
                                                                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                                                />
                                                            </svg>
                                                            <span>{formatPhoneDisplay(user?.phone_number)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-semibold text-base-content/60 uppercase">Account Details</h3>
                                                    <div className="mt-3 space-y-4">
                                                        <div className="flex items-center">
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                className="h-5 w-5 text-primary mr-3"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth="2"
                                                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                                />
                                                            </svg>
                                                            <span>{user?.name || 'User'}</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                className="h-5 w-5 text-primary mr-3"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth="2"
                                                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                                                />
                                                            </svg>
                                                            <span className="capitalize">{user?.role || 'user'}</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                className="h-5 w-5 text-primary mr-3"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth="2"
                                                                    d="M12 15v2m-6 4h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                                                />
                                                            </svg>
                                                            <span>2FA: {user?.two_factor_enabled ? 'Enabled' : 'Disabled'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-8">
                                                {currentPosition ? (
                                                    <div className="mt-4 text-base-content opacity-90">
                                                        <h4 className="text-sm font-semibold text-base-content/60 uppercase mb-1">Current Position</h4>
                                                        <p>{currentPosition.job_title} at {currentPosition.company}</p>
                                                    </div>
                                                ) : (
                                                    <div className="mt-4 text-base-content opacity-900">
                                                        <h4 className="text-sm font-semibold text-base-content/60 uppercase mb-1">Current Position</h4>
                                                        <p>No current position</p>
                                                    </div>
                                                )}
                                                {user?.bio ? (
                                                    <div className="mt-4 text-base-content opacity-90">
                                                        <h4 className="text-sm font-semibold text-base-content/60 uppercase mb-1">Biography</h4>
                                                        <p>{user.bio}</p>
                                                    </div>
                                                ) : (
                                                    <div className="mt-4 text-base-content opacity-90">
                                                        <h4 className="text-sm font-semibold text-base-content/60 uppercase mb-1">Biography</h4>
                                                        <p>no bio</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            {activeTab === 'Certifications' && (
                                <div className="mt-4 p-6 bg-base-100 text-base-content rounded-lg border border-base-300 shadow-lg">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-bold text-primary">My Certifications</h2>
                                        <div className="flex items-center gap-4">
                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="label-text">Sort by</span>
                                                </label>
                                                <select
                                                    onChange={(e) => setSortOption(e.target.value)}
                                                    className="select select-bordered select-sm"
                                                    defaultValue="date-desc"
                                                >
                                                    <option value="date-desc">Date (Newest first)</option>
                                                    <option value="date-asc">Date (Oldest first)</option>
                                                    <option value="name-asc">Name (A-Z)</option>
                                                    <option value="name-desc">Name (Z-A)</option>
                                                </select>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    setShowCertificationForm(true);
                                                    setEditingCertificationId(null);
                                                    setNewCertification({
                                                        certifications_name: '',
                                                        issued_by: '',
                                                        obtained_date: '',
                                                        description: '',
                                                        image: null,
                                                    });
                                                    setCertificationImagePreview(null);
                                                    if (certificationFileInputRef.current) certificationFileInputRef.current.value = '';
                                                }}
                                                className="btn btn-primary gap-2 hover:bg-primary-focus transition-colors mb-4"
                                                disabled={showCertificationForm}
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-5 w-5 text-white"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                                Add Certification
                                            </button>
                                        </div>
                                    </div>

                                    {showCertificationForm && (
                                        <div className="bg-base-200 p-6 rounded-lg mb-8 shadow-sm">
                                            <h3 className="text-lg font-semibold mb-4">
                                                {editingCertificationId ? 'Edit Certification' : 'New Certification'}
                                            </h3>
                                            <form
                                                onSubmit={editingCertificationId ? handleUpdateCertification : handleAddCertification}
                                                className="space-y-4"
                                            >
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="form-control">
                                                        <label className="label">
                                                            <span className="label-text">Name *</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={editingCertificationId ? editCertificationData.certifications_name : newCertification.certifications_name}
                                                            onChange={(e) =>
                                                                editingCertificationId
                                                                    ? setEditCertificationData(prev => ({ ...prev, certifications_name: e.target.value }))
                                                                    : setNewCertification(prev => ({ ...prev, certifications_name: e.target.value }))
                                                            }
                                                            className="input input-bordered"
                                                            placeholder="Ex: AWS Certified Developer"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="form-control">
                                                        <label className="label">
                                                            <span className="label-text">Issued by *</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={editingCertificationId ? editCertificationData.issued_by : newCertification.issued_by}
                                                            onChange={(e) =>
                                                                editingCertificationId
                                                                    ? setEditCertificationData(prev => ({ ...prev, issued_by: e.target.value }))
                                                                    : setNewCertification(prev => ({ ...prev, issued_by: e.target.value }))
                                                            }
                                                            className="input input-bordered"
                                                            placeholder="Ex: Amazon Web Services"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="form-control">
                                                        <label className="label">
                                                            <span className="label-text">Date obtained *</span>
                                                        </label>
                                                        <input
                                                            type="date"
                                                            value={editingCertificationId ? editCertificationData.obtained_date : newCertification.obtained_date}
                                                            onChange={(e) =>
                                                                editingCertificationId
                                                                    ? setEditCertificationData(prev => ({ ...prev, obtained_date: e.target.value }))
                                                                    : setNewCertification(prev => ({ ...prev, obtained_date: e.target.value }))
                                                            }
                                                            className="input input-bordered"
                                                            max={new Date().toISOString().split('T')[0]}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="form-control">
                                                    <label className="label">
                                                        <span className="label-text">Description</span>
                                                    </label>
                                                    <textarea
                                                        value={editingCertificationId ? editCertificationData.description : newCertification.description}
                                                        onChange={(e) =>
                                                            editingCertificationId
                                                                ? setEditCertificationData(prev => ({ ...prev, description: e.target.value }))
                                                                : setNewCertification(prev => ({ ...prev, description: e.target.value }))
                                                        }
                                                        className="textarea textarea-bordered h-24"
                                                        placeholder="Describe this certification..."
                                                    />
                                                </div>
                                                <div className="form-control">
                                                    <label className="label">
                                                        <span className="label-text">Image</span>
                                                    </label>
                                                    <input
                                                        type="file"
                                                        ref={certificationFileInputRef}
                                                        onChange={(e) => handleCertificationImageSelect(e, !!editingCertificationId)}
                                                        className="file-input file-input-bordered"
                                                        accept="image/jpeg,image/png,image/gif"
                                                    />
                                                </div>
                                                {certificationImagePreview && (
                                                    <div className="mt-4">
                                                        <label className="label">
                                                            <span className="label-text">Preview</span>
                                                        </label>
                                                        <div className="w-40 h-40 border-2 border-base-300 rounded-lg overflow-hidden bg-base-200 flex items-center justify-center">
                                                            <img src={certificationImagePreview} alt="Preview" className="w-full h-full object-contain" />
                                                        </div>
                                                        <div className="mt-2 flex justify-center">
                                                            <button
                                                                type="button"
                                                                onClick={handleCancelCertificationImage}
                                                                className="btn btn-sm btn-error btn-outline"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex justify-end gap-3 mt-6">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setShowCertificationForm(false);
                                                            setEditingCertificationId(null);
                                                            setNewCertification({ certifications_name: '', issued_by: '', obtained_date: '', description: '', image: null });
                                                            setEditCertificationData({ certifications_name: '', issued_by: '', obtained_date: '', description: '', image: null });
                                                            setCertificationImagePreview(null);
                                                            if (certificationFileInputRef.current) certificationFileInputRef.current.value = '';
                                                        }}
                                                        className="btn btn-ghost hover:bg-base-300 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button type="submit" className="btn btn-primary hover:bg-primary-focus transition-colors">
                                                        {editingCertificationId ? 'Save' : 'Add Certification'}
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    )}

                                    {certifications.length > 0 && !showCertificationForm && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {certifications
                                                .sort((a, b) => {
                                                    switch (sortOption) {
                                                        case 'date-desc':
                                                            return new Date(b.obtained_date) - new Date(a.obtained_date);
                                                        case 'date-asc':
                                                            return new Date(a.obtained_date) - new Date(b.obtained_date);
                                                        case 'name-asc':
                                                            return a.certifications_name.localeCompare(b.certifications_name);
                                                        case 'name-desc':
                                                            return b.certifications_name.localeCompare(a.certifications_name);
                                                        default:
                                                            return 0;
                                                    }
                                                })
                                                .map((certification) => (
                                                    <div
                                                        key={certification._id}
                                                        className="bg-base-100 border border-base-300 hover:border-primary transition-colors p-4 rounded-lg shadow-sm"
                                                    >
                                                        <div className="flex justify-between items-start gap-4">
                                                            <div className="flex-1">
                                                                <h3 className="text-lg font-semibold">
                                                                    {certification.certifications_name || 'No name'}
                                                                </h3>
                                                                {certification.description && (
                                                                    <p className="mt-2 text-base-content/80 line-clamp-2">
                                                                        {certification.description}
                                                                    </p>
                                                                )}
                                                                <p className="text-sm text-base-content/70 mt-1">
                                                                    Issued by: {certification.issued_by || 'Unknown'}
                                                                </p>
                                                                <p>Obtained on: {new Date(certification.obtained_date).toLocaleDateString('en-US')}</p>
                                                            </div>
                                                            {certification.image ? (
                                                                <div className="w-20 h-20 border border-base-300 rounded-lg overflow-hidden bg-base-200">
                                                                    <img
                                                                        src={certification.image}
                                                                        alt={certification.certifications_name}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <div className="w-20 h-20 border border-base-300 rounded-lg overflow-hidden bg-base-200 flex items-center justify-center">
                                                                    <span className="text-base-content/50">No image</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex justify-end mt-4 gap-2">
                                                            {!certification.image && (
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingCertificationId(certification._id);
                                                                        setEditCertificationData({
                                                                            ...certification,
                                                                            obtained_date: certification.obtained_date.split('T')[0],
                                                                        });
                                                                        setCertificationImagePreview(certification.image || null);
                                                                        setShowCertificationForm(true);
                                                                    }}
                                                                    className="btn btn-sm bg-base-200 hover:bg-base-300 text-base-content transition-colors"
                                                                >
                                                                    Add a photo
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleEditCertification(certification)}
                                                                className="btn btn-square btn-xs btn-ghost hover:bg-base-300 transition-colors"
                                                                title="Edit"
                                                            >
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    className="h-4 w-4"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    stroke="currentColor"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={2}
                                                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                                    />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteCertification(certification._id)}
                                                                className="btn btn-square btn-xs btn-ghost text-error hover:bg-error/20 transition-colors"
                                                                title="Delete"
                                                            >
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    className="h-4 w-4"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    stroke="currentColor"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={2}
                                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                                    />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </div>
                            )}
                            {activeTab === 'Experience' && (
                                <div className="mt-4 p-6 bg-base-100 rounded-lg border border-base-300">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-2xl font-bold text-primary">My experiences</h2>
                                        <button
                                            onClick={() => {
                                                setShowExperienceForm(true);
                                                setEditingExperienceId(null);
                                                setNewExperience({
                                                    job_title: '',
                                                    company: '',
                                                    employment_type: 'Temps plein',
                                                    is_current: false,
                                                    start_date: '',
                                                    end_date: '',
                                                    location: '',
                                                    location_type: 'Sur place',
                                                    description: '',
                                                    profile_title: '',
                                                    job_source: '',
                                                });
                                            }}
                                            className="btn btn-primary gap-2"
                                            disabled={showExperienceForm}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            Add experience
                                        </button>



                                    </div>

                                    {/* Interface de filtrage et de tri (déplacée en dessous du titre) */}
                                    <div className="flex items-center gap-4 mb-6">
                                        {/* Filtre par type de localisation */}
                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text">Filter by location type
                                                </span>
                                            </label>
                                            <select
                                                id="location-filter"
                                                value={locationFilter}
                                                onChange={(e) => setLocationFilter(e.target.value)}
                                                className="select select-bordered select-sm"
                                            >
                                                <option value="Tous">Tous</option>
                                                <option value="Sur place">Sur place</option>
                                                <option value="Hybride">Hybride</option>
                                                <option value="À distance">À distance</option>
                                            </select>
                                        </div>

                                        {/* Sélecteur de tri */}
                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text">Order by</span>
                                            </label>
                                            <select
                                                onChange={(e) => setExperienceSortOption(e.target.value)}
                                                className="select select-bordered select-sm"
                                                value={experienceSortOption}
                                            >
                                                <option value="date-desc">Date (Newest first)</option>
                                                <option value="date-asc">Date (Oldest first)</option>
                                            </select>
                                        </div>
                                    </div>

                                    {showExperienceForm && (
                                        <div className="card bg-base-200 shadow-lg mb-8">
                                            <div className="card-body">
                                                <h3 className="card-title text-lg mb-4">
                                                    {editingExperienceId ? 'Modifier une expérience' : 'New Experience'}
                                                </h3>
                                                <form
                                                    onSubmit={editingExperienceId ? handleUpdateExperience : handleAddExperience}
                                                    className="space-y-4"
                                                >
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="form-control">
                                                            <label className="label">
                                                                <span className="label-text">Job Title*</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={editingExperienceId ? editExperienceData.job_title : newExperience.job_title}
                                                                onChange={(e) =>
                                                                    editingExperienceId
                                                                        ? setEditExperienceData({ ...editExperienceData, job_title: e.target.value })
                                                                        : setNewExperience({ ...newExperience, job_title: e.target.value })
                                                                }
                                                                className="input input-bordered"
                                                                placeholder="Ex: Software Developer"
                                                                required
                                                            />
                                                        </div>
                                                        <div className="form-control">
                                                            <label className="label">
                                                                <span className="label-text">Employment Type</span>
                                                            </label>
                                                            <select
                                                                value={editingExperienceId ? editExperienceData.employment_type : newExperience.employment_type}
                                                                onChange={(e) =>
                                                                    editingExperienceId
                                                                        ? setEditExperienceData({ ...editExperienceData, employment_type: e.target.value })
                                                                        : setNewExperience({ ...newExperience, employment_type: e.target.value })
                                                                }
                                                                className="select select-bordered"
                                                            >
                                                                <option value="Temps plein">Temps plein</option>
                                                                <option value="Temps partiel">Temps partiel</option>
                                                                <option value="Freelance">Freelance</option>
                                                                <option value="Stage">Stage</option>
                                                                <option value="Contrat">Contrat</option>
                                                                <option value="Bénévolat">Bénévolat</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="form-control">
                                                            <label className="label">
                                                                <span className="label-text">Company or Organization*</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={editingExperienceId ? editExperienceData.company : newExperience.company}
                                                                onChange={(e) =>
                                                                    editingExperienceId
                                                                        ? setEditExperienceData({ ...editExperienceData, company: e.target.value })
                                                                        : setNewExperience({ ...newExperience, company: e.target.value })
                                                                }
                                                                className="input input-bordered"
                                                                placeholder="Ex: Tech Corp"
                                                                required
                                                            />
                                                        </div>
                                                        <div className="form-control">
                                                            <label className="label">
                                                                <span className="label-text">Company Location</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={editingExperienceId ? editExperienceData.location : newExperience.location}
                                                                onChange={(e) =>
                                                                    editingExperienceId
                                                                        ? setEditExperienceData({ ...editExperienceData, location: e.target.value })
                                                                        : setNewExperience({ ...newExperience, location: e.target.value })
                                                                }
                                                                className="input input-bordered"
                                                                placeholder="Ex: Paris, France"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="form-control">
                                                            <label className="label">
                                                                <span className="label-text">Type of Location</span>
                                                            </label>
                                                            <select
                                                                value={editingExperienceId ? editExperienceData.location_type : newExperience.location_type}
                                                                onChange={(e) =>
                                                                    editingExperienceId
                                                                        ? setEditExperienceData({ ...editExperienceData, location_type: e.target.value })
                                                                        : setNewExperience({ ...newExperience, location_type: e.target.value })
                                                                }
                                                                className="select select-bordered"
                                                            >
                                                                <option value="Sur place">Sur place</option>
                                                                <option value="À distance">À distance</option>
                                                                <option value="Hybride">Hybride</option>
                                                            </select>
                                                        </div>
                                                        <div className="form-control">
                                                            <label className="label cursor-pointer">
                                                                <span className="label-text">I currently work in this position</span>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={editingExperienceId ? editExperienceData.is_current : newExperience.is_current}
                                                                    onChange={(e) =>
                                                                        editingExperienceId
                                                                            ? setEditExperienceData({ ...editExperienceData, is_current: e.target.checked })
                                                                            : setNewExperience({ ...newExperience, is_current: e.target.checked })
                                                                    }
                                                                    className="checkbox checkbox-primary"
                                                                />
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="form-control">
                                                            <label className="label">
                                                                <span className="label-text">Start Date*</span>
                                                            </label>
                                                            <input
                                                                type="date"
                                                                value={editingExperienceId ? editExperienceData.start_date : newExperience.start_date}
                                                                onChange={(e) =>
                                                                    editingExperienceId
                                                                        ? setEditExperienceData({ ...editExperienceData, start_date: e.target.value })
                                                                        : setNewExperience({ ...newExperience, start_date: e.target.value })
                                                                }
                                                                className="input input-bordered"
                                                                max={new Date().toISOString().split('T')[0]}
                                                                required
                                                            />
                                                        </div>
                                                        <div className="form-control">
                                                            <label className="label">
                                                                <span className="label-text">End Date</span>
                                                            </label>
                                                            <input
                                                                type="date"
                                                                value={editingExperienceId ? editExperienceData.end_date : newExperience.end_date}
                                                                onChange={(e) =>
                                                                    editingExperienceId
                                                                        ? setEditExperienceData({ ...editExperienceData, end_date: e.target.value })
                                                                        : setNewExperience({ ...newExperience, end_date: e.target.value })
                                                                }
                                                                className="input input-bordered"
                                                                max={new Date().toISOString().split('T')[0]}
                                                                disabled={editingExperienceId ? editExperienceData.is_current : newExperience.is_current}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="form-control">
                                                        <label className="label">
                                                            <span className="label-text">Description*</span>
                                                        </label>
                                                        <textarea
                                                            value={editingExperienceId ? editExperienceData.description : newExperience.description}
                                                            onChange={(e) =>
                                                                editingExperienceId
                                                                    ? setEditExperienceData({ ...editExperienceData, description: e.target.value })
                                                                    : setNewExperience({ ...newExperience, description: e.target.value })
                                                            }
                                                            className="textarea textarea-bordered h-24"
                                                            placeholder="Describe your responsibilities..."
                                                            required
                                                        />
                                                    </div>
                                                    <div className="form-control">
                                                        <label className="label">
                                                            <span className="label-text">Profile Title</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={editingExperienceId ? editExperienceData.profile_title : newExperience.profile_title}
                                                            onChange={(e) =>
                                                                editingExperienceId
                                                                    ? setEditExperienceData({ ...editExperienceData, profile_title: e.target.value })
                                                                    : setNewExperience({ ...newExperience, profile_title: e.target.value })
                                                            }
                                                            className="input input-bordered"
                                                            placeholder="Appears below your name at the top of the profile"
                                                        />
                                                    </div>
                                                    <div className="form-control">
                                                        <label className="label">
                                                            <span className="label-text">Where did you find this job offer?</span>
                                                        </label>
                                                        <select
                                                            value={editingExperienceId ? editExperienceData.job_source : newExperience.job_source}
                                                            onChange={(e) =>
                                                                editingExperienceId
                                                                    ? setEditExperienceData({ ...editExperienceData, job_source: e.target.value })
                                                                    : setNewExperience({ ...newExperience, job_source: e.target.value })
                                                            }
                                                            className="select select-bordered"
                                                        >
                                                            <option value="">Please Select</option>
                                                            <option value="LinkedIn">LinkedIn</option>
                                                            <option value="Indeed">Indeed</option>
                                                            <option value="Glassdoor">Glassdoor</option>
                                                            <option value="Directement sur le site de l'entreprise">Directly on the company's website</option>
                                                            <option value="Recommandation">Recommandation</option>
                                                            <option value="Autre">Other</option>
                                                        </select>
                                                        <label className="label">
                                                            <span className="label-text-alt text-gray-500">
                                                                This information will be used to encourage gaining more experience.
                                                            </span>
                                                        </label>
                                                    </div>
                                                    <div className="flex justify-end gap-3 mt-6">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setShowExperienceForm(false);
                                                                setEditingExperienceId(null);
                                                                setEditExperienceData({
                                                                    job_title: '',
                                                                    company: '',
                                                                    employment_type: 'Temps plein',
                                                                    is_current: false,
                                                                    start_date: '',
                                                                    end_date: '',
                                                                    location: '',
                                                                    location_type: 'Sur place',
                                                                    description: '',
                                                                    profile_title: '',
                                                                    job_source: '',
                                                                });
                                                            }}
                                                            className="btn btn-ghost"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button type="submit" className="btn btn-primary" disabled={isSaving}>
                                                            {isSaving ? (
                                                                <>
                                                                    <span className="loading loading-spinner loading-xs"></span>
                                                                    {editingExperienceId ? 'Modification...' : 'Ajout...'}
                                                                </>
                                                            ) : editingExperienceId ? 'Saves Changes' : 'Add Experience'}
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    )}

                                    {experiences.length === 0 && !showExperienceForm ? (
                                        <div className="text-center py-12">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-12 w-12 mx-auto text-gray-400"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={1.5}
                                                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                                />
                                            </svg>
                                            <h3 className="mt-4 text-lg font-medium text-gray-500">Aucune expérience ajoutée</h3>
                                            <p className="mt-1 text-gray-400">Ajoutez vos expériences professionnelles pour les afficher ici</p>
                                            <button onClick={() => setShowExperienceForm(true)} className="btn btn-primary mt-6">
                                                Add Experience
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {experiences
                                                .filter((experience) => {
                                                    if (locationFilter === 'Tous') return true;
                                                    return experience.location_type === locationFilter;
                                                })
                                                .sort((a, b) => {
                                                    const dateA = a.is_current ? new Date() : new Date(a.end_date);
                                                    const dateB = b.is_current ? new Date() : new Date(b.end_date);
                                                    return experienceSortOption === 'date-desc' ? dateB - dateA : dateA - dateB;
                                                })
                                                .map((experience) => {
                                                    const startDate = new Date(experience.start_date);
                                                    const endDate = experience.is_current ? new Date() : new Date(experience.end_date);
                                                    const durationMonths = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24 * 30));
                                                    const durationYears = Math.floor(durationMonths / 12);
                                                    const remainingMonths = durationMonths % 12;
                                                    const durationText =
                                                        durationYears > 0
                                                            ? `${durationYears} an${durationYears > 1 ? 's' : ''}${remainingMonths > 0 ? ` ${remainingMonths} mois` : ''}`
                                                            : `${durationMonths} mois`;
                                                    const maxDuration = 120; // 10 years
                                                    const durationPercentage = Math.min((durationMonths / maxDuration) * 100, 100);

                                                    return (
                                                        <div
                                                            key={experience._id}
                                                            className={`card ${experience.is_current
                                                                ? 'bg-[#e4bdf3] text-gray-900'
                                                                : 'bg-base-100 text-base-content'
                                                                } border border-base-300 hover:border-primary transition-colors shadow-md`}
                                                        >
                                                            <div className="card-body p-6 flex flex-row gap-4">
                                                                {/* Left Side: Experience Details and More Details Button */}
                                                                <div className="flex-1">
                                                                    <div className="flex justify-between items-start mb-2">
                                                                        <div>
                                                                            <h3 className="card-title text-xl font-semibold">{experience.job_title}</h3>
                                                                            <p className={`${experience.is_current ? 'text-gray-800' : 'text-base-content/80'} text-lg`}>
                                                                                {experience.company}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <span className={`text-sm ${experience.is_current ? 'text-gray-700' : 'text-base-content/70'}`}>
                                                                            {experience.employment_type} • {experience.location_type}
                                                                        </span>
                                                                    </div>
                                                                    <p className={`text-sm ${experience.is_current ? 'text-gray-700' : 'text-base-content/70'} mb-2`}>
                                                                        {startDate.toLocaleDateString('fr-FR')} -{' '}
                                                                        {experience.is_current ? 'Présent' : endDate.toLocaleDateString('fr-FR')}
                                                                    </p>
                                                                    {experience.location && (
                                                                        <p className={`text-sm ${experience.is_current ? 'text-gray-700' : 'text-base-content/70'} mb-2`}>
                                                                            {experience.location}
                                                                        </p>
                                                                    )}
                                                                    <button
                                                                        onClick={() => setSelectedExperience(experience)}
                                                                        className={`btn btn-outline btn-sm mt-2 ${experience.is_current
                                                                            ? 'text-gray-900 border-gray-900 hover:bg-gray-200 hover:border-gray-900'
                                                                            : 'text-base-content border-base-content hover:bg-base-200 hover:border-base-content'
                                                                            }`}
                                                                    >
                                                                        More details
                                                                    </button>
                                                                </div>

                                                                {/* Right Side: Percentage Circle and Edit/Delete Buttons */}
                                                                <div className="flex flex-col items-center justify-between">
                                                                    <div className="relative w-16 h-16 mb-4">
                                                                        <svg className="w-full h-full" viewBox="0 0 36 36">
                                                                            <path
                                                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                                                fill="none"
                                                                                stroke="#e5e7eb"
                                                                                strokeWidth="3.8"
                                                                            />
                                                                            <path
                                                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                                                fill="none"
                                                                                stroke="url(#gradient)"
                                                                                strokeWidth="3.8"
                                                                                strokeDasharray={`${durationPercentage}, 100`}
                                                                                strokeLinecap="round"
                                                                            />
                                                                            <defs>
                                                                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                                                    <stop offset="0%" style={{ stopColor: '#F5A7B7', stopOpacity: 1 }} />
                                                                                    <stop offset="100%" style={{ stopColor: '#C084FC', stopOpacity: 1 }} />
                                                                                </linearGradient>
                                                                            </defs>
                                                                        </svg>
                                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                                            <span className={`text-sm font-medium ${experience.is_current ? 'text-gray-900' : 'text-base-content'}`}>
                                                                                {Math.round(durationPercentage)}%
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <span className={`text-sm mb-2 ${experience.is_current ? 'text-gray-700' : 'text-base-content/70'}`}>
                                                                        {durationText}
                                                                    </span>
                                                                    <div className="flex gap-2">
                                                                        <button
                                                                            onClick={() => handleEditExperience(experience)}
                                                                            className="btn btn-square btn-sm btn-ghost"
                                                                            title="Modifier"
                                                                        >
                                                                            <svg
                                                                                xmlns="http://www.w3.org/2000/svg"
                                                                                className="h-5 w-5"
                                                                                fill="none"
                                                                                viewBox="0 0 24 24"
                                                                                stroke="currentColor"
                                                                            >
                                                                                <path
                                                                                    strokeLinecap="round"
                                                                                    strokeLinejoin="round"
                                                                                    strokeWidth={2}
                                                                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                                                />
                                                                            </svg>
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeleteExperience(experience._id)}
                                                                            className="btn btn-square btn-sm btn-ghost text-error"
                                                                            title="Supprimer"
                                                                        >
                                                                            <svg
                                                                                xmlns="http://www.w3.org/2000/svg"
                                                                                className="h-5 w-5"
                                                                                fill="none"
                                                                                viewBox="0 0 24 24"
                                                                                stroke="currentColor"
                                                                            >
                                                                                <path
                                                                                    strokeLinecap="round"
                                                                                    strokeLinejoin="round"
                                                                                    strokeWidth={2}
                                                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                                                />
                                                                            </svg>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    )}

                                    {/* Modal pour afficher les détails */}
                                    {selectedExperience && (
                                        <div className="modal modal-open">
                                            <div className="modal-box max-w-2xl">
                                                <h3 className="font-bold text-xl mb-4">{selectedExperience.job_title}</h3>
                                                <p className="text-lg text-base-content/80 mb-2">{selectedExperience.company}</p>
                                                {selectedExperience.profile_title && (
                                                    <p className="text-sm text-base-content/60 mb-2">{selectedExperience.profile_title}</p>
                                                )}
                                                <p className="text-sm text-base-content/70 mb-2">
                                                    {selectedExperience.employment_type} • {selectedExperience.location_type}
                                                </p>
                                                <p className="text-sm text-base-content/70 mb-2">
                                                    {new Date(selectedExperience.start_date).toLocaleDateString('fr-FR')} -{' '}
                                                    {selectedExperience.is_current
                                                        ? 'Présent'
                                                        : new Date(selectedExperience.end_date).toLocaleDateString('fr-FR')}
                                                </p>
                                                {selectedExperience.location && (
                                                    <p className="text-sm text-base-content/70 mb-2">{selectedExperience.location}</p>
                                                )}
                                                {selectedExperience.description && (
                                                    <div className="mt-4">
                                                        <h4 className="font-semibold text-base mb-2">Descriptif</h4>
                                                        <p className="text-base-content/80">{selectedExperience.description}</p>
                                                    </div>
                                                )}
                                                {selectedExperience.job_source && (
                                                    <p className="text-sm text-base-content/60 mt-4">
                                                        Source : {selectedExperience.job_source}
                                                    </p>
                                                )}
                                                <div className="modal-action">
                                                    <button onClick={() => setSelectedExperience(null)} className="btn btn-ghost">
                                                        Fermer
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-xl font-bold mb-4">Change Password</h3>
                                        <form onSubmit={handlePasswordChange} className="space-y-4">
                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="label-text">Current Password</span>
                                                </label>
                                                <input
                                                    type="password"
                                                    value={formData.password}
                                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                    className="input input-bordered"
                                                    required
                                                />
                                            </div>
                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="label-text">New Password</span>
                                                </label>
                                                <input
                                                    type="password"
                                                    value={formData.newPassword}
                                                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                                    className="input input-bordered"
                                                    required
                                                    minLength={8}
                                                />
                                            </div>
                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="label-text">Confirm New Password</span>
                                                </label>
                                                <input
                                                    type="password"
                                                    value={formData.confirmPassword}
                                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                    className="input input-bordered"
                                                    required
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                                disabled={isSaving || !formData.password || !formData.newPassword || formData.newPassword !== formData.confirmPassword}
                                            >
                                                {isSaving ? (
                                                    <>
                                                        <span className="loading loading-spinner loading-xs"></span>
                                                        Changing Password...
                                                    </>
                                                ) : 'Change Password'}
                                            </button>
                                        </form>
                                    </div>
                                    <div className="divider"></div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-4">Two-Factor Authentication</h3>
                                        <div className="flex items-center justify-between bg-base-200 p-4 rounded-lg">
                                            <div>
                                                <p className="font-medium">Two-Factor Authentication</p>
                                                <p className="text-sm opacity-70">Add an extra layer of security to your account</p>
                                            </div>
                                            <div className="form-control">
                                                <label className="cursor-pointer label">
                                                    <input
                                                        type="checkbox"
                                                        className="toggle toggle-primary"
                                                        checked={formData.two_factor_enabled}
                                                        readOnly
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                        <button className="btn btn-outline btn-sm mt-4">
                                            {formData.two_factor_enabled ? 'Disable' : 'Enable'} Two-Factor Authentication
                                        </button>
                                    </div>
                                    <div className="divider"></div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-4">Sessions</h3>
                                        <div className="bg-base-200 p-4 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">Current Session</p>
                                                    <p className="text-sm opacity-70">This device</p>
                                                </div>
                                                <div className="badge badge-success">Active</div>
                                            </div>
                                        </div>
                                        <button className="btn btn-outline btn-error btn-sm mt-4">
                                            Logout from All Devices
                                        </button>
                                    </div>
                                </div>
                            )}
                            {activeTab === 'preferences' && (
                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-xl font-bold mb-4">Theme Settings</h3>
                                        <div className="flex gap-4">
                                            <button
                                                className={`btn ${theme === 'light' ? 'btn-primary' : 'btn-outline'}`}
                                                onClick={() => handleThemeChange('light')}
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-5 w-5 mr-2"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                                                    />
                                                </svg>
                                                Light
                                            </button>
                                            <button
                                                className={`btn ${theme === 'dark' ? 'btn-primary' : 'btn-outline'}`}
                                                onClick={() => handleThemeChange('dark')}
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-5 w-5 mr-2"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                                                    />
                                                </svg>
                                                Dark
                                            </button>
                                            <button
                                                className={`btn ${theme === 'system' ? 'btn-primary' : 'btn-outline'}`}
                                                onClick={() => handleThemeChange('system')}
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-5 w-5 mr-2"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                                    />
                                                </svg>
                                                System
                                            </button>
                                        </div>
                                    </div>
                                    <div className="divider"></div>
                                    <div className="divider my-8">Integrations</div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <GitHubLinkButton user={user} />

                                        {/* You can add more integrations here in the future */}
                                        <div className="card bg-base-100 shadow-lg overflow-hidden">
                                            <div className="card-body">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="rounded-lg bg-blue-100 p-3">
                                                        <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M22.08 12.539c0-4.154-3.2-7.508-7.346-7.508a7.33 7.33 0 0 0-6.522 4.004 4.35 4.35 0 0 0-2.288-.643A4.431 4.431 0 0 0 1.5 12.826a4.431 4.431 0 0 0 4.424 4.433h13.732a2.419 2.419 0 0 0 2.424-2.42c0-.788-.393-1.63-1.043-2.087a7.379 7.379 0 0 0 1.043-2.213z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold">Cloud Storage</h3>
                                                        <p className="text-xs opacity-70">Connect cloud storage for file sharing</p>
                                                    </div>
                                                </div>
                                                <button className="btn btn-outline btn-block">Coming Soon</button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="divider"></div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-4">Language</h3>
                                        <select className="select select-bordered w-full max-w-xs">
                                            <option value="en">English (US)</option>
                                            <option value="fr">Français</option>
                                            <option value="ar">العربية</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile; 