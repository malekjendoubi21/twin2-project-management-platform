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
        phone_number: '',
        bio: '',
        role: '',
        two_factor_enabled: false,
        profile_picture: '',
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get('/api/users/getMe');
                setUser(response.data);
                setFormData({
                    name: response.data.name,
                    email: response.data.email,
                    phone_number: response.data.phone_number || '',
                    bio: response.data.bio || '',
                    role: response.data.role || 'user',
                    two_factor_enabled: response.data.two_factor_enabled || false,
                    profile_picture: response.data.profile_picture || '',
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const response = await api.put('/api/users/updateMe', {
                name: formData.name,
                email: formData.email,
                phone_number: formData.phone_number,
                bio: formData.bio,
                profile_picture: formData.profile_picture
            });
    
            if (response.data.user) {
                setUser(response.data.user);
                setIsEditing(false);
                toast.success('Profile updated successfully');
            }
        } catch (error) {
            console.error('Update error:', error);
            const errorMessage = error.response?.data?.error || 'Failed to update profile';
            toast.error(errorMessage);
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
                            {formData.profile_picture ? (
                                <div className="w-10 rounded-full">
                                    <img 
                                        src={formData.profile_picture} 
                                        alt={`${user.name}'s profile`} 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="w-10 rounded-full bg-primary text-white flex items-center justify-center h-full">
                                    {user.name.charAt(0)}
                                </div>
                            )}
                        </div>
                        <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
                            <li className="px-4 py-2">
                                <span className="font-bold">{user.name}</span>
                                <br/>
                                <span className="text-sm">{user.email}</span>
                            </li>
                            <li><Link to="/acceuil">Home</Link></li>
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
                                        <label className="text-sm font-medium text-gray-500">Phone Number</label>
                                        <p className="text-lg">{user.phone_number || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Bio</label>
                                        <p className="text-lg">{user.bio || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Role</label>
                                        <p className="text-lg capitalize">{user.role}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Two-Factor Authentication</label>
                                        <p className="text-lg">
                                            {user.two_factor_enabled ? 'Enabled' : 'Disabled'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Profile Picture</label>
                                        {user.profile_picture ? (
                                            <img 
                                                src={user.profile_picture} 
                                                alt="Profile" 
                                                className="mt-2 w-32 h-32 object-cover rounded-lg"
                                            />
                                        ) : (
                                            <p className="text-lg">No profile picture</p>
                                        )}
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
                                        <span className="label-text">Phone Number</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.phone_number}
                                        onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                                        className="input input-bordered"
                                    />
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Bio</span>
                                    </label>
                                    <textarea
                                        value={formData.bio}
                                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                        className="textarea textarea-bordered"
                                    />
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Profile Picture URL</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.profile_picture}
                                        onChange={(e) => setFormData({...formData, profile_picture: e.target.value})}
                                        className="input input-bordered"
                                        placeholder="Enter URL for profile picture"
                                    />
                                </div>

                                {/* Read-only fields */}
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Role</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.role}
                                        className="input input-bordered input-disabled"
                                        disabled
                                    />
                                </div>

                                <div className="form-control">
                                    <label className="label cursor-pointer">
                                        <span className="label-text">Two-Factor Authentication</span>
                                        <input 
                                            type="checkbox" 
                                            checked={formData.two_factor_enabled}
                                            className="toggle toggle-primary"
                                            disabled // Typically, 2FA would be toggled in a separate security settings page
                                        />
                                    </label>
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