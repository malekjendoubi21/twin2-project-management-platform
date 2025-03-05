import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-base-200 font-poppins">
      {/* Navbar */}
      <nav className="navbar bg-base-100 shadow-lg px-4 lg:px-8">
        <div className="flex-1">
          <Link to="/" className="btn btn-ghost text-xl text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
            ProjectFlow
          </Link>
        </div>
        <div className="flex-none">
          <ul className="menu menu-horizontal px-1 hidden lg:flex">
            <li><Link to="/features">Features</Link></li>
            <li><Link to="/pricing">Pricing</Link></li>
            <li><Link to="/about">About</Link></li>
          </ul>
          <Link to="/login" className="btn btn-primary ml-4">Sign In</Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="hero min-h-[80vh]">
        <div className="hero-content text-center">
          <div className="max-w-4xl">
            <h1 className="text-5xl font-bold text-primary mb-8">
              Streamline Your Team's Workflow
            </h1>
            <p className="text-xl mb-8">
              Collaborate, manage projects, and reach new productivity peaks with ProjectFlow - 
              the ultimate project management solution for modern teams.
            </p>
            <div className="mockup-window bg-base-300 mt-8">
              <div className="flex justify-center px-4 py-16 bg-base-200">
                <div className="animate-pulse">🚀 Dashboard Preview</div>
              </div>
            </div>
            <div className="mt-8">
              <Link to="/register" className="btn btn-primary btn-lg">
                Get Started - It's Free
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 px-4 lg:px-8 bg-base-100">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose ProjectFlow?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="text-primary mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Task Management</h3>
              <p>Organize tasks, set priorities, and track progress with our intuitive interface.</p>
            </div>
          </div>
          
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="text-primary mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Team Collaboration</h3>
              <p>Real-time updates, comments, and file sharing for seamless teamwork.</p>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="text-primary mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Analytics & Reports</h3>
              <p>Detailed insights and progress tracking for better decision making.</p>
            </div>
          </div>
        </div>
      </div>

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

      {/* Copyright */}
      <div className="bg-base-300 text-center py-4">
        <p className="text-sm">© 2024 ProjectFlow. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Home;