import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/Api';
import { toast } from 'react-hot-toast';

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        currentPassword: '',
        newPassword: '',
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get('/api/users/getMe');
                setUser(response.data);
                setFormData({
                    name: response.data.name,
                    email: response.data.email,
                    currentPassword: '',
                    newPassword: '',
                });
            } catch (error) {
                toast.error('Failed to load profile');
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await api.get('/api/auth/logout');
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            // Validate form data
            if (!formData.name || !formData.email) {
                toast.error('Name and email are required');
                return;
            }
    
            // If changing password, verify both fields are filled
            if (formData.newPassword && !formData.currentPassword) {
                toast.error('Current password is required to set new password');
                return;
            }
    
            // Create update payload
            const updateData = {
                name: formData.name,
                email: formData.email,
            };
    
            // Only include password fields if attempting to change password
            if (formData.currentPassword && formData.newPassword) {
                updateData.currentPassword = formData.currentPassword;
                updateData.newPassword = formData.newPassword;
            }
    
            // Make API call to update profile
            const response = await api.put('/api/users/updateProfile', updateData);
    
            if (response.data) {
                // Update local user state with new data
                setUser(response.data);
                
                // Reset form data
                setFormData({
                    ...formData,
                    currentPassword: '',
                    newPassword: '',
                });
                
                // Exit edit mode
                setIsEditing(false);
                
                toast.success('Profile updated successfully');
            }
        } catch (error) {
            console.error('Update error:', error);
            
            // Handle specific error messages from backend
            const errorMessage = error.response?.data?.message || 'Failed to update profile';
            toast.error(errorMessage);
            
            // Handle specific error cases
            if (error.response?.status === 401) {
                // Invalid current password
                toast.error('Current password is incorrect');
            } else if (error.response?.status === 400) {
                // Validation errors
                toast.error(error.response.data.message);
            } else if (error.response?.status === 409) {
                // Email already exists
                toast.error('Email already in use');
            }
        }
    };

    if (loading) return <div className="text-center p-8">Loading...</div>;

    return (
        <div className="min-h-screen bg-base-200 font-poppins">
            {/* Navbar */}
            <nav className="navbar bg-base-100 shadow-lg px-4 lg:px-8">
                <div className="flex-1">
                    <Link to="/acceuil" className="btn btn-ghost text-xl text-primary">
                        ProjectFlow
                    </Link>
                </div>
                
                <div className="flex-none gap-4">
                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} className="btn btn-ghost btn-circle avatar">
                            <div className="w-10 rounded-full">
                                {user.profile_picture ? (
                                    <img src={user.profile_picture} alt="Profile" />
                                ) : (
                                    <div className="bg-primary text-white flex items-center justify-center h-full">
                                        {user.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                        </div>
                        <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
                            <li className="px-4 py-2">
                                <span className="font-bold">{user.name}</span>
                                <br/>
                                <span className="text-sm">{user.email}</span>
                            </li>
                            <li><Link to="/acceuil">Home</Link></li>
                            <li><button onClick={handleLogout}>Logout</button></li>
                        </ul>
                    </div>
                </div>
            </nav>

            {/* Profile Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-base-100 shadow-xl rounded-lg p-6">
                        <h2 className="text-2xl font-bold text-primary mb-6">Profile Information</h2>
                        
                        {!isEditing ? (
                            <div className="space-y-6">
                                <div className="flex items-center justify-center mb-8">
                                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary">
                                        {user.profile_picture ? (
                                            <img 
                                                src={user.profile_picture} 
                                                alt="Profile" 
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-primary text-white flex items-center justify-center text-4xl">
                                                {user.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="grid gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Name</label>
                                        <p className="text-lg">{user.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Email</label>
                                        <p className="text-lg">{user.email}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Role</label>
                                        <p className="text-lg capitalize">{user.role}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Member Since</label>
                                        <p className="text-lg">{new Date(user.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => setIsEditing(true)}
                                    className="btn btn-primary w-full mt-6"
                                >
                                    Edit Profile
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Name</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="input input-bordered"
                                        required
                                    />
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Email</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        className="input input-bordered"
                                        required
                                    />
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Current Password</span>
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.currentPassword}
                                        onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                                        className="input input-bordered"
                                    />
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">New Password</span>
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.newPassword}
                                        onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                                        className="input input-bordered"
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <button type="submit" className="btn btn-primary flex-1">
                                        Save Changes
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setIsEditing(false)}
                                        className="btn btn-ghost flex-1"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;