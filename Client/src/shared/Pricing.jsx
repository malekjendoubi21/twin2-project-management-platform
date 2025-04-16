import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

const Pricing = () => {
  const [scrolled, setScrolled] = useState(false);
  const [billing, setBilling] = useState('monthly'); // 'monthly' or 'annual'
  const [hoveredPlan, setHoveredPlan] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(0);

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

  // Pricing plans data
  const plans = [
    {
      name: "Starter",
      description: "Perfect for individuals and small teams just getting started.",
      monthlyPrice: 9,
      annualPrice: 90,
      features: [
        "Up to 10 projects",
        "Basic task management",
        "1 GB storage",
        "Email support",
        "Limited integrations"
      ],
      cta: "Start Free Trial",
      color: "from-blue-500 to-blue-600",
      popular: false,
      highlight: "Great for individuals"
    },
    {
      name: "Pro",
      description: "Advanced features for growing teams with more complex needs.",
      monthlyPrice: 19,
      annualPrice: 190,
      features: [
        "Unlimited projects",
        "Advanced task management",
        "10 GB storage",
        "Priority email support",
        "Advanced integrations",
        "Timeline & Gantt views",
        "Team collaboration tools"
      ],
      cta: "Start Free Trial",
      color: "from-primary to-blue-600",
      popular: true,
      highlight: "Most Popular"
    },
    {
      name: "Enterprise",
      description: "Custom solutions for organizations with advanced requirements.",
      monthlyPrice: 49,
      annualPrice: 490,
      features: [
        "Unlimited everything",
        "100 GB storage",
        "24/7 phone & email support",
        "Custom integrations",
        "Advanced security",
        "Dedicated account manager",
        "SSO & SAML",
        "Custom onboarding"
      ],
      cta: "Contact Sales",
      color: "from-purple-500 to-pink-500",
      popular: false,
      highlight: "Includes enterprise features"
    }
  ];

  // Features comparison data
  const featureCategories = [
    {
      name: "Collaboration",
      features: [
        {
          name: "Team Members",
          starter: "Up to 3",
          pro: "Up to 15",
          enterprise: "Unlimited"
        },
        {
          name: "Project Sharing",
          starter: "Basic",
          pro: "Advanced",
          enterprise: "Enterprise-grade"
        },
        {
          name: "Real-time Collaboration",
          starter: "Limited",
          pro: "Full Access",
          enterprise: "Enhanced"
        },
        {
          name: "Guest Access",
          starter: false,
          pro: true,
          enterprise: true
        }
      ]
    },
    {
      name: "Features",
      features: [
        {
          name: "Task Management",
          starter: "Basic",
          pro: "Advanced",
          enterprise: "Custom"
        },
        {
          name: "Gantt Charts",
          starter: false,
          pro: true,
          enterprise: true
        },
        {
          name: "Time Tracking",
          starter: false,
          pro: true,
          enterprise: true
        },
        {
          name: "Custom Fields",
          starter: "Up to 3",
          pro: "Up to 15",
          enterprise: "Unlimited"
        },
        {
          name: "Templates",
          starter: "Basic",
          pro: "Advanced",
          enterprise: "Custom"
        }
      ]
    },
    {
      name: "Security",
      features: [
        {
          name: "Data Encryption",
          starter: "Standard",
          pro: "Enhanced",
          enterprise: "Military-grade"
        },
        {
          name: "SSO Integration",
          starter: false,
          pro: false,
          enterprise: true
        },
        {
          name: "Role-based Access",
          starter: "Basic",
          pro: "Advanced",
          enterprise: "Custom"
        },
        {
          name: "Audit Logs",
          starter: false,
          pro: "30 days",
          enterprise: "1 year"
        }
      ]
    }
  ];

  // FAQ data
  const faqs = [
    {
      question: "Can I change my plan later?",
      answer: "Yes, you can upgrade, downgrade, or cancel your plan at any time. If you upgrade, the new plan will take effect immediately. If you downgrade, the new plan will take effect at the end of your current billing period."
    },
    {
      question: "Is there a free trial?",
      answer: "Yes, we offer a 14-day free trial on all our plans. No credit card required. You can cancel at any time during the trial period."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for annual enterprise plans."
    },
    {
      question: "Do you offer discounts for non-profits or educational institutions?",
      answer: "Yes, we offer special pricing for non-profits, educational institutions, and open-source projects. Please contact our sales team for more information."
    },
    {
      question: "Can I get a refund if I'm not satisfied?",
      answer: "We offer a 30-day money-back guarantee. If you're not satisfied with our service within the first 30 days, contact our support team for a full refund."
    },
    {
      question: "How does the annual billing discount work?",
      answer: "When you choose annual billing, you save approximately 2 months' worth of subscription fees compared to monthly billing."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black font-poppins overflow-x-hidden">
      {/* Navigation Bar - Same structure as other pages */}
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
                  className={`text-white/80 hover:text-primary transition-colors relative group ${item === "Pricing" ? "text-primary" : ""}`}
                >
                  {item}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300 ${item === "Pricing" ? "w-full" : "w-0 group-hover:w-full"}`}></span>
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
              <span className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">Simple Pricing</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-4xl md:text-6xl font-bold mb-6"
            >
              Plans for teams of
              <span className="relative ml-2 inline-block">
                all sizes
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
              className="text-xl leading-relaxed text-white/80 mb-12 max-w-3xl mx-auto"
            >
              Choose the perfect plan to help your team collaborate efficiently, manage projects seamlessly, and deliver exceptional results.
            </motion.p>
            
            {/* Billing Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="inline-flex items-center bg-black/20 p-1 rounded-full backdrop-blur-sm border border-white/10 mb-10"
            >
              <button
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${billing === 'monthly' ? 'bg-primary text-white shadow-lg' : 'text-white/70 hover:text-white'}`}
                onClick={() => setBilling('monthly')}
              >
                Monthly
              </button>
              <button
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${billing === 'annual' ? 'bg-primary text-white shadow-lg' : 'text-white/70 hover:text-white'}`}
                onClick={() => setBilling('annual')}
              >
                Annual <span className="text-xs opacity-80">Save 16%</span>
              </button>

            </motion.div>
            
          </div>
        </motion.div>
        
      </section>

      {/* Pricing Cards Section */}
      <section className="py-10 relative">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans.map((plan, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="relative"
                onMouseEnter={() => setHoveredPlan(idx)}
                onMouseLeave={() => setHoveredPlan(null)}
              >
                {/* Popular badge */}

                
                <motion.div
                  whileHover={{ y: -10 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className={`card h-full bg-black/40 backdrop-blur-sm border ${hoveredPlan === idx ? 'border-primary/50' : 'border-white/10'} rounded-2xl overflow-hidden transition-all duration-300 shadow-xl`}
                  style={{ 
                    boxShadow: hoveredPlan === idx ? `0 0 30px -5px rgba(96, 165, 250, 0.3)` : ''
                  }}
                >
                  <div className="card-body p-8">
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                      <p className="text-white/70 text-sm">{plan.description}</p>
                    </div>
                    
                    <div className="mb-6">
                      <div className="flex items-end">
                        <span className="text-4xl font-bold">
                          ${billing === 'monthly' ? plan.monthlyPrice : plan.annualPrice}
                        </span>
                        <span className="text-white/70 ml-2">
                          /{billing === 'monthly' ? 'month' : 'year'}
                        </span>
                      </div>
                      <div className="text-white/60 text-sm mt-1">
                        {billing === 'annual' ? `$${plan.monthlyPrice}/mo when billed annually` : ''}
                      </div>
                    </div>
                    
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full mb-8 bg-gradient-to-r ${plan.color} rounded-lg overflow-hidden`}
                    >
                      <Link to={plan.name === "Enterprise" ? "/contact" : "/register"} className="btn btn-lg w-full border-0 bg-transparent hover:bg-white/10">
                        {plan.cta}
                      </Link>
                    </motion.div>
                    
                    <div className="text-sm text-white/80 mb-2 font-medium">{plan.highlight}</div>
                    
                    <div className="space-y-3 mt-6">
                      {plan.features.map((feature, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.8 + (i * 0.1), duration: 0.4 }}
                          className="flex items-center"
                        >
                          <svg className="w-5 h-5 text-primary mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          <span>{feature}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-full h-1/3 bg-gradient-to-b from-black to-transparent"></div>
          <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-black to-transparent"></div>
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
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Feature <span className="text-primary">Comparison</span></h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Compare our plans to find the perfect fit for your team's needs.
            </p>
          </motion.div>
          
          {/* Category tabs */}
          <div className="flex justify-center gap-4 mb-12 overflow-x-auto">
            {featureCategories.map((category, idx) => (
              <motion.button
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedFeature(idx)}
                className={`px-6 py-3 rounded-lg text-lg font-medium transition-all duration-300 ${selectedFeature === idx ? 'bg-primary/20 text-primary' : 'text-white/60 hover:text-white/90'}`}
              >
                {category.name}
              </motion.button>
            ))}
          </div>
          
          {/* Features table */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="overflow-x-auto"
          >
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left pb-6 pl-4 w-1/4">Feature</th>
                  <th className="text-center pb-6 px-4 w-1/4">
                    <div className="text-lg font-bold">{plans[0].name}</div>
                    <div className="text-white/60">${plans[0].monthlyPrice}/mo</div>
                  </th>
                  <th className="text-center pb-6 px-4 w-1/4">
                    <div className="text-lg font-bold text-primary">{plans[1].name}</div>
                    <div className="text-white/60">${plans[1].monthlyPrice}/mo</div>
                  </th>
                  <th className="text-center pb-6 px-4 w-1/4">
                    <div className="text-lg font-bold">{plans[2].name}</div>
                    <div className="text-white/60">${plans[2].monthlyPrice}/mo</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedFeature}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    {featureCategories[selectedFeature].features.map((feature, idx) => (
                      <motion.tr 
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: idx * 0.05 }}
                        className={`${idx % 2 === 0 ? 'bg-white/5' : 'bg-transparent'} transition-colors hover:bg-white/10`}
                      >
                        <td className="p-4 text-left border-t border-white/10">{feature.name}</td>
                        <td className="p-4 text-center border-t border-white/10">
                          {feature.starter === true ? (
                            <svg className="w-5 h-5 text-primary mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                          ) : feature.starter === false ? (
                            <svg className="w-5 h-5 text-white/30 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                          ) : (
                            <span className="text-white/80">{feature.starter}</span>
                          )}
                        </td>
                        <td className="p-4 text-center border-t border-white/10 bg-primary/5">
                          {feature.pro === true ? (
                            <svg className="w-5 h-5 text-primary mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                          ) : feature.pro === false ? (
                            <svg className="w-5 h-5 text-white/30 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                          ) : (
                            <span className="text-white/80">{feature.pro}</span>
                          )}
                        </td>
                        <td className="p-4 text-center border-t border-white/10">
                          {feature.enterprise === true ? (
                            <svg className="w-5 h-5 text-primary mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                          ) : feature.enterprise === false ? (
                            <svg className="w-5 h-5 text-white/30 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                          ) : (
                            <span className="text-white/80">{feature.enterprise}</span>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* Enterprise Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="p-10 md:p-12">
                <div className="flex items-center gap-2 mb-6">
                  <div className="h-10 w-1 bg-primary rounded-full"></div>
                  <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                    Enterprise Solution
                  </h2>
                </div>
                
                <p className="text-xl text-white/80 mb-8">
                  Need a custom solution for your organization? Our enterprise plan offers enhanced security, dedicated support, and tailored features to meet your specific requirements.
                </p>
                
                <div className="space-y-4 mb-8">
                  {[
                    "Custom onboarding and implementation",
                    "Dedicated account manager",
                    "Custom integrations and API access",
                    "Advanced security and compliance features",
                    "24/7 priority support"
                  ].map((feature, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + (idx * 0.1), duration: 0.4 }}
                      className="flex items-center"
                    >
                      <svg className="w-5 h-5 text-primary mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>{feature}</span>
                    </motion.div>
                  ))}
                </div>
                
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link to="/contact" className="btn btn-primary btn-lg px-8">
                    Contact Sales
                  </Link>
                </motion.div>
              </div>
              
              <div className="relative h-full">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-transparent md:from-transparent md:to-gray-900 z-10"></div>
                <img 
                  src="https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80" 
                  alt="Enterprise collaboration" 
                  className="h-full w-full object-cover"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="absolute left-8 bottom-8 bg-primary/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 z-20 max-w-xs"
                >
                  <div className="text-center">
                    <div className="text-xl font-bold mb-1">500+</div>
                    <div className="text-sm text-white/90">Enterprise customers trust PlaniFy</div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
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
            <h2 className="text-4xl font-bold mb-4">Frequently Asked <span className="text-primary">Questions</span></h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Still have questions? Here are the most common questions we get asked.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {faqs.map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="card bg-black/30 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all border border-white/10"
              >
                <div className="card-body p-8">
                  <h3 className="text-xl font-bold mb-3">{faq.question}</h3>
                  <p className="text-white/80">{faq.answer}</p>
                </div>
              </motion.div>
            ))}
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mt-12"
          >
            <p className="text-white/80 mb-4">Still have questions?</p>
            <Link to="/contact" className="btn btn-outline btn-lg">
              Contact Our Support Team
            </Link>
          </motion.div>
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
              Start your 14-day free trial today. No credit card required, cancel anytime.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link to="/register" className="btn btn-primary btn-lg">
                  Start Your Free Trial
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link to="/contact" className="btn btn-outline btn-lg">
                  Talk to Sales
                </Link>
              </motion.div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-8 text-white/60 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
                <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.75.75 0 00.674 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08zm3.094 8.016a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
              </svg>
              <span>100% secure payment</span>
            </motion.div>
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

export default Pricing;