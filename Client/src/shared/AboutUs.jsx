import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const AboutUs = () => {
  const [scrolled, setScrolled] = useState(false);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black font-poppins overflow-x-hidden">

        <motion.header 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-between items-center  mb-12 backdrop-blur-sm bg-black/10 p-4 rounded-2xl"
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
            className={`text-white/80 hover:text-primary transition-colors relative group ${item === "About-us" ? "text-primary" : ""}`}
            >
              {item}
              <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300 ${item === "About-us" ? "w-full" : "w-0 group-hover:w-full"}`}></span>
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
              <span className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">Our Story</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-4xl md:text-6xl font-bold mb-6"
            >
              Transforming how teams 
              <span className="relative ml-2 inline-block">
                collaborate
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
              We're on a mission to empower teams with intuitive tools that transform chaos into clarity, delivering a project management experience that's both powerful and beautifully simple.
            </motion.p>
          </div>
        </motion.div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-16 md:py-24 relative">
        <div className="absolute inset-0 bg-gray-900/50 z-0"></div>
        <div className="container mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="order-2 md:order-1"
            >
              <div className="relative">
                <div className="absolute -left-8 -top-8 w-full h-full rounded-2xl bg-primary/10 transform -rotate-6"></div>
                <img 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80" 
                  alt="Team collaboration" 
                  className="rounded-2xl shadow-xl relative z-10 w-full object-cover h-80 md:h-96"
                />
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="absolute -right-6 -bottom-6 w-36 h-36 rounded-2xl bg-blue-600/80 backdrop-blur-md shadow-lg grid place-items-center text-white z-20"
                >
                  <div className="text-center p-2">
                    <div className="text-3xl font-bold">5+</div>
                    <div className="text-sm">Years of Innovation</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="order-1 md:order-2"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="h-10 w-1 bg-primary rounded-full"></div>
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                  Our Mission
                </h2>
              </div>
              
              <p className="text-lg mb-6 text-white/80">
                We're committed to transforming how teams work together by providing an intelligent, intuitive platform that simplifies complex project management.
              </p>
              
              <div className="flex items-center gap-2 mb-4 mt-10">
                <div className="h-10 w-1 bg-purple-500 rounded-full"></div>
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
                  Our Vision
                </h2>
              </div>
              
              <p className="text-lg text-white/80">
                A world where every team can achieve their full potential, unburdened by inefficient workflows, with tools that adapt to their unique processes, not the other way around.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div 
            className="absolute inset-0 opacity-[0.03]" 
            style={{ 
              backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
              backgroundSize: '30px 30px'
            }}
          ></div>
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-br from-blue-500/5 to-teal-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Our <span className="text-primary">Values</span></h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              The principles that guide our decisions, shape our culture, and define how we build products and serve our customers.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "💡",
                title: "Innovation",
                description: "We constantly push boundaries, reimagining what's possible in project management software.",
                color: "from-blue-400 to-primary"
              },
              {
                icon: "🤝",
                title: "Collaboration",
                description: "We believe great teams achieve more together than individuals working in isolation.",
                color: "from-purple-400 to-pink-500"
              },
              {
                icon: "🔍",
                title: "Transparency",
                description: "We build honest relationships with customers through clear communication and visibility.",
                color: "from-amber-400 to-orange-500"
              },
              {
                icon: "🎯",
                title: "Impact",
                description: "We measure success by the real-world improvements we bring to teams and organizations.",
                color: "from-teal-400 to-green-500"
              },
              {
                icon: "🌱",
                title: "Growth",
                description: "We embrace continuous learning and development, evolving alongside our users' needs.",
                color: "from-indigo-400 to-blue-500"
              },
              {
                icon: "❤️",
                title: "Human-Centered",
                description: "We design for people first, creating experiences that feel intuitive and delightful.",
                color: "from-red-400 to-pink-500"
              }
            ].map((value, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -10, transition: { duration: 0.2 } }}
                className="card bg-black/30 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all"
              >
                <div className="card-body">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${value.color} flex items-center justify-center text-3xl mb-4 shadow-lg`}>
                    <span>{value.icon}</span>
                  </div>
                  <h3 className="card-title text-xl font-bold">{value.title}</h3>
                  <p className="text-white/80">{value.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>



      {/* Timeline Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Our <span className="text-primary">Journey</span></h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              From a simple idea to a platform loved by thousands of teams worldwide.
            </p>
          </motion.div>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 -ml-px h-full w-0.5 bg-base-300"></div>
            
            {/* Timeline items */}
            {[
              {
                year: "2018",
                title: "The Beginning",
                description: "PlaniFy was born out of the founders' frustration with existing project management tools. The journey began with a simple prototype.",
                position: "left"
              },
              {
                year: "2019",
                title: "First Release",
                description: "We released our first beta version to 100 teams who provided invaluable feedback that shaped our core product offering.",
                position: "right"
              },
              {
                year: "2020",
                title: "Rapid Growth",
                description: "As remote work became essential, our platform saw unprecedented growth, reaching 10,000 users across 30 countries.",
                position: "left"
              },
              {
                year: "2022",
                title: "Enterprise Expansion",
                description: "We launched our enterprise solution, bringing advanced security and scalability to large organizations worldwide.",
                position: "right"
              },
              {
                year: "2023",
                title: "AI Integration",
                description: "Introduced intelligent features powered by AI to help teams work smarter and make better decisions faster.",
                position: "left"
              },
              {
                year: "Today",
                title: "Global Impact",
                description: "PlaniFy now serves over 100,000 users worldwide, continuously evolving to meet the changing needs of modern teams.",
                position: "right"
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: item.position === "left" ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className={`relative mb-16 ${idx === 5 ? 'md:mb-0' : 'md:mb-24'}`}
              >
                <div className={`flex items-center justify-between gap-8 md:gap-12 flex-col ${item.position === 'left' ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className="w-full md:w-5/12">
                    <div className="card bg-black/30 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all h-full">
                      <div className="card-body">
                        <div className="badge badge-primary mb-2">{item.year}</div>
                        <h3 className="card-title text-xl font-bold">{item.title}</h3>
                        <p className="text-white/80">{item.description}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center z-10">
                    <div className="w-5 h-5 rounded-full bg-white"></div>
                  </div>
                  
                  <div className="w-full md:w-5/12"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-blue-500/10 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: [-20, 20, -20] }}
            transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
            className="absolute top-20 left-[10%] w-16 h-16 bg-primary/10 rounded-full"
          ></motion.div>
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: [20, -20, 20] }}
            transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
            className="absolute bottom-20 right-[10%] w-24 h-24 bg-blue-500/10 rounded-full"
          ></motion.div>
        </div>
        
        <div className="container mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-4xl font-bold mb-6">Ready to transform your team's productivity?</h2>
            <p className="text-xl text-white/80 mb-8">
              Join thousands of teams already using PlaniFy to streamline their workflows, enhance collaboration, and deliver exceptional results.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/contact" className="btn btn-primary btn-lg">
                Contact Us
              </Link>
              <Link to="/login" className="btn btn-outline btn-lg">
                Get Started
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer - Same as your template */}
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

export default AboutUs;