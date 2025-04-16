import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

const Contact = () => {
  const [scrolled, setScrolled] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast.success('Your message has been sent successfully!');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black font-poppins overflow-x-hidden">
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
              className={`text-white/80 hover:text-primary transition-colors relative group ${item === "Contact" ? "text-primary" : ""}`}
              >
                {item}
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300 ${item === "Contact" ? "w-full" : "w-0 group-hover:w-full"}`}></span>
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
              <span className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">Get in Touch</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-4xl md:text-6xl font-bold mb-6"
            >
              Have questions? 
              <span className="relative ml-2 inline-block">
                Contact us
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
              Our team is here to help you with any questions or inquiries about our platform. We'd love to hear from you!
            </motion.p>
          </div>
        </motion.div>
      </section>

      {/* Contact Form & Info Section */}
      <section className="py-16 relative">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="card bg-black/30 backdrop-blur-sm shadow-xl border border-white/10"
            >
              <div className="card-body p-8">
                <h2 className="text-2xl font-bold mb-6 text-primary">Send us a message</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text text-white/80">Your Name</span>
                      </label>
                      <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe" 
                        className="input input-bordered w-full" 
                        required 
                      />
                    </div>
                    
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text text-white/80">Email Address</span>
                      </label>
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com" 
                        className="input input-bordered w-full" 
                        required 
                      />
                    </div>
                  </div>
                  
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-white/80">Subject</span>
                    </label>
                    <input 
                      type="text" 
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="How can we help you?" 
                      className="input input-bordered w-full" 
                      required 
                    />
                  </div>
                  
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-white/80">Message</span>
                    </label>
                    <textarea 
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      className="textarea textarea-bordered h-32" 
                      placeholder="Your message here..." 
                      required
                    ></textarea>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className={`btn btn-primary w-full ${isSubmitting ? 'loading' : ''}`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </motion.button>
                </form>
              </div>
            </motion.div>
            
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="flex flex-col justify-between"
            >
              <div>
                <h2 className="text-2xl font-bold mb-6 text-primary">Contact Information</h2>
                
                <div className="grid gap-8">
                  {[
                    {
                      icon: "fa-map-marker-alt",
                      title: "Office Location",
                      details: [
                        "123 Innovation Drive",
                        "San Francisco, CA 94103",
                        "United States"
                      ]
                    },
                    {
                      icon: "fa-envelope",
                      title: "Email Us",
                      details: [
                        "info@planify.com",
                        "support@planify.com"
                      ]
                    },
                    {
                      icon: "fa-phone",
                      title: "Call Us",
                      details: [
                        "+1 (555) 123-4567",
                        "Mon-Fri from 9am to 6pm"
                      ]
                    }
                  ].map((item, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      className="flex gap-4"
                    >
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <i className={`fas ${item.icon} text-primary text-xl`}></i>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                        <div className="space-y-1 text-white/80">
                          {item.details.map((line, i) => (
                            <p key={i}>{line}</p>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              <div className="mt-12">
                <h3 className="text-lg font-bold mb-4">Connect With Us</h3>
                <div className="flex gap-3">
                  {["facebook", "twitter", "linkedin", "instagram"].map((platform) => (
                    <motion.a
                      key={platform}
                      whileHover={{ scale: 1.1, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      href="#"
                      className="w-10 h-10 rounded-lg bg-base-300 hover:bg-primary text-white/80 hover:text-white flex items-center justify-center transition-colors"
                    >
                      <i className={`fab fa-${platform}`}></i>
                    </motion.a>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>


        <section className="py-12 relative">
          <div className="container mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
            <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="card bg-black/30 backdrop-blur-sm shadow-xl overflow-hidden"
            >
          <div className="relative h-96">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3238.678866524165!2d10.21180131526015!3d36.89839297992837!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12fd34f7b9d2c8b1%3A0x4c5b6b6e8b9d8b8f!2sESPRIT!5e0!3m2!1sen!2stn!4v1697041234567!5m2!1sen!2stn" 
              className="w-full h-full border-0"
              style={{ filter: 'grayscale(1) contrast(1.2) opacity(0.8)' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Office Location Map"
            ></iframe>
            
            <div className="absolute bottom-4 left-4 right-4 bg-black/30 backdrop-blur-sm p-4 rounded-lg shadow-lg">
              <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
              <i className="fas fa-map-marker-alt"></i>
            </div>
            <div>
              <h3 className="font-bold text-lg">PlaniFy Headquarters</h3>
              <p className="text-white/80 text-sm">ESPRIT, Ariana Soghra, Tunisia</p>
            </div>
              </div>
            </div>
          </div>
            </motion.div>
          </div>
        </section>

        {/* FAQ Section */}
      <section className="py-16 bg-gray-900/30 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div 
            className="absolute inset-0 opacity-[0.03]" 
            style={{ 
              backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
              backgroundSize: '30px 30px'
            }}
          ></div>
        </div>
        
        <div className="container mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Frequently Asked <span className="text-primary">Questions</span></h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Find quick answers to some of our most common questions. If you need further assistance, don't hesitate to contact us.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                question: "How quickly will I get a response to my inquiry?",
                answer: "We typically respond to all inquiries within 24 hours during business days. For urgent matters, we recommend reaching out via phone."
              },
              {
                question: "Do you offer custom enterprise solutions?",
                answer: "Yes, we provide tailored enterprise solutions to meet your organization's specific needs. Contact our sales team to discuss your requirements."
              },
              {
                question: "Is there a free trial available?",
                answer: "Yes, we offer a 14-day free trial with full access to all features. No credit card required to get started."
              },
              {
                question: "How can I schedule a demo?",
                answer: "You can schedule a demo by filling out the contact form or by emailing us at demos@planify.com with your preferred date and time."
              },
              {
                question: "Are there any resources for learning how to use PlaniFy?",
                answer: "Yes, we provide comprehensive documentation, video tutorials, webinars, and a knowledge base to help you get the most out of PlaniFy."
              },
              {
                question: "What kind of support do you offer?",
                answer: "We offer email, chat, and phone support. Our standard plans include business hours support, while enterprise plans include 24/7 priority support."
              }
            ].map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="card bg-black/30 backdrop-blur-sm shadow-md hover:shadow-lg transition-all"
              >
                <div className="card-body">
                  <h3 className="card-title text-lg font-semibold">{faq.question}</h3>
                  <p className="text-white/80">{faq.answer}</p>
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
            <h2 className="text-4xl font-bold mb-6">Didn't find what you're looking for?</h2>
            <p className="text-xl text-white/80 mb-8">
              Our team is ready to answer any questions you may have about our platform, pricing, or how PlaniFy can help your team succeed.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/pricing" className="btn btn-primary btn-lg">
                View Pricing
              </Link>
              <a href="mailto:support@planify.com" className="btn btn-outline btn-lg">
                Email Support
              </a>
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

export default Contact;