import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/Api';
import { toast } from 'react-hot-toast';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

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
                fetchUserExperiences(), // Ajout ici
                fetchCertifications(),
            ]);
          } catch (error) {
            console.error('Error fetching user:', error.response?.data || error.message);
            setError(error.response?.data?.message || error.message);
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
                const sortedExperiences = Array.isArray(response.data)
                    ? response.data.sort((a, b) => new Date(b.start_date) - new Date(a.start_date)) // Tri décroissant par défaut
                    : [];
                setExperiences(sortedExperiences);
            } catch (error) {
                console.error('Error fetching user experiences:', error.response?.data || error.message);
                setExperiences([]);
                toast.error('Failed to load experiences: ' + (error.response?.data?.message || error.message));
            }
        };
      
        const fetchCertifications = async () => {
          try {
            const response = await api.get('/api/certifications');
            const validCertifications = Array.isArray(response.data)
              ? response.data.map(cert => ({
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
      
        fetchUser();
        fetchCertifications();
        fetchUserExperiences();
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
            if (response.data?.user) {
                setUser(response.data.user);
                setFormData(prev => ({ ...prev, profile_picture: response.data.user.profile_picture }));
                setImagePreview(response.data.user.profile_picture);
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
        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }
        setIsSaving(true);
        try {
            await api.put('/api/users/change-password', {
                currentPassword: formData.password,
                newPassword: formData.newPassword,
            });
            toast.success('Password changed successfully');
            setFormData((prev) => ({
                ...prev,
                password: '',
                newPassword: '',
                confirmPassword: '',
            }));
        } catch (error) {
            console.error('Password change error:', error.response?.data || error.message);
            toast.error(error.response?.data?.message || 'Failed to change password');
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

    // Gestion des compétences
    const handleAddSkill = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/api/skills/add', newSkill);
            setSkills([...skills, response.data]);
            setNewSkill({ name: '', description: '', category: 'Technical', tags: 50 });
            setShowSkillForm(false);
            toast.success('Compétence ajoutée avec succès');
        } catch (error) {
            console.error('Error adding skill:', error.response?.data || error.message);
            toast.error(`Échec de l'ajout: ${error.response?.data?.message || error.message}`);
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
            const response = await api.put(`/api/skills/update/${editingSkillId}`, editSkillData);
            setSkills(skills.map((skill) => (skill._id === editingSkillId ? response.data : skill)));
            setEditingSkillId(null);
            setEditSkillData({ name: '', description: '', category: 'Technical', tags: 50 });
            setShowSkillForm(false);
            toast.success('Compétence mise à jour avec succès');
        } catch (error) {
            console.error('Error updating skill:', error.response?.data || error.message);
            toast.error(`Échec de la mise à jour: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleDeleteSkill = async (skillId) => {
        try {
            await api.delete(`/api/skills/${skillId}`);
            setSkills(skills.filter((skill) => skill._id !== skillId));
            toast.success('Compétence supprimée avec succès');
        } catch (error) {
            console.error('Error deleting skill:', error.response?.data || error.message);
            toast.error(`Échec de la suppression: ${error.response?.data?.message || error.message}`);
        }
    };

    // Gestion des certifications
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
                setEditCertificationData(prev => ({ ...prev, image: imageData }));
            } else {
                setNewCertification(prev => ({ ...prev, image: imageData }));
            }
            setCertificationImagePreview(imageData);
        };
        reader.readAsDataURL(file);
    };

    const handleAddCertification = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append('certifications_name', newCertification.certifications_name);
            formData.append('issued_by', newCertification.issued_by);
            formData.append('obtained_date', newCertification.obtained_date);
            formData.append('description', newCertification.description);

            if (newCertification.image && newCertification.image.startsWith('data:')) {
                const blob = await fetch(newCertification.image).then(res => res.blob());
                formData.append('image', blob, 'certification.jpg');
            }

            const response = await api.post('/api/certifications/addCertification', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

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
            toast.error(error.response?.data?.message || 'Failed to add certification');
        } finally {
            setIsSaving(false);
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

    const handleUpdateCertification = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append('certifications_name', editCertificationData.certifications_name);
            formData.append('issued_by', editCertificationData.issued_by);
            formData.append('obtained_date', editCertificationData.obtained_date);
            formData.append('description', editCertificationData.description);

            if (editCertificationData.image && editCertificationData.image.startsWith('data:')) {
                const blob = await fetch(editCertificationData.image).then(res => res.blob());
                formData.append('image', blob, 'certification.jpg');
            } else if (editCertificationData.image) {
                formData.append('image', editCertificationData.image); // Conserver l'URL existante
            }

            const response = await api.put(`/api/certifications/updateCertification/${editingCertificationId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setCertifications(certifications.map(cert => (cert._id === editingCertificationId ? response.data : cert)));
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

    const handleDeleteCertification = async (certificationId) => {
        try {
            await api.delete(`/api/certifications/${certificationId}`);
            setCertifications(certifications.filter(cert => cert._id !== certificationId));
            toast.success('Certification deleted successfully');
        } catch (error) {
            console.error('Error deleting certification:', error.response?.data || error.message);
            toast.error(error.response?.data?.message || 'Failed to delete certification');
        }
    };

    const handleCancelCertificationImage = () => {
        if (editingCertificationId) {
            const existingCert = certifications.find(cert => cert._id === editingCertificationId);
            setEditCertificationData(prev => ({
                ...prev,
                image: existingCert?.image || null,
            }));
            setCertificationImagePreview(existingCert?.image || null);
        } else {
            setNewCertification(prev => ({
                ...prev,
                image: null,
            }));
            setCertificationImagePreview(null);
        }
        if (certificationFileInputRef.current) certificationFileInputRef.current.value = null;
    };

    // Gestion des expériences
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
      toast.success('Expérience ajoutée avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'expérience:', error.response?.data || error.message);
      toast.error(`Échec de l'ajout: ${error.response?.data?.message || error.message}`);
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
            toast.success('Expérience mise à jour avec succès');
        } catch (error) {
            console.error('Error updating experience:', error);
            toast.error(`Échec de la mise à jour: ${error.response?.data?.message || error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteExperience = async (experienceId) => {
        try {
            await api.delete(`/api/experiences/${experienceId}`);
            setExperiences(experiences.filter(exp => exp._id !== experienceId));
            toast.success('Expérience supprimée avec succès');
        } catch (error) {
            console.error('Error deleting experience:', error);
            toast.error(`Échec de la suppression: ${error.response?.data?.message || error.message}`);
        }
    };

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
                                <span className="text-sm block opacity-70">{user?.email || 'user@example.com'}</span>
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
                                        <h1 className="text-3xl font-bold">{user?.name || 'User'}</h1>
                                        <p className="text-base-content opacity-75">{user?.email || 'user@example.com'}</p>
                                        <div className="mt-1 flex items-center gap-2">
                                            <span className="badge badge-primary">{user?.role || 'user'}</span>
                                            {skills
                                                .filter((skill) => skill.tags >= 70)
                                                .map((skill) => {
                                                    const categoryColors = {
                                                        Technical: 'badge bg-blue-200 text-blue-800',
                                                        'Soft Skill': 'badge bg-green-200 text-green-800',
                                                        Management: 'badge bg-purple-200 text-purple-800',
                                                    };
                                                    return (
                                                        <span
                                                            key={skill._id}
                                                            className={categoryColors[skill.category] || 'badge badge-outline'}
                                                        >
                                                            {skill.name}
                                                        </span>
                                                    );
                                                })}
                                        </div>
                                    </div>
                                    {!isEditing && (
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
                                    )}
                                </div>
                                {user?.bio && (
                                    <div className="mt-4 text-base-content opacity-90">
                                        <p>{user.bio}</p>
                                    </div>
                                )}
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
                                                <h3 className="text-sm font-semibold text-base-content/60 uppercase">Biography</h3>
                                                <div className="mt-3 p-4 bg-base-200 rounded-lg">
                                                    <p>{user?.bio || 'No bio provided yet. Click Edit Profile to add one!'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
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
                                            {skills.map((skill) => {
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
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                            {activeTab === 'Certifications' && (
                                <div className="mt-4 p-6 bg-base-100 text-base-content rounded-lg border border-base-300 shadow-lg">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-bold text-primary">Mes Certifications</h2>
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

                                    {showCertificationForm && (
                                        <div className="bg-base-200 p-6 rounded-lg mb-8 shadow-sm">
                                            <h3 className="text-lg font-semibold mb-4">
                                                {editingCertificationId ? 'Modifier la Certification' : 'Nouvelle Certification'}
                                            </h3>
                                            <form
                                                onSubmit={editingCertificationId ? handleUpdateCertification : handleAddCertification}
                                                className="space-y-4"
                                            >
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="form-control">
                                                        <label className="label">
                                                            <span className="label-text">Name*</span>
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
                                                            <span className="label-text">Issued by                                *</span>
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
                                                            <span className="label-text">Date obtained  *</span>
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
                                                        placeholder="Décrivez cette certification..."
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
                                                            <span className="label-text">Aperçu</span>
                                                        </label>
                                                        <div className="w-40 h-40 border-2 border-base-300 rounded-lg overflow-hidden bg-base-200 flex items-center justify-center">
                                                            <img src={certificationImagePreview} alt="Aperçu" className="w-full h-full object-contain" />
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

                                    {certifications.length === 0 && !showCertificationForm && (
                                        <div className="text-center py-12 bg-base-200 rounded-lg shadow-sm">
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
                                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                                />
                                            </svg>
                                            <h3 className="mt-4 text-lg font-medium text-gray-500">No certification added.</h3>
                                            <p className="mt-1 text-gray-400">Add your certifications to display them here</p>
                                            <button
                                                onClick={() => setShowCertificationForm(true)}
                                                className="btn btn-primary mt-6 hover:bg-primary-focus transition-colors"
                                            >
                                                Add Certification
                                            </button>
                                        </div>
                                    )}

                                    {certifications.length > 0 && !showCertificationForm && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {certifications.map((certification) => (
                                                <div
                                                    key={certification._id}
                                                    className="bg-base-100 border border-base-300 hover:border-primary transition-colors p-4 rounded-lg shadow-sm"
                                                >
                                                    <div className="flex justify-between items-start gap-4">
                                                        <div className="flex-1">
                                                            <h3 className="text-lg font-semibold">
                                                                {certification.certifications_name || 'Sans nom'}
                                                            </h3>
                                                            {certification.description && (
                                                                <p className="mt-2 text-base-content/80 line-clamp-2">
                                                                    {certification.description}
                                                                </p>
                                                            )}
                                                            <p className="text-sm text-base-content/70 mt-1">
                                                                Issued by  * : {certification.issued_by || 'Inconnu'}
                                                            </p>
                                                            <p>Obtained on *: {new Date(certification.obtained_date).toLocaleDateString('fr-FR')}</p>
                                                        </div>
                                                        {certification.image ? (
                                                            <div className="w-20 h-20 border border-base-300 rounded-lg overflow-hidden bg-base-200">
                                                                <img
                                                                    src={certification.image.startsWith('data:') ? certification.image : `/uploads/${certification.image}`}
                                                                    alt={certification.certifications_name}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        e.target.src = 'https://via.placeholder.com/80?text=Pas+d%27image';
                                                                        e.target.alt = 'Image not available';
                                                                    }}
                                                                />
                                                            </div>
                                                        ) : null}
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
                                                            title="Modifier"
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
                                                            title="Supprimer"
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
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-primary">Mes Expériences Professionnelles</h2>
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
        Ajouter une expérience
      </button>
    </div>

    {/* Formulaire d'ajout/modification */}
    {showExperienceForm && (
      <div className="card bg-base-200 shadow-lg mb-8 p-6">
        <h3 className="text-xl font-semibold mb-6">
          {editingExperienceId ? 'Modifier une expérience' : 'Nouvelle expérience'}
        </h3>
        <form
          onSubmit={editingExperienceId ? handleUpdateExperience : handleAddExperience}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Intitulé du poste*</span>
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
                placeholder="Ex: Développeur Full Stack"
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Entreprise*</span>
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
                placeholder="Ex: Tech Solutions"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Type d'emploi</span>
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
              </select>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Type de lieu</span>
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
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Lieu</span>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Date de début*</span>
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
              <label className="label cursor-pointer">
                <span className="label-text font-medium">Poste actuel</span>
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
              {!editingExperienceId && !newExperience.is_current && (
                <input
                  type="date"
                  value={newExperience.end_date}
                  onChange={(e) => setNewExperience({ ...newExperience, end_date: e.target.value })}
                  className="input input-bordered mt-2"
                  max={new Date().toISOString().split('T')[0]}
                />
              )}
              {editingExperienceId && !editExperienceData.is_current && (
                <input
                  type="date"
                  value={editExperienceData.end_date}
                  onChange={(e) => setEditExperienceData({ ...editExperienceData, end_date: e.target.value })}
                  className="input input-bordered mt-2"
                  max={new Date().toISOString().split('T')[0]}
                />
              )}
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Description*</span>
            </label>
            <textarea
              value={editingExperienceId ? editExperienceData.description : newExperience.description}
              onChange={(e) =>
                editingExperienceId
                  ? setEditExperienceData({ ...editExperienceData, description: e.target.value })
                  : setNewExperience({ ...newExperience, description: e.target.value })
              }
              className="textarea textarea-bordered h-32"
              placeholder="Décrivez vos responsabilités et réalisations..."
              required
            />
          </div>

          <div className="flex justify-end gap-4">
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
             
                  job_source: '',
                });
              }}
              className="btn btn-outline"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Enregistrement...
                </>
              ) : editingExperienceId ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    )}

    {/* Liste des expériences */}
    {experiences.length === 0 && !showExperienceForm ? (
      <div className="text-center py-12 bg-base-200 rounded-lg">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-16 w-16 mx-auto text-gray-400"
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
        <h3 className="mt-4 text-xl font-medium text-gray-500">Aucune expérience</h3>
        <p className="mt-2 text-gray-400">Ajoutez vos expériences pour enrichir votre profil</p>
      </div>
    ) : (
      <div className="space-y-6">
        {experiences.map((experience) => {
          const startDate = new Date(experience.start_date);
          const endDate = experience.is_current ? new Date() : new Date(experience.end_date);
          const durationMonths = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24 * 30));
          const durationYears = Math.floor(durationMonths / 12);
          const remainingMonths = durationMonths % 12;
          const durationText = durationYears > 0
            ? `${durationYears} an${durationYears > 1 ? 's' : ''}${remainingMonths > 0 ? ` ${remainingMonths} mois` : ''}`
            : `${durationMonths} mois`;

          return (
            <div
              key={experience._id}
              className="card bg-base-100 border border-base-300 hover:shadow-lg transition-shadow p-6 rounded-lg"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-primary">{experience.job_title}</h3>
                  <p className="text-lg text-base-content/80">{experience.company}</p>
                  <p className="text-sm text-base-content/70 mt-1">
                    {startDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })} -{' '}
                    {experience.is_current ? 'Présent' : endDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })} 
                    {` • ${durationText}`}
                  </p>
                  {experience.location && (
                    <p className="text-sm text-base-content/70 mt-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 inline mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {experience.location} • {experience.location_type}
                    </p>
                  )}
                  <p className="text-sm text-base-content/70 mt-1">{experience.employment_type}</p>
                  {experience.description && (
                    <div className="mt-4">
                      <p className="text-base-content/80 line-clamp-3">{experience.description}</p>
                      <button
                        onClick={() => setSelectedExperience(experience)}
                        className="btn btn-link btn-sm text-primary p-0 mt-2"
                      >
                        Voir plus
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEditExperience(experience)}
                    className="btn btn-sm btn-ghost"
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
                    className="btn btn-sm btn-ghost text-error"
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
          );
        })}
      </div>
    )}

    {/* Modal pour les détails */}
    {selectedExperience && (
      <div className="modal modal-open">
        <div className="modal-box max-w-3xl">
          <h3 className="font-bold text-2xl text-primary mb-2">{selectedExperience.job_title}</h3>
          <p className="text-lg text-base-content/80 mb-2">{selectedExperience.company}</p>
          <div className="space-y-2 text-base-content/70">
            <p>
              {new Date(selectedExperience.start_date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })} -{' '}
              {selectedExperience.is_current ? 'Présent' : new Date(selectedExperience.end_date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </p>
            <p>{selectedExperience.employment_type} • {selectedExperience.location_type}</p>
            {selectedExperience.location && <p>Lieu: {selectedExperience.location}</p>}
          </div>
          {selectedExperience.description && (
            <div className="mt-6">
              <h4 className="font-semibold text-lg mb-2">Description</h4>
              <p className="text-base-content/80 whitespace-pre-wrap">{selectedExperience.description}</p>
            </div>
          )}
          <div className="modal-action mt-6">
            <button
              onClick={() => setSelectedExperience(null)}
              className="btn btn-primary"
            >
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
                                    <div>
                                        <h3 className="text-xl font-bold mb-4">Email Preferences</h3>
                                        <div className="space-y-4">
                                            <div className="form-control">
                                                <label className="cursor-pointer label justify-start gap-4">
                                                    <input type="checkbox" checked={true} className="checkbox checkbox-primary" />
                                                    <span>Task assignments and updates</span>
                                                </label>
                                            </div>
                                            <div className="form-control">
                                                <label className="cursor-pointer label justify-start gap-4">
                                                    <input type="checkbox" checked={true} className="checkbox checkbox-primary" />
                                                    <span>Project status updates</span>
                                                </label>
                                            </div>
                                            <div className="form-control">
                                                <label className="cursor-pointer label justify-start gap-4">
                                                    <input type="checkbox" checked={false} className="checkbox checkbox-primary" />
                                                    <span>Marketing and promotional emails</span>
                                                </label>
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