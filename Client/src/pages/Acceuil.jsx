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
      <footer className="footer p-10 bg-base-300 text-base-content border-t border-base-200">
  <div className="max-w-7xl mx-auto w-full">
    {/* Main Footer Content */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
      
      {/* Product Column */}
      <div>
        <h6 className="footer-title opacity-100 text-primary">Product</h6> 
        <Link to="/features" className="link link-hover">Features</Link>
        <Link to="/pricing" className="link link-hover">Pricing</Link>
        <Link to="/integrations" className="link link-hover">Integrations</Link>
        <Link to="/status" className="link link-hover">Status</Link>
      </div>

      {/* Solutions Column */}
      <div>
        <h6 className="footer-title opacity-100 text-primary">Solutions</h6> 
        <Link to="/teams" className="link link-hover">For Teams</Link>
        <Link to="/startups" className="link link-hover">For Startups</Link>
        <Link to="/enterprise" className="link link-hover">Enterprise</Link>
        <Link to="/education" className="link link-hover">Education</Link>
      </div>

      {/* Company Column */}
      <div>
        <h6 className="footer-title opacity-100 text-primary">Company</h6> 
        <Link to="/about" className="link link-hover">About</Link>
        <Link to="/careers" className="link link-hover">Careers</Link>
        <Link to="/blog" className="link link-hover">Blog</Link>
        <Link to="/contact" className="link link-hover">Contact</Link>
      </div>

      {/* Legal & Social */}
      <div>
        <h6 className="footer-title opacity-100 text-primary">Legal</h6> 
        <Link to="/privacy" className="link link-hover">Privacy</Link>
        <Link to="/terms" className="link link-hover">Terms</Link>
        <Link to="/cookies" className="link link-hover">Cookies</Link>
        
        {/* Social Icons */}
        <div className="mt-4 flex gap-4">
          <a className="btn btn-circle btn-sm btn-ghost">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="fill-current">
              <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
            </svg>
          </a>
          <a className="btn btn-circle btn-sm btn-ghost">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="fill-current">
              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path>
            </svg>
          </a>
          <a className="btn btn-circle btn-sm btn-ghost">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="fill-current">
              <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path>
            </svg>
          </a>
        </div>
      </div>
    </div>

    {/* Divider */}
    <div className="divider my-8"></div>

    {/* Bottom Footer */}
    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="flex items-center gap-4">
        <span className="text-sm">Language:</span>
        <select className="select select-bordered select-sm w-32">
          <option>English</option>
          <option>Français</option>
          <option>Español</option>
        </select>
      </div>
      
      <div className="flex gap-4">
        <span className="text-sm">© 2024 ProjectFlow</span>
        <Link to="/privacy" className="link link-hover text-sm">Privacy Policy</Link>
        <Link to="/terms" className="link link-hover text-sm">Terms of Service</Link>
      </div>
    </div>
  </div>
</footer>
    </div>
  );
};

export default Acceuil;