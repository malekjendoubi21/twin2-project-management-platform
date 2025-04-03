import { Link } from 'react-router-dom';
import { useEffect, useState, useRef, useCallback } from 'react';
import useSession from '../hooks/useSession';
import api from '../utils/Api';
import { toast } from 'react-hot-toast';

const Acceuil = () => {
  const { user, loading, logout, refreshUser, isAuthenticated } = useSession();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const hasLoadedDataRef = useRef(false);
  const [showInactivityAlert, setShowInactivityAlert] = useState(false);
  const [countdown, setCountdown] = useState(60);
   // New states for the workspace creation modal
   const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
   const [newWorkspaceName, setNewWorkspaceName] = useState('');
   const [newWorkspaceDescription, setNewWorkspaceDescription] = useState('');
   const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
   const [allWorkspaces, setAllWorkspaces] = useState([]);
   const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(false);
   // Function to handle workspace creation - same logic as CreateWorkspace.jsx
   const handleCreateWorkspace = async (e) => {
     e.preventDefault();
     setIsCreatingWorkspace(true);
   
     try {
       // 1. Create the workspace
       const workspaceResponse = await api.post('/api/workspaces/addWorkspace', {
         name: newWorkspaceName,
         description: newWorkspaceDescription,
         owner: user._id
       });
       
       const newWorkspace = workspaceResponse.data;
       
       // 2. Update the user
       await api.patch(`/api/users/${user._id}/add-workspace`, {
         workspaceId: newWorkspace._id
       });
       
       // 3. Force a full refresh of user data
       await refreshUser();
   
       // 4. Show success message
       toast.success('Workspace created successfully!');
       
       // 5. Reset form and close modal instead of navigating
       setNewWorkspaceName('');
       setNewWorkspaceDescription('');
       setShowWorkspaceModal(false);
       
     } catch (err) {
       console.error("Workspace creation error:", err);
       toast.error(err.response?.data?.error || 'Failed to create workspace');
     } finally {
       setIsCreatingWorkspace(false);
     }
   };
  
  // Refs to store the timers
  const inactivityTimerRef = useRef(null);
  const confirmTimeoutRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  
  // Function to reset inactivity timer
  const resetInactivityTimer = () => {
    // Clear the existing timer
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    
    // Only clear confirmation timeout if we're not showing the alert
    if (!showInactivityAlert && confirmTimeoutRef.current) {
      clearTimeout(confirmTimeoutRef.current);
    }
    
    // Set new timer - 10 minutes (600000 milliseconds) or 1 minute (60000) for testing
    inactivityTimerRef.current = setTimeout(() => {
      // Show confirmation dialog instead of logging out immediately
      setShowInactivityAlert(true);
      setCountdown(60);
      
      // Start countdown
      countdownIntervalRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // If no interaction after 1 minute, log out
      confirmTimeoutRef.current = setTimeout(() => {
        console.log("No response to inactivity alert, logging out");
        logout();
      }, 60000); // 1 minute to respond
    }, 600000); // 10 minutes (600000) or 1 minute (60000) for testing
  };
  
  // Function to handle staying signed in
  const staySignedIn = () => {
    setShowInactivityAlert(false);
    if (confirmTimeoutRef.current) {
      clearTimeout(confirmTimeoutRef.current);
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    resetInactivityTimer();
  };

  useEffect(() => {
    // Only load data once when the component mounts
    const loadUserData = async () => {
      if (hasLoadedDataRef.current) return;
      
      setIsRefreshing(true);
      try {
        await refreshUser();
        fetchAllAccessibleWorkspaces();
        hasLoadedDataRef.current = true;
      } catch (error) {
        console.error("Failed to refresh user data:", error);
      } finally {
        setIsRefreshing(false);
      }
    };
    
    if (isAuthenticated && !hasLoadedDataRef.current) {
      loadUserData();
    }
    
    
    // Define activity events to monitor
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    // Activity handler function
    const handleUserActivity = () => {
      // Only reset the timer if the inactivity alert is NOT showing
      if (!showInactivityAlert) {
        resetInactivityTimer();
      }
    };
    
    // Add event listeners for user activity
    activityEvents.forEach(event => {
      window.addEventListener(event, handleUserActivity);
    });
    
    const initialTimerSetup = setTimeout(() => {
      resetInactivityTimer();
    }, 1000);
    // Cleanup function
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
      
      // window.removeEventListener('beforeunload', handleWindowClose);
      
      if (initialTimerSetup) {
        clearTimeout(initialTimerSetup);
      }
      
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      if (confirmTimeoutRef.current) {
        clearTimeout(confirmTimeoutRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [isAuthenticated, showInactivityAlert, logout]);  // Added showInactivityAlert as dependency


  const fetchAllAccessibleWorkspaces = async () => {
    setIsLoadingWorkspaces(true);
    try {
      // Get workspaces where user is a member
      const response = await api.get('/api/workspaces/user/workspaces');
      setAllWorkspaces(response.data);
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      toast.error('Failed to load all workspaces');
    } finally {
      setIsLoadingWorkspaces(false);
    }
  };

  if (loading || isRefreshing) return <div className="text-center p-8">Loading...</div>;
  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-base-200 font-poppins">

{showInactivityAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-base-100 p-6 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-full bg-primary/20 p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold">Are you still there?</h3>
            </div>
            
            <p className="mb-6">You've been inactive for a while. For security purposes, you'll be logged out automatically in <span className="font-semibold text-primary">{countdown} seconds</span>.</p>
            
            {/* Progress bar */}
            <div className="w-full bg-base-300 rounded-full h-2 mb-6">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${(countdown / 60) * 100}%` }}
              ></div>
            </div>
            
            <div className="flex justify-end gap-4">
              <button onClick={logout} className="btn btn-outline">Log out</button>
              <button onClick={staySignedIn} className="btn btn-primary">I'm still here</button>
            </div>
          </div>
        </div>
      )}

{showWorkspaceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-base-100 p-6 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-primary">Create New Workspace</h3>
              <button 
                onClick={() => setShowWorkspaceModal(false)} 
                className="btn btn-sm btn-circle btn-ghost"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateWorkspace} className="space-y-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-base">Workspace Name</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter workspace name"
                  className="input input-bordered"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text text-base">Description (optional)</span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-32"
                  placeholder="Describe your workspace..."
                  value={newWorkspaceDescription}
                  onChange={(e) => setNewWorkspaceDescription(e.target.value)}
                ></textarea>
              </div>

              <div className="flex justify-end gap-4 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowWorkspaceModal(false)}
                  className="btn btn-outline" 
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={`btn btn-primary ${isCreatingWorkspace ? 'loading' : ''}`}
                  disabled={isCreatingWorkspace}
                >
                  {isCreatingWorkspace ? 'Creating...' : 'Create Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}      

      {/* Navigation Bar */}
      <nav className="navbar bg-base-100 shadow-lg px-4 lg:px-8 z-50 relative">
        <div className="flex-1">
          <Link to="/acceuil" className="btn btn-ghost text-xl text-primary">
PlaniFy</Link>
        </div>
        <div className="flex-none gap-4">
          <div className="dropdown dropdown-end">
            <div tabIndex={0} className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full">
                {user.profile_picture ? 
                  <img src={user.profile_picture} alt="Profile"/> : 
                  <div className="bg-primary text-white flex items-center justify-center h-full">
                    {user.name.charAt(0).toUpperCase() || 'U'}
                  </div>
                }
              </div>
            </div>
            <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-64">
              <li className="px-4 py-2">
                <span className="font-bold">{user.name}</span><br/>
              </li>
              <li><Link to="/profile">Profile Settings</Link></li>
              <li><button onClick={logout}>Logout</button></li>
            </ul>
          </div>
        </div>
      </nav>

{/* Blue Grid Background Section */}
<div className="relative z-10 bg-primary/5">
{/* Animated Modern Background Section */}
<div className="relative z-10 bg-primary/5">
  <div className="relative h-64 overflow-hidden">
    {/* Animated grid background */}
    <div 
      className="absolute inset-0 animate-grid-scroll"
      style={{ 
        backgroundImage: 'linear-gradient(to right, rgba(59, 130, 246, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(59, 130, 246, 0.1) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        transform: 'perspective(500px) rotateX(30deg)',
        transformOrigin: 'top',
      }}
    />
    
    {/* Second grid layer with different speed */}
    <div 
      className="absolute inset-0 animate-grid-scroll-slow"
      style={{ 
        backgroundImage: 'linear-gradient(to right, rgba(59, 130, 246, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(59, 130, 246, 0.15) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        transform: 'perspective(500px) rotateX(30deg)',
        transformOrigin: 'top',
        maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)'
      }}
    />
    
    {/* Floating particles */}
    <div className="absolute inset-0 overflow-hidden">
      <div className="animate-float absolute w-8 h-8 rounded-full bg-primary/10" style={{top: '20%', left: '10%'}}></div>
      <div className="animate-float-delay-1 absolute w-6 h-6 rounded-full bg-primary/10" style={{top: '70%', left: '25%'}}></div>
      <div className="animate-float-delay-2 absolute w-10 h-10 rounded-full bg-primary/10" style={{top: '40%', left: '75%'}}></div>
      <div className="animate-float-delay-3 absolute w-5 h-5 rounded-full bg-primary/10" style={{top: '60%', left: '55%'}}></div>
      <div className="animate-float-delay-4 absolute w-7 h-7 rounded-full bg-primary/10" style={{top: '30%', left: '85%'}}></div>
    </div>
    
    {/* Content */}
    <div className="relative z-10 h-full flex items-center justify-center text-center">
      <div className="max-w-2xl px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
          Welcome back, {user.name}!
        </h1>
        <p className="text-lg md:text-xl text-primary/80 mb-6">
          Manage your projects and collaborate with your team efficiently
        </p>
      </div>
    </div>
  </div>
</div>




          <div className="max-w-6xl mx-auto px-4 py-8">
                  <div className="mb-12">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-semibold text-primary">Your Workspaces</h2>
                      {/* Replace Link with button */}
                      <button 
                        onClick={() => setShowWorkspaceModal(true)} 
                        className="btn btn-primary"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                        </svg>
                        New Workspace
                      </button>
                    </div>
            
{/* Check both owned workspaces and all accessible workspaces */}
{(allWorkspaces && allWorkspaces.length > 0) ? (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {/* Map through all accessible workspaces */}
    {allWorkspaces.map((workspace) => (
      <div key={workspace._id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all hover:translate-y-[-5px]">
        <div className="card-body">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl">
              {workspace.name.charAt(0).toUpperCase()}
            </div>
            <h3 className="card-title text-primary">{workspace.name}</h3>
            {/* Show badge if user is a member but not owner */}
            {workspace.owner !== user._id && 
              <span className="badge badge-sm badge-outline">Member</span>
            }
          </div>
          
          <p className="text-base-content mb-4">
            {workspace.description || 'No description'}
          </p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="badge badge-outline">
              {workspace.projects ? `${workspace.projects.length} Projects` : '0 Projects'}
            </span>
            <span className="badge badge-outline">
              {workspace.members ? `${workspace.members.length} Members` : '1 Member'}
            </span>
          </div>
          
          <div className="card-actions justify-end mt-auto">
            <Link to={`/workspace/${workspace._id}`} className="btn btn-primary btn-block">
              Open Workspace
            </Link>
          </div>
        </div>
      </div>
    ))}
                
                {/* Create New Workspace Card */}
                <div className="card bg-base-100 shadow-lg border-2 border-dashed border-base-300 hover:border-primary transition-all">
                  <div className="card-body items-center justify-center text-center h-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-base-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                    </svg>
                    <h3 className="font-semibold mt-4 mb-2">Create New Workspace</h3>
                  <p className="text-base-content opacity-75 mb-4">Start a new project, team, or organization</p>
                  <button 
                    onClick={() => setShowWorkspaceModal(true)} 
                    className="btn btn-outline btn-primary"
                  >
                    Get Started
                  </button>
                </div>
              </div>
            </div>
          ) : (
              /* Empty state for no workspaces */
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body items-center justify-center py-12">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-base-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                  </svg>
                  <p className="text-base-content opacity-75 my-4 text-lg">
                  You don't have any workspaces yet. Create your first one to get started!
                </p>
                <button 
                  onClick={() => setShowWorkspaceModal(true)} 
                  className="btn btn-primary btn-lg"
                >
                  Create Your First Workspace
                </button>
              </div>
            </div>
          )}
          </div>
        </div>

        {/* Quick Access Section */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-primary mb-6">Quick Access</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {/* My Projects Card */}
              <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all">
                <div className="card-body">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="rounded-lg bg-primary/10 p-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                      </svg>
                    </div>
                    <h2 className="card-title text-primary">My Projects</h2>
                  </div>
                  <p>Manage your ongoing projects and track progress</p>
                  <div className="card-actions justify-end">
                    <button className="btn btn-primary btn-sm">View All</button>
                  </div>
                </div>
              </div>
              
              {/* Tasks Card */}
              <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all">
                <div className="card-body">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="rounded-lg bg-primary/10 p-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                      </svg>
                    </div>
                    <h2 className="card-title text-primary">Tasks</h2>
                  </div>
                  <p>View and manage your assigned tasks</p>
                  <div className="card-actions justify-end">
                    <button className="btn btn-primary btn-sm">View Tasks</button>
                  </div>
                </div>
              </div>
              
              {/* Team Card */}
              <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all">
                <div className="card-body">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="rounded-lg bg-primary/10 p-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                      </svg>
                    </div>
                    <h2 className="card-title text-primary">Team</h2>
                  </div>
                  <p>Collaborate with your team members</p>
                  <div className="card-actions justify-end">
                    <button className="btn btn-primary btn-sm">View Team</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
  @keyframes gridScroll {
    0% { background-position: 0 0; }
    100% { background-position: 0 40px; }
  }
  
  @keyframes gridScrollSlow {
    0% { background-position: 0 0; }
    100% { background-position: 0 20px; }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0) translateX(0); }
    25% { transform: translateY(-10px) translateX(5px); }
    50% { transform: translateY(-5px) translateX(10px); }
    75% { transform: translateY(5px) translateX(-5px); }
  }
  
  .animate-grid-scroll {
    animation: gridScroll 20s linear infinite;
  }
  
  .animate-grid-scroll-slow {
    animation: gridScrollSlow 15s linear infinite;
  }
  
  .animate-float {
    animation: float 10s ease-in-out infinite;
  }
  
  .animate-float-delay-1 {
    animation: float 12s ease-in-out 1s infinite;
  }
  
  .animate-float-delay-2 {
    animation: float 14s ease-in-out 2s infinite;
  }
  
  .animate-float-delay-3 {
    animation: float 16s ease-in-out 3s infinite;
  }
  
  .animate-float-delay-4 {
    animation: float 18s ease-in-out 4s infinite;
  }
`}</style>
      {/* Footer */}
      <footer className="footer p-10 bg-base-300 text-base-content border-t border-base-200 relative z-10">
        <div className="max-w-7xl mx-auto w-full">
          {/* Footer Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Product Links */}
            <div>
              <h6 className="footer-title opacity-100 text-primary">Product</h6>
              <Link to="/features" className="link link-hover">Features</Link>
              <Link to="/pricing" className="link link-hover">Pricing</Link>
              <Link to="/integrations" className="link link-hover">Integrations</Link>
              <Link to="/status" className="link link-hover">Status</Link>
            </div>
            
            {/* Solutions Links */}
            <div>
              <h6 className="footer-title opacity-100 text-primary">Solutions</h6>
              <Link to="/teams" className="link link-hover">For Teams</Link>
              <Link to="/startups" className="link link-hover">For Startups</Link>
              <Link to="/enterprise" className="link link-hover">Enterprise</Link>
              <Link to="/education" className="link link-hover">Education</Link>
            </div>
            
            {/* Company Links */}
            <div>
              <h6 className="footer-title opacity-100 text-primary">Company</h6>
              <Link to="/about" className="link link-hover">About</Link>
              <Link to="/careers" className="link link-hover">Careers</Link>
              <Link to="/blog" className="link link-hover">Blog</Link>
              <Link to="/contact" className="link link-hover">Contact</Link>
            </div>
            
            {/* Legal Links and Social Media */}
            <div>
              <h6 className="footer-title opacity-100 text-primary">Legal</h6>
              <Link to="/privacy" className="link link-hover">Privacy</Link>
              <Link to="/terms" className="link link-hover">Terms</Link>
              <Link to="/cookies" className="link link-hover">Cookies</Link>
              
              {/* Social Media Icons */}
              <div className="mt-4 flex gap-4">
                <a className="btn btn-circle btn-sm btn-ghost">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="fill-current">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a className="btn btn-circle btn-sm btn-ghost">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="fill-current">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                  </svg>
                </a>
                <a className="btn btn-circle btn-sm btn-ghost">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="fill-current">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          {/* Footer Bottom */}
          <div className="divider my-8"></div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Language Selector */}
            <div className="flex items-center gap-4">
              <span className="text-sm">Language:</span>
              <select className="select select-bordered select-sm w-32">
                <option>English</option>
                <option>Français</option>
                <option>Español</option>
              </select>
            </div>
            
            {/* Copyright and Links */}
            <div className="flex gap-4">
              <span className="text-sm">© 2024 
PlaniFy</span>
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
