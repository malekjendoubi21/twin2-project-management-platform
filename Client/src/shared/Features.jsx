import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const Features = () => {
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('project-management');

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 60);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Feature tabs data
  const featureTabs = [
    {
      id: 'project-management',
      label: 'Project Management',
      icon: 'fa-tasks'
    },
    {
      id: 'team-collaboration',
      label: 'Team Collaboration',
      icon: 'fa-users'
    },
    {
      id: 'time-tracking',
      label: 'Time Tracking',
      icon: 'fa-clock'
    },
    {
      id: 'reporting',
      label: 'Analytics & Reporting',
      icon: 'fa-chart-line'
    },
    {
      id: 'integrations',
      label: 'Integrations',
      icon: 'fa-plug'
    }
  ];

  // Features content by tab
  const featureContent = {
    'project-management': {
      title: 'Project Management',
      subtitle: 'Streamline your workflow and deliver projects on time, every time',
      description: 'Our intuitive project management tools help teams organize tasks, track progress, and meet deadlines with ease.',
      image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
      features: [
        {
          title: 'Task Management',
          description: 'Create, assign, and prioritize tasks with custom fields, dependencies, and subtasks',
          icon: 'fa-list-check'
        },
        {
          title: 'Kanban Boards',
          description: 'Visualize workflow with customizable Kanban boards for optimal team productivity',
          icon: 'fa-table-columns'
        },
        {
          title: 'Gantt Charts',
          description: 'Plan and schedule your projects with interactive Gantt charts and timeline views',
          icon: 'fa-bars-progress'
        },
        {
          title: 'Deadline Tracking',
          description: 'Set milestones and deadlines with automated reminders and notifications',
          icon: 'fa-calendar-check'
        }
      ]
    },
    'team-collaboration': {
      title: 'Team Collaboration',
      subtitle: 'Foster a culture of collaboration and boost team productivity',
      description: 'Keep your team aligned with powerful communication and file sharing tools designed for modern workplaces.',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
      features: [
        {
          title: 'Real-time Communication',
          description: 'Chat, comment, and collaborate on tasks and projects in real-time',
          icon: 'fa-comments'
        },
        {
          title: 'Document Collaboration',
          description: 'Edit, share, and manage documents with version control and permission settings',
          icon: 'fa-file-lines'
        },
        {
          title: 'Team Dashboards',
          description: 'Customizable dashboards showing team progress, workload, and performance',
          icon: 'fa-gauge-high'
        },
        {
          title: 'Workload Management',
          description: 'Balance team capacity and workload with visual resource management tools',
          icon: 'fa-user-group'
        }
      ]
    },
    'time-tracking': {
      title: 'Time Tracking',
      subtitle: 'Maximize productivity with accurate time management',
      description: 'Track time spent on tasks and projects to improve estimation, billing, and resource allocation.',
      image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2348&q=80',
      features: [
        {
          title: 'Automatic Time Tracking',
          description: 'Track time with one click or automate time tracking based on activity',
          icon: 'fa-stopwatch'
        },
        {
          title: 'Timesheet Reports',
          description: 'Generate detailed timesheet reports for billing and payroll purposes',
          icon: 'fa-file-invoice-dollar'
        },
        {
          title: 'Time Estimates',
          description: 'Set time estimates for tasks and track actual vs. estimated time',
          icon: 'fa-hourglass-half'
        },
        {
          title: 'Billable Hours',
          description: 'Mark hours as billable or non-billable and integrate with invoicing',
          icon: 'fa-money-bill-wave'
        }
      ]
    },
    'reporting': {
      title: 'Analytics & Reporting',
      subtitle: 'Make data-driven decisions with powerful insights',
      description: 'Transform project data into actionable insights with customizable reports and dashboards.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
      features: [

        {
          title: 'Real-time Dashboards',
          description: 'Visualize key performance indicators with interactive, real-time dashboards',
          icon: 'fa-chart-pie'
        },
        {
          title: 'Team Performance',
          description: 'Track productivity, efficiency, and performance across teams and projects',
          icon: 'fa-ranking-star'
        },
        {
          title: 'Export Capabilities',
          description: 'Export reports to PDF, Excel, or CSV formats for stakeholder presentations',
          icon: 'fa-file-export'
        }
      ]
    },
    'integrations': {
      title: 'Integrations',
      subtitle: 'Connect your favorite tools for a seamless workflow',
      description: 'Integrate with 100+ popular tools to create a unified workspace for your team.',
      image: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
      features: [
        {
          title: 'API Access',
          description: 'Robust API access for custom integrations and workflow automation',
          icon: 'fa-code'
        },
        {
          title: 'Popular Integrations',
          description: 'Connect with tools like Slack, Google Drive, GitHub, and more',
          icon: 'fa-arrows-to-dot'
        },
        {
          title: 'Workflow Automation',
          description: 'Create automated workflows between PlaniFy and your other tools',
          icon: 'fa-robot'
        },
        {
          title: 'Single Sign-On',
          description: 'Streamline access with SSO integration for enterprise security',
          icon: 'fa-right-to-bracket'
        }
      ]
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black font-poppins overflow-hidden">
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center mb-12 backdrop-blur-sm bg-black/10 p-4 rounded-2xl"
      >
            <motion.div 
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => window.location.href = '/'}
            >
          <div className="w-12 h-12 relative overflow-hidden">
            <motion.div 
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-primary rounded-lg rotate-45 origin-center"
            ></motion.div>
            <motion.div 
              animate={{ rotate: [0, -360] }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-info rounded-lg rotate-90 origin-center opacity-60"
            ></motion.div>
            <span className="absolute inset-0 flex items-center justify-center font-bold text-white text-xl">P</span>
          </div>
          <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">PlaniFy</span>
            </motion.div>
        
        <div className="flex-1 flex justify-center">
          <motion.nav 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="hidden lg:flex items-center gap-8"
          >
            {["Features", "Pricing", "About-us", "Contact"].map((item, index) => (
              <motion.div
                key={item}
                whileHover={{ scale: 1.1, color: "#60a5fa" }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Link 
                  to={`/${item.toLowerCase()}`} 
                  className={`text-white/80 hover:text-primary transition-colors relative group ${item === "Features" ? "text-primary" : ""}`}
                >
                  {item}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300 ${item === "Features" ? "w-full" : "w-0 group-hover:w-full"}`}></span>
                </Link>
              </motion.div>
            ))}
          </motion.nav>
        </div>
        
        {/* Right section (empty for balance) */}
        <div className="w-[116px]"></div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative pt-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-primary/30 to-purple-500/10 blur-3xl -top-48 -right-48"></div>
          <div className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-500/10 blur-3xl -bottom-48 -left-48"></div>
          
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: [-20, 20, -20] }}
            transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
            className="absolute top-40 left-[10%] w-12 h-12 bg-primary/10 rounded-lg"
          ></motion.div>
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: [20, -20, 20] }}
            transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
            className="absolute bottom-32 right-[15%] w-16 h-16 bg-purple-500/10 rounded-full"
          ></motion.div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="container mx-auto px-6 sm:px-8 lg:px-12 py-16 relative z-10"
        >
          <div className="text-center max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-4"
            >
              <span className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">Powerful Features</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-4xl md:text-6xl font-bold mb-6"
            >
              Everything you need to 
              <span className="relative ml-2 inline-block">
                succeed
                <motion.div 
                  className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                ></motion.div>
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-xl leading-relaxed text-white/80 mb-8 max-w-3xl mx-auto"
            >
              PlaniFy combines powerful project management tools with team collaboration features to help you deliver projects on time and within budget.
            </motion.p>
          </div>
        </motion.div>
      </section>

      {/* Features Tabs Section */}
      <section className="py-16 relative">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {featureTabs.map((tab) => (
              <motion.button
                key={tab.id}
                className={`px-5 py-3 rounded-full text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'bg-gray-800/50 text-white/70 hover:bg-gray-800/80'
                }`}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <i className={`fas ${tab.icon} mr-2`}></i>
                {tab.label}
              </motion.button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            >
              {/* Feature Content */}
              <div>
                <div className="mb-2">
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    <i className={`fas ${featureTabs.find(t => t.id === activeTab)?.icon}`}></i>
                    {' ' + featureContent[activeTab].subtitle}
                  </span>
                </div>
                <h2 className="text-3xl font-bold mb-4">{featureContent[activeTab].title}</h2>
                <p className="text-white/80 text-lg mb-8">{featureContent[activeTab].description}</p>
                
                <div className="grid gap-6">
                  {featureContent[activeTab].features.map((feature, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.1 }}
                      className="flex gap-4"
                    >
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <i className={`fas ${feature.icon} text-primary text-xl`}></i>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-1">{feature.title}</h3>
                        <p className="text-white/70">{feature.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              {/* Feature Image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative aspect-video rounded-xl overflow-hidden shadow-2xl shadow-black/40 border border-white/10"
              >
                <img
                  src={featureContent[activeTab].image}
                  alt={featureContent[activeTab].title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* All-in-one Platform Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900/50 to-black/80 relative overflow-hidden">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-3"
            >
              <span className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">All-in-One Solution</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Everything you need in one place
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-white/80 max-w-3xl mx-auto"
            >
              PlaniFy combines all the tools you need to manage projects and collaborate with your team effectively.
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: 'fa-diagram-project',
                title: 'Project Planning',
                description: 'Plan your projects with customizable templates, task dependencies, and milestones.'
              },
              {
                icon: 'fa-list-check',
                title: 'Task Management',
                description: 'Create, assign and track tasks with custom fields, priorities, and due dates.'
              },
              {
                icon: 'fa-comments',
                title: 'Team Communication',
                description: 'Chat, comment, and share files directly within tasks and projects.'
              },
              {
                icon: 'fa-calendar',
                title: 'Resource Scheduling',
                description: 'Allocate team resources efficiently with visual calendars and workload views.'
              },
              {
                icon: 'fa-gauge-high',
                title: 'Performance Tracking',
                description: 'Monitor project progress, team performance, and identify bottlenecks.'
              },
              {
                icon: 'fa-file-lines',
                title: 'Documentation',
                description: 'Create and manage project documentation with wiki-style pages and attachments.'
              },
              {
                icon: 'fa-chart-line',
                title: 'Analytics & Reporting',
                description: 'Generate custom reports and visualize project metrics with interactive dashboards.'
              },
              {
                icon: 'fa-mobile-screen',
                title: 'Mobile Access',
                description: 'Access your projects anytime, anywhere with our iOS and Android mobile apps.'
              },
              {
                icon: 'fa-shield-halved',
                title: 'Enterprise Security',
                description: 'Keep your data secure with enterprise-grade security features and compliance.'
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/5 hover:border-primary/20 transition-all hover:shadow-md hover:shadow-primary/5 group"
              >
                <div className="w-14 h-14 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors flex items-center justify-center mb-5">
                  <i className={`fas ${feature.icon} text-primary text-2xl`}></i>
                </div>
                <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
                <p className="text-white/70">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Compare our plans
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-white/80 max-w-3xl mx-auto"
            >
              Choose the plan that works best for your team's needs.
            </motion.p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="overflow-auto max-w-full"
          >
            <table className="w-full min-w-[768px] border-collapse">
              <thead>
                <tr>
                  <th className="p-4 text-left font-medium text-white/50">Features</th>
                  <th className="p-4 text-center font-medium">
                    <div className="mb-2">Starter</div>
                    <div className="text-primary text-2xl font-bold">$9</div>
                    <div className="text-sm text-white/60">per user/month</div>
                  </th>
                  <th className="p-4 text-center font-medium relative">
                    <div className="absolute -top-3 left-0 right-0 flex justify-center">
                      <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-medium">Most Popular</span>
                    </div>
                    <div className="mb-2 pt-2">Pro</div>
                    <div className="text-primary text-2xl font-bold">$19</div>
                    <div className="text-sm text-white/60">per user/month</div>
                  </th>
                  <th className="p-4 text-center font-medium">
                    <div className="mb-2">Enterprise</div>
                    <div className="text-primary text-2xl font-bold">$49</div>
                    <div className="text-sm text-white/60">per user/month</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Projects', starter: 'Up to 10', pro: 'Unlimited', enterprise: 'Unlimited' },
                  { feature: 'Tasks', starter: 'Unlimited', pro: 'Unlimited', enterprise: 'Unlimited' },
                  { feature: 'Team members', starter: 'Up to 3', pro: 'Up to 15', enterprise: 'Unlimited' },
                  { feature: 'Storage', starter: '1 GB', pro: '10 GB', enterprise: '100 GB' },
                  { feature: 'Gantt charts', starter: false, pro: true, enterprise: true },
                  { feature: 'Time tracking', starter: 'Basic', pro: 'Advanced', enterprise: 'Advanced' },
                  { feature: 'Custom fields', starter: 'Up to 3', pro: 'Up to 15', enterprise: 'Unlimited' },
                  { feature: 'Reporting', starter: 'Basic', pro: 'Advanced', enterprise: 'Custom' },
                  { feature: 'API access', starter: false, pro: true, enterprise: true },
                  { feature: 'SSO & SAML', starter: false, pro: false, enterprise: true },
                  { feature: 'Priority support', starter: false, pro: true, enterprise: true },
                  { feature: 'Dedicated manager', starter: false, pro: false, enterprise: true },
                ].map((row, idx) => (
                  <tr key={idx} className="border-t border-white/10">
                    <td className="p-4 text-left">{row.feature}</td>
                    <td className="p-4 text-center">
                      {typeof row.starter === 'boolean' ? (
                        row.starter ? <i className="fas fa-check text-green-500"></i> : <i className="fas fa-times text-white/30"></i>
                      ) : (
                        row.starter
                      )}
                    </td>
                    <td className="p-4 text-center bg-white/5">
                      {typeof row.pro === 'boolean' ? (
                        row.pro ? <i className="fas fa-check text-green-500"></i> : <i className="fas fa-times text-white/30"></i>
                      ) : (
                        row.pro
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {typeof row.enterprise === 'boolean' ? (
                        row.enterprise ? <i className="fas fa-check text-green-500"></i> : <i className="fas fa-times text-white/30"></i>
                      ) : (
                        row.enterprise
                      )}
                    </td>
                  </tr>
                ))}
                <tr className="border-t border-white/10">
                  <td className="p-4"></td>
                  <td className="p-4 text-center">
                    <Link to="/pricing" className="btn btn-outline btn-sm">Get Started</Link>
                  </td>
                  <td className="p-4 text-center bg-white/5">
                    <Link to="/pricing" className="btn btn-primary btn-sm">Get Started</Link>
                  </td>
                  <td className="p-4 text-center">
                    <Link to="/contact" className="btn btn-outline btn-sm">Contact Sales</Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900/50 to-black/80 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-primary/20 to-blue-500/5 blur-3xl -top-48 right-12"></div>
        </div>
        
        <div className="container mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              What our customers are saying
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-white/80 max-w-3xl mx-auto"
            >
              Thousands of teams trust PlaniFy to manage their projects.
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                quote: "PlaniFy has completely transformed how our team collaborates on projects. The intuitive interface and powerful features have increased our productivity by 35%.",
                author: "Sarah Johnson",
                role: "Product Manager, TechCorp",
                image: "https://randomuser.me/api/portraits/women/44.jpg"
              },
              {
                quote: "After trying multiple project management tools, PlaniFy is the only one that met all of our needs. The Gantt charts and time tracking features are game-changers.",
                author: "Michael Chen",
                role: "CTO, StartupX",
                image: "https://randomuser.me/api/portraits/men/32.jpg"
              },
              {
                quote: "The reporting capabilities in PlaniFy have given us unprecedented visibility into our project metrics. We can now make data-driven decisions that improve our outcomes.",
                author: "Emily Rodriguez",
                role: "Operations Director, Agency Inc",
                image: "https://randomuser.me/api/portraits/women/68.jpg"
              }
            ].map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/5 relative"
              >
                <div className="text-4xl text-primary/20 absolute top-4 right-4">
                  <i className="fas fa-quote-right"></i>
                </div>
                <p className="mb-6 text-white/80 relative z-10">{testimonial.quote}</p>
                <div className="flex items-center gap-4">
                  <img src={testimonial.image} alt={testimonial.author} className="w-12 h-12 rounded-full" />
                  <div>
                    <h4 className="font-semibold">{testimonial.author}</h4>
                    <p className="text-white/60 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-primary/20 to-purple-500/10 blur-3xl top-1/4 -left-48"></div>
        </div>
        
        <div className="container mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="bg-gradient-to-r from-primary/10 to-blue-600/10 rounded-2xl p-12 border border-white/5 text-center max-w-5xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to streamline your projects?</h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Join thousands of teams using PlaniFy to deliver projects successfully.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/pricing" className="btn btn-primary btn-lg">
                <i className="fas fa-rocket mr-2"></i>
                Get Started
              </Link>
              <Link to="/contact" className="btn btn-outline btn-lg">
                <i className="fas fa-headset mr-2"></i>
                Contact Sales
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer - Same as Contact page */}
      <footer className="border-t border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        
        <div className="container mx-auto px-8 py-16 relative z-10">
          <div className="flex flex-col md:flex-row justify-between gap-12">
            <div className="md:w-1/3">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 relative overflow-hidden">
                  <motion.div 
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-primary rounded-lg rotate-45"
                  ></motion.div>
                  <motion.div 
                    animate={{ rotate: [0, -360] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-info rounded-lg rotate-90 opacity-60"
                  ></motion.div>
                  <span className="absolute inset-0 flex items-center justify-center font-bold text-white text-lg">P</span>
                </div>
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">PlaniFy</span>
              </div>
              
              <p className="text-white/70 mb-6">
                Simplify project management and enhance team collaboration with our comprehensive platform designed for modern teams.
              </p>
              
              <div className="flex gap-4">
                {["linkedin", "github"].map(platform => (
                  <a 
                    key={platform} 
                    href="#" 
                    className="btn btn-circle btn-sm btn-ghost bg-white/5 hover:bg-white/10 border-none text-white/70 hover:text-white"
                  >
                    <i className={`fa-brands fa-${platform}`}></i>
                  </a>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              {[
                {
                  title: "Product",
                  links: ["Features", "Pricing", "Integrations"]
                },
                {
                  title: "Company",
                  links: ["About Us", "Contact"]
                }
              ].map((column, idx) => (
                <div key={idx}>
                  <h4 className="text-lg font-medium mb-5 text-primary">{column.title}</h4>
                  <ul className="space-y-3">
                    {column.links.map((link, i) => (
                      <li key={i}>
                        <Link 
                          to={`/${link.toLowerCase().replace(/\s+/g, '-')}`}
                          className="text-white/70 hover:text-white transition-colors relative inline-block group"
                        >
                          {link}
                          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/60">
              © {new Date().getFullYear()} PlaniFy. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-6 mt-6 md:mt-0">
              <div className="flex items-center gap-2">
                <select className="select select-sm bg-white/5 border-white/10 text-white/70">
                  <option>English (US)</option>
                  <option>Français</option>
                  <option>Español</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </footer>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <style>{`
        @keyframes gridScroll {
          0% { background-position: 0 0; }
          100% { background-position: 0 40px; }
        }
        
        .bg-grid-pattern {
          background-image: radial-gradient(circle, currentColor 1px, transparent 1px);
          background-size: 30px 30px;
          animation: gridScroll 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Features;