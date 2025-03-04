import api from '../utils/Api';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Acceuil = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

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

    const handleLogout = async () => {
        try {
            await api.get('/api/auth/logout');
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
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
                            <li><Link to="/profile">Profile Settings</Link></li>
                            <li><button onClick={handleLogout}>Logout</button></li>
                        </ul>
                    </div>
                </div>
            </nav>

      {/* Main Content */}
      <div className="hero min-h-[80vh]">
                <div className="hero-content text-center">
                    <div className="max-w-4xl">
                        <h1 className="text-4xl font-bold text-primary mb-8">
                            Welcome back, {user.name}!
                        </h1>
            <p className="text-xl mb-8">
              Here's your personalized workspace. Start managing your projects efficiently.
            </p>
            
            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title text-primary">My Projects</h2>
                  <p>Manage your ongoing projects</p>
                  <div className="card-actions justify-end">
                    <button className="btn btn-primary">View</button>
                  </div>
                </div>
              </div>
              
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title text-primary">Tasks</h2>
                  <p>Check your assigned tasks</p>
                  <div className="card-actions justify-end">
                    <button className="btn btn-primary">View</button>
                  </div>
                </div>
              </div>
              
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title text-primary">Team</h2>
                  <p>Collaborate with your team</p>
                  <div className="card-actions justify-end">
                    <button className="btn btn-primary">View</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer p-10 bg-base-300 text-base-content">
        {/* Same footer as Home component */}
      </footer>
    </div>
  );
};

export default Acceuil;