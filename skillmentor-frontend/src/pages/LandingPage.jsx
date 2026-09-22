import React, { useState, useEffect } from 'react';
import '../styles/LandingPage.css';
import { 
  BookOpen, 
  Target, 
  ListChecks, 
  Users, 
  Brain, 
  Award,
  Sparkles,
  CheckCircle2,
  Lock,
  Play,
  Star,
  Mail,
  ArrowRight,
  Github,
  Linkedin,
  Twitter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.05
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

const LandingPage = () => {
  const [loading, setLoading] = useState(true);

  // Interactive Roadmap Demo State
  const [xp, setXp] = useState(620);
  const [level, setLevel] = useState(1);
  const [completedNodes, setCompletedNodes] = useState([1, 2]);
  const [unlockedNodes, setUnlockedNodes] = useState([3]);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [ctaEmail, setCtaEmail] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [ctaSuccess, setCtaSuccess] = useState(false);
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const demoNodes = [
    { id: 1, title: 'HTML & CSS Basics', xp: 100, type: 'Core Foundations' },
    { id: 2, title: 'JavaScript Fundamentals', xp: 150, type: 'Core Foundations' },
    { id: 3, title: 'React Components & Hooks', xp: 200, type: 'Interactive UI' },
    { id: 4, title: 'State Management (Redux/Zustand)', xp: 250, type: 'Advanced concepts' },
    { id: 5, title: 'Next.js & Full-stack Deployments', xp: 300, type: 'Deployment' }
  ];

  const handleNodeClick = (nodeId, nodeXp) => {
    if (completedNodes.includes(nodeId)) return;
    if (!unlockedNodes.includes(nodeId)) return; // Locked

    // Mark as completed
    const newCompleted = [...completedNodes, nodeId];
    setCompletedNodes(newCompleted);

    // Calculate new XP
    const newXp = xp + nodeXp;
    setXp(newXp);

    // Unlock next node
    const nextNode = demoNodes.find(n => n.id === nodeId + 1);
    if (nextNode) {
      setUnlockedNodes([...unlockedNodes, nextNode.id]);
    }

    // Level up check (level up at 800 XP)
    if (newXp >= 800 && level === 1) {
      setLevel(2);
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 4000);
    }
  };

  const handleCtaSubmit = (e) => {
    e.preventDefault();
    if (!ctaEmail) return;
    setCtaSuccess(true);
    setTimeout(() => {
      window.location.href = `/register?email=${encodeURIComponent(ctaEmail)}`;
    }, 1500);
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterSuccess(true);
    setNewsletterEmail('');
    setTimeout(() => setNewsletterSuccess(false), 3000);
  };

  const features = [
    {
      type: 'tall',
      icon: <Brain className="text-[#8C49E9]" />,
      title: 'AI-Powered Roadmaps',
      description: 'Get personalized career paths tailored dynamically to your specific goals, pace, and background.',
      tags: ['AI Powered', 'Career Paths'],
    },
    {
      type: 'wide',
      icon: <BookOpen className="text-[#8C49E9]" />,
      title: 'Interactive Learning',
      description: 'Engage with hands-on tasks and browser-based coding sandboxes that give you instant validation.',
      tags: ['Interactive Sandbox', 'Live Code'],
    },
    {
      type: 'normal',
      icon: <Target className="text-[#8C49E9]" />,
      title: 'Progress Tracking',
      description: 'Earn XP, unlock achievement badges, and level up as you hit learning milestones.',
      tags: ['XP & Levels', 'Badges'],
    },
    {
      type: 'tablet-wide',
      icon: <ListChecks className="text-[#8C49E9]" />,
      title: 'Expert Mentorship',
      description: 'Receive detailed code reviews and feedback from verified senior industry engineers.',
      tags: ['1-on-1 Reviews', 'Industry Pros'],
    },
  ];

  return (
    <>
      <div className="w-full min-h-screen bg-black text-white overflow-x-hidden">
        {loading && (
          <div className="loader-container flex flex-col items-center justify-center bg-black h-screen">
            <h1 className="loader-text font-bold text-6xl w-fit mb-6 animate-scaleIn">
              <span className="text-white">SKILL</span>
              <span className="text-[#8C49E9]">MENTOR</span>
            </h1>

            {/* Progress Bar */}
            <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-[#8C49E9] progress-bar"></div>
            </div>
          </div>
        )}

        <div className={`main-content ${loading ? 'opacity-0' : 'opacity-100 fade-in relative'}`}>
          <nav className="w-full flex items-center justify-between px-12 py-4 fixed top-0 left-0 z-20 backdrop-blur-md bg-black/30">
            <h1 className="font-bold text-lg">
              <span className="text-white">SKILL</span>
              <span className="text-[#8C49E9]">MENTOR</span>
            </h1>

            <div className="flex gap-6 font-semibold text-lg text-white">
              <a href="#about" className="hover:text-[#8C49E9] transition hover:scale-105">About</a>
              <a href="#howitworks" className="hover:text-[#8C49E9] transition hover:scale-105">How it works</a>
              <a href="#features" className="hover:text-[#8C49E9] transition hover:scale-105">Features</a>
            </div>

            <div className="flex gap-4">
              <a href="/login" className="px-5 py-2 rounded-full border border-gray-600 hover:bg-gray-600 hover:text-gray-100 transition hover:scale-105">
                Login
              </a>
              <a href="/register" className="px-5 py-2 rounded-full bg-[#8C49E9] text-gray-100 hover:bg-[#7a3cd1] transition hover:scale-105">
                Register
              </a>
            </div>
          </nav>

          <section className="heroSection h-screen flex flex-col items-center justify-center gap-8 px-6 md:px-12 relative overflow-hidden pt-12">
            <div className="absolute inset-0 z-[-1]">
              <iframe src='https://my.spline.design/wwdc24landingpagedesign-eA3KWexU2KYg5noEFUuaOvl3/' frameborder='0' width='100%' height='100%' className="absolute top-0 left-0 w-full h-full z-[-1]" ></iframe>
            </div>

            <h1 className="text-4xl md:text-7xl lg:text-[12rem] font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-[#8C49E9] to-[#ffffff] z-10 animate-slideUp drop-shadow-lg mt-20 mix-blend-screen">
              Skill Mentor
            </h1>
            <p className="text-center max-w-4xl text-gray-300 text-lg md:text-2xl font-light z-10 animate-slideUp delay-200 drop-shadow-md">
              Transform your career journey with our AI-driven platform that guides you from where you are to where you aspire to be, with personalized learning and mentorship.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 z-10 animate-slideUp delay-400">
              <a href="/register" className="px-8 py-3 rounded-full bg-[#8C49E9] text-white font-semibold hover:bg-[#7a3cd1] transition hover:scale-105 shadow-lg hover:shadow-[#8C49E9]/50">
                Get Started for Free
              </a>
              <a href="#about" className="px-8 py-3 rounded-full border border-[#8C49E9] text-[#8C49E9] font-semibold hover:bg-[#8C49E9]/10 transition hover:scale-105">
                Learn More
              </a>
            </div>
          </section>

          {/* Features Section */}
          <section className="features py-24 px-6 md:px-12 relative" id="features">
            <div className="content flex flex-col items-center justify-center gap-8">
              <motion.h2
                initial={{ opacity: 0, y: -30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center text-4xl md:text-5xl font-bold text-white"
              >
                From Dream to Destination — <span className="text-[#8C49E9]">Your Career Map</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-center max-w-4xl text-gray-300 text-lg md:text-xl font-light drop-shadow-md"
              >
                Transform your career journey with our AI-driven platform that guides you from where you are to where you aspire to be.
              </motion.p>
            </div>

            <div className="relative max-w-7xl mx-auto py-16">
              {/* Abstract Glow Background */}
              <div className="absolute inset-0 -z-20">
                <div className="absolute w-[400px] h-[400px] bg-purple-500/15 blur-[120px] top-[-100px] left-[-50px]" />
                <div className="absolute w-[300px] h-[300px] bg-blue-500/15 blur-[120px] bottom-[-50px] right-[-50px]" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative">
                {features.map((feature, i) => {
                  const spanClass =
                    feature.type === "tall"
                      ? "sm:row-span-2 lg:row-span-2"
                      : feature.type === "wide"
                        ? "lg:col-span-2"
                        : feature.type === "tablet-wide"
                          ? "sm:col-span-2 lg:col-span-1"
                          : "";

                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: i * 0.15,
                        duration: 0.6,
                        type: "spring",
                        stiffness: 100
                      }}
                      viewport={{ once: true }}
                      whileHover={{
                        scale: 1.02,
                        y: -4,
                        transition: { duration: 0.25 }
                      }}
                      className={`${spanClass} p-8 rounded-2xl bg-gradient-to-br from-zinc-900/50 via-zinc-950/70 to-black border border-zinc-800/80 shadow-2xl hover:border-purple-500/40 hover:shadow-purple-500/10 flex flex-col justify-between relative overflow-hidden cursor-pointer group`}
                      role="button"
                      tabIndex={0}
                      aria-label={`Learn more about ${feature.title}`}
                    >
                      {/* Card Glow */}
                      <div className="absolute inset-0 -z-10">
                        <div className="absolute w-full h-full bg-gradient-to-tr from-[#8C49E9]/10 to-transparent blur-[60px] opacity-30 group-hover:opacity-60 transition-all duration-300" />
                      </div>

                      <div>
                        {/* Icon */}
                        <motion.div
                          className="flex items-center justify-center w-14 h-14 rounded-xl bg-purple-500/10 border border-purple-500/20 text-3xl text-[#8C49E9] mb-6 shadow-inner group-hover:bg-[#8C49E9]/20 group-hover:border-[#8C49E9]/40 transition-colors"
                          whileHover={{ scale: 1.1, rotate: 3 }}
                        >
                          {feature.icon}
                        </motion.div>

                        {/* Title & Description */}
                        <h3 className="text-xl font-bold text-white mb-3 leading-tight group-hover:text-purple-300 transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-gray-400 leading-relaxed mb-6">
                          {feature.description}
                        </p>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mt-auto">
                        {feature.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-zinc-900/80 border border-zinc-800 rounded-full px-3 py-1 text-gray-400 group-hover:border-purple-500/20 group-hover:text-purple-300 transition-colors"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Corner indicator */}
                      <div className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-[#8C49E9] to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* About Section */}
          <section className="py-24 px-6 md:px-12 relative overflow-hidden bg-zinc-950/40 border-t border-zinc-900" id="about">
            <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Left Column: Stats & Pitch */}
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="space-y-8"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[#8C49E9] text-sm font-medium">
                  <Sparkles className="w-4 h-4" /> Why SkillMentor
                </div>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                  Bridge the gap between <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8C49E9] to-blue-400">
                    learning & employability
                  </span>
                </h2>
                <p className="text-gray-400 text-lg leading-relaxed">
                  Traditional online courses leave you with video fatigue and no clear path forward. SkillMentor combines state-of-the-art AI roadmap personalization with real-world project verification and peer/expert mentorship. We don't just teach you; we guide you to your next career breakthrough.
                </p>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-6 pt-6 border-t border-zinc-800">
                  <div>
                    <h4 className="text-3xl md:text-4xl font-extrabold text-white">10K+</h4>
                    <p className="text-sm text-gray-500 mt-1">Students Guided</p>
                  </div>
                  <div>
                    <h4 className="text-3xl md:text-4xl font-extrabold text-white">94%</h4>
                    <p className="text-sm text-gray-500 mt-1">Goal Completion</p>
                  </div>
                  <div>
                    <h4 className="text-3xl md:text-4xl font-extrabold text-white">500+</h4>
                    <p className="text-sm text-gray-500 mt-1">Verified Mentors</p>
                  </div>
                </div>
              </motion.div>

              {/* Right Column: Comparative Card */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="p-8 rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-xl relative overflow-hidden group">
                  <h3 className="text-xl font-bold text-white mb-6">A Smarter Approach to Learning</h3>
                  
                  <div className="space-y-6">
                    <div className="flex gap-4 p-4 rounded-xl bg-red-950/10 border border-red-500/10">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 font-bold">✕</div>
                      <div>
                        <h4 className="font-semibold text-white">Traditional Courses</h4>
                        <p className="text-xs text-gray-405 mt-1">One-size-fits-all videos, zero personalization, high drop-out rates, and theoretical assignments without actual feedback.</p>
                      </div>
                    </div>

                    <div className="flex gap-4 p-4 rounded-xl bg-purple-950/20 border border-[#8C49E9]/20 relative">
                      <div className="absolute -inset-px rounded-xl bg-gradient-to-tr from-[#8C49E9]/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#8C49E9]/20 flex items-center justify-center text-[#8C49E9] font-bold text-sm">✓</div>
                      <div>
                        <h4 className="font-semibold text-white">SkillMentor Way</h4>
                        <p className="text-xs text-gray-300 mt-1">Dynamic AI roadmaps adjusting to your speed, hands-on tasks, real expert mentorship, and tangible rewards (XP/badges).</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* How It Works Section */}
          <section className="py-24 px-6 md:px-12 relative overflow-hidden bg-black border-t border-zinc-900" id="howitworks">
            {/* Abstract Glow Background */}
            <div className="absolute inset-0 -z-20">
              <div className="absolute w-[400px] h-[400px] bg-purple-500/10 blur-[120px] top-[-100px] left-[-50px] pointer-events-none" />
              <div className="absolute w-[300px] h-[300px] bg-blue-500/10 blur-[120px] bottom-[-50px] right-[-50px] pointer-events-none" />
            </div>

            <div className="max-w-7xl mx-auto flex flex-col items-center justify-center gap-12">
              <div className="content flex flex-col items-center justify-center gap-4">
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8C49E9]/10 border border-[#8C49E9]/20 text-[#8C49E9] text-sm font-medium"
                >
                  <Target className="w-4 h-4" /> Step-by-Step Guide
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: -20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  viewport={{ once: true }}
                  className="text-center text-4xl md:text-5xl font-extrabold text-white tracking-tight"
                >
                  How SkillMentor <span className="text-[#8C49E9]">Works</span>
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="text-center max-w-4xl text-gray-300 text-lg md:text-xl font-light drop-shadow-md"
                >
                  We've broken down career progression into a simple, automated, and human-verified journey.
                </motion.p>
              </div>

              {/* Timeline Steps */}
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full mt-8"
              >
                {[
                  {
                    step: "01",
                    title: "Define Your Goal",
                    icon: <Target className="w-5 h-5 text-[#8C49E9]" />,
                    description: "Select your target career or target skill. Specify your background and learning pace.",
                    badgeColor: "bg-[#8C49E9]/10 border-[#8C49E9]/20 text-[#8C49E9]"
                  },
                  {
                    step: "02",
                    title: "Get Custom Roadmap",
                    icon: <Brain className="w-5 h-5 text-blue-400" />,
                    description: "Our AI generates a structured curriculum complete with task-oriented learning modules.",
                    badgeColor: "bg-blue-500/10 border-blue-500/20 text-blue-400"
                  },
                  {
                    step: "03",
                    title: "Build Real Projects",
                    icon: <Play className="w-5 h-5 text-pink-400 fill-pink-400/20" />,
                    description: "Write live code in sandbox environments and submit projects to build a real portfolio.",
                    badgeColor: "bg-pink-500/10 border-pink-500/20 text-pink-400"
                  },
                  {
                    step: "04",
                    title: "Get Mentor Checks",
                    icon: <ListChecks className="w-5 h-5 text-emerald-400" />,
                    description: "Have your work verified by industry professionals who provide expert feedback.",
                    badgeColor: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  }
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    variants={cardVariants}
                    whileHover={{
                      scale: 1.02,
                      y: -4,
                      transition: { duration: 0.25 }
                    }}
                    className="p-[1px] rounded-2xl bg-zinc-800/80 hover:bg-gradient-to-r hover:from-purple-500 hover:via-blue-500 hover:to-emerald-500 transition-all duration-500 group cursor-pointer"
                  >
                    <div className="bg-zinc-950/95 rounded-[15px] p-8 h-full flex flex-col justify-between relative overflow-hidden">
                      {/* Card Glow */}
                      <div className="absolute inset-0 -z-10">
                        <div className="absolute w-full h-full bg-gradient-to-tr from-[#8C49E9]/5 to-transparent blur-[60px] opacity-30 group-hover:opacity-60 transition-all duration-300" />
                      </div>

                      <div>
                        {/* Header Badge */}
                        <div className="flex items-center justify-between mb-6">
                          <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full border font-bold text-sm transition-colors duration-300 ${item.badgeColor}`}>
                            {item.step}
                          </span>
                          <div className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-800/80 group-hover:border-zinc-700 transition-colors">
                            {item.icon}
                          </div>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors leading-tight">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-400 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Corner indicator */}
                      <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-gradient-to-tr from-[#8C49E9] to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* Interactive Roadmap Demo Section */}
          <section className="py-24 px-6 md:px-12 relative overflow-hidden bg-zinc-950/40 border-t border-zinc-900">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[600px] h-[400px] bg-purple-500/5 rounded-full blur-[140px] pointer-events-none" />
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Demo Pitch */}
              <div className="lg:col-span-5 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8C49E9]/10 border border-[#8C49E9]/20 text-[#8C49E9] text-sm font-medium">
                  <Brain className="w-4 h-4" /> Live Interactive Demo
                </div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight">
                  Try completing a learning node
                </h2>
                <p className="text-gray-400 leading-relaxed text-sm md:text-base">
                  Interactive node-based maps visually display your career progression. Complete tasks, earn XP, and unlock next skills in real-time. 
                </p>
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 flex gap-3 items-start">
                  <Sparkles className="w-5 h-5 text-[#8C49E9] flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-purple-200 leading-relaxed">
                    <strong>Action:</strong> Click on the <span className="underline decoration-wavy">React Components & Hooks</span> node in the demo to submit your mock code task and see how the level system handles progression.
                  </p>
                </div>
              </div>

              {/* Mock Dashboard & Tree Card */}
              <div className="lg:col-span-7 relative">
                
                {/* Level Up Notification Modal */}
                <AnimatePresence>
                  {showLevelUp && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, y: -20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: -20 }}
                      className="absolute inset-x-0 top-1/4 mx-auto w-64 z-30 p-6 rounded-2xl bg-zinc-900 border border-yellow-500/40 shadow-2xl flex flex-col items-center justify-center text-center backdrop-blur-xl"
                    >
                      <Award className="w-12 h-12 text-yellow-400 mb-2 animate-bounce" />
                      <h4 className="text-lg font-bold text-white">LEVEL UP!</h4>
                      <p className="text-xs text-yellow-400 font-semibold mb-2">Level 2 React Developer</p>
                      <p className="text-xs text-gray-400">You earned +200 XP and unlocked State Management!</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="p-6 md:p-8 rounded-2xl bg-zinc-900/80 border border-zinc-800 backdrop-blur-xl shadow-2xl relative">
                  
                  {/* Fake Dashboard Header */}
                  <div className="flex items-center justify-between pb-6 border-b border-zinc-800 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#8C49E9] to-blue-500 flex items-center justify-center text-sm font-bold text-white">
                        GL
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">Guest Learner</h4>
                        <p className="text-xs text-[#8C49E9] font-medium">Level {level} Aspiring React dev</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-gray-400">Total XP: </span>
                      <span className="text-xs font-bold text-[#8C49E9]">{xp} / 1200</span>
                      {/* Progress bar */}
                      <div className="w-28 h-1.5 bg-zinc-800 rounded-full overflow-hidden mt-1">
                        <div 
                          className="h-full bg-[#8C49E9] transition-all duration-500" 
                          style={{ width: `${(xp / 1200) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Node Tree */}
                  <div className="space-y-4 relative">
                    {/* Vertical connecting line */}
                    <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-zinc-800 -z-10" />

                    {demoNodes.map((node) => {
                      const isCompleted = completedNodes.includes(node.id);
                      const isUnlocked = unlockedNodes.includes(node.id);
                      const isActive = isUnlocked && !isCompleted;
                      
                      return (
                        <div 
                          key={node.id}
                          onClick={() => handleNodeClick(node.id, node.xp)}
                          className={`flex items-center gap-4 p-3.5 rounded-xl border transition-all duration-300 select-none ${
                            isCompleted 
                              ? 'bg-purple-950/10 border-[#8C49E9]/40 cursor-default' 
                              : isActive 
                                ? 'bg-zinc-850 border-purple-500/50 cursor-pointer hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/10 hover:scale-[1.01] animate-pulse'
                                : 'bg-zinc-950/40 border-zinc-900 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          {/* Left node icon */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
                            isCompleted 
                              ? 'bg-[#8C49E9] text-white' 
                              : isActive 
                                ? 'bg-purple-500/20 text-[#8C49E9] border border-purple-500/40' 
                                : 'bg-zinc-800 text-zinc-600'
                          }`}>
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : !isUnlocked ? (
                              <Lock className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4 fill-current" />
                            )}
                          </div>

                          {/* Node Content */}
                          <div className="flex-grow">
                            <div className="flex items-center justify-between">
                              <h5 className={`text-sm font-semibold transition-colors duration-300 ${
                                isCompleted ? 'text-white/90 line-through' : isActive ? 'text-white' : 'text-zinc-500'
                              }`}>
                                {node.title}
                              </h5>
                              <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold bg-zinc-800/40 px-2 py-0.5 rounded">
                                {node.type}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-500 mt-0.5">
                              {isCompleted ? 'Module Completed' : isActive ? 'Click to complete task & earn XP' : 'Locked — Complete prior node'}
                            </p>
                          </div>

                          {/* XP tag */}
                          <div className={`text-xs font-bold ${isCompleted ? 'text-purple-400' : isActive ? 'text-[#8C49E9]' : 'text-zinc-600'}`}>
                            +{node.xp} XP
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Mentor Spotlight & Testimonials Section */}
          <section className="py-24 px-6 md:px-12 relative overflow-hidden bg-black border-t border-zinc-900">
            {/* Abstract Glow Background */}
            <div className="absolute inset-0 -z-20">
              <div className="absolute w-[300px] h-[300px] bg-blue-500/10 blur-[120px] top-[-50px] left-[-30px] pointer-events-none" />
              <div className="absolute w-[400px] h-[400px] bg-purple-500/10 blur-[120px] bottom-[-100px] right-[-50px] pointer-events-none" />
            </div>

            <div className="max-w-7xl mx-auto flex flex-col items-center justify-center gap-16">
              <div className="content flex flex-col items-center justify-center gap-4">
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium"
                >
                  <Users className="w-4 h-4" /> Global Community
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: -20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  viewport={{ once: true }}
                  className="text-center text-4xl md:text-5xl font-extrabold text-white tracking-tight"
                >
                  Guided by <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8C49E9] to-blue-400">industry specialists</span>
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="text-center max-w-4xl text-gray-300 text-lg md:text-xl font-light drop-shadow-md"
                >
                  Interact with real mentors from the world's leading technology and design companies.
                </motion.p>
              </div>
              {/* Mentor Grid */}
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full"
              >
                {[
                  {
                    name: "Sarah Lin",
                    company: "Google",
                    companyColor: "bg-purple-500/10 border-purple-500/20 text-purple-400",
                    role: "Staff Engineer",
                    feedback: "I love reviewing roadmaps on SkillMentor. The AI does the heavy lifting of curriculum design, so I can focus on high-impact code reviews.",
                    skills: ["React", "System Design", "Node.js"],
                    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&auto=format&fit=crop"
                  },
                  {
                    name: "Alex Rivera",
                    company: "Meta",
                    companyColor: "bg-blue-500/10 border-blue-500/20 text-blue-400",
                    role: "Senior Frontend Engineer",
                    feedback: "I was stuck in tutorial hell for a year. SkillMentor's personalized roadmap forced me to build, and my mentor's mock interview prep got me hired.",
                    skills: ["JavaScript", "React", "State Mgmt"],
                    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=300&auto=format&fit=crop"
                  },
                  {
                    name: "Jessica Chen",
                    company: "Airbnb",
                    companyColor: "bg-rose-500/10 border-rose-500/20 text-rose-400",
                    role: "Lead Product Designer",
                    feedback: "Seeing students progress from design basics to high-fidelity interactive prototypes is incredibly rewarding. The platform makes mentoring seamless.",
                    skills: ["UI/UX", "Figma", "Design Systems"],
                    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=300&auto=format&fit=crop"
                  }
                ].map((mentor, idx) => (
                  <motion.div
                    key={idx}
                    variants={cardVariants}
                    whileHover={{
                      scale: 1.02,
                      y: -4,
                      transition: { duration: 0.25 }
                    }}
                    className="p-[1px] rounded-2xl bg-zinc-800/80 hover:bg-gradient-to-r hover:from-purple-500 hover:via-blue-500 hover:to-emerald-500 transition-all duration-500 group cursor-pointer"
                  >
                    <div className="bg-zinc-950/95 rounded-[15px] p-8 h-full flex flex-col justify-between relative overflow-hidden">
                      {/* Card Glow */}
                      <div className="absolute inset-0 -z-10">
                        <div className="absolute w-full h-full bg-gradient-to-tr from-[#8C49E9]/10 to-transparent blur-[60px] opacity-30 group-hover:opacity-60 transition-all duration-300" />
                      </div>

                      <div>
                        {/* Stars */}
                        <div className="flex gap-1 mb-6">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                          ))}
                        </div>

                        <p className="text-gray-300 text-sm italic leading-relaxed mb-8">
                          "{mentor.feedback}"
                        </p>
                      </div>

                      <div className="flex items-center gap-4 pt-6 border-t border-zinc-800/80 mt-auto">
                        <img 
                          src={mentor.image} 
                          alt={mentor.name} 
                          className="w-12 h-12 rounded-full object-cover border border-[#8C49E9]/45 group-hover:border-[#8C49E9] transition-colors"
                        />
                        <div>
                          <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">{mentor.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-gray-500 font-medium">{mentor.role}</p>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${mentor.companyColor}`}>
                              {mentor.company}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {mentor.skills.map((skill, sIdx) => (
                              <span key={sIdx} className="text-[10px] bg-zinc-900/80 border border-zinc-800 rounded px-2 py-0.5 text-gray-400 group-hover:border-purple-500/20 group-hover:text-purple-300 transition-colors">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Corner indicator */}
                      <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-gradient-to-tr from-purple-500 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* Final CTA Section */}
          <section className="py-24 px-6 md:px-12 relative overflow-hidden bg-black border-t border-zinc-900">
            {/* Ambient Background Glows */}
            <div className="absolute inset-0 -z-20">
              <div className="absolute w-[600px] h-[600px] bg-purple-500/10 blur-[150px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
              <div className="absolute w-[400px] h-[400px] bg-blue-500/10 blur-[130px] top-1/3 left-1/3 pointer-events-none" />
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                viewport={{ once: true }}
                className="p-[1px] rounded-3xl bg-zinc-800/80 hover:bg-gradient-to-r hover:from-purple-500 hover:via-blue-500 hover:to-emerald-500 transition-all duration-700 shadow-2xl"
              >
                <div className="relative p-8 md:p-20 rounded-[23px] bg-zinc-950/90 backdrop-blur-2xl flex flex-col items-center justify-center text-center gap-8 overflow-hidden group">
                  
                  {/* Subtle Tech Grid Overlay */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
                  
                  {/* Internal Radial Glow */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(140,73,233,0.08)_0%,transparent_70%)] pointer-events-none" />

                  {/* Badge Capsule */}
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[#8C49E9] text-xs font-semibold uppercase tracking-wider shadow-inner"
                  >
                    <Award className="w-3.5 h-3.5" /> Start Your Journey
                  </motion.div>

                  {/* Heading */}
                  <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-none text-white max-w-3xl">
                    Take control of your <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-300 to-[#8C49E9]">
                      learning path today
                    </span>
                  </h2>

                  <p className="text-gray-400 text-base md:text-xl max-w-2xl font-light leading-relaxed">
                    Get personalized AI roadmaps, complete hands-on projects, and receive code endorsements from industry professionals.
                  </p>

                  {/* Form Container with Switch Animations */}
                  <div className="w-full max-w-lg mt-4 z-10">
                    <AnimatePresence mode="wait">
                      {ctaSuccess ? (
                        <motion.div 
                          key="success"
                          initial={{ opacity: 0, scale: 0.9, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: -10 }}
                          transition={{ type: "spring", stiffness: 200, damping: 15 }}
                          className="p-6 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-200 text-sm font-semibold flex flex-col items-center justify-center gap-3 backdrop-blur-md"
                        >
                          <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
                          <span>Preparing your custom workspace... Redirecting!</span>
                        </motion.div>
                      ) : (
                        <motion.form 
                          key="form"
                          onSubmit={handleCtaSubmit}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex flex-col sm:flex-row gap-3 w-full p-2 bg-zinc-900/60 border border-zinc-800 rounded-2xl focus-within:border-purple-500/50 transition-all duration-300 backdrop-blur-md"
                        >
                          <div className="relative flex-grow flex items-center">
                            <Mail className="absolute left-4 text-gray-500 w-5 h-5" />
                            <input 
                              type="email" 
                              required
                              value={ctaEmail}
                              onChange={(e) => setCtaEmail(e.target.value)}
                              placeholder="Enter your email address" 
                              className="w-full pl-12 pr-4 py-3.5 bg-transparent border-0 outline-none text-white placeholder-gray-500 text-sm focus:ring-0 focus:outline-none"
                            />
                          </div>
                          <motion.button 
                            type="submit" 
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-8 py-3.5 bg-[#8C49E9] text-white font-semibold rounded-xl hover:bg-[#7a3cd1] transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-[#8C49E9]/20 cursor-pointer hover:shadow-[#8C49E9]/40"
                          >
                            Get Started <ArrowRight className="w-4 h-4" />
                          </motion.button>
                        </motion.form>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  {/* Corner indicator */}
                  <div className="absolute top-4 right-4 w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-purple-500 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            </div>
          </section>

          {/* Footer Section */}
          <footer className="bg-black border-t border-zinc-900 pt-16 pb-8 px-6 md:px-12 relative overflow-hidden">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 pb-12 border-b border-zinc-900">
              
              {/* Branding */}
              <div className="lg:col-span-2 space-y-4">
                <h1 className="font-bold text-xl">
                  <span className="text-white">SKILL</span>
                  <span className="text-[#8C49E9]">MENTOR</span>
                </h1>
                <p className="text-xs text-gray-500 leading-relaxed max-w-sm">
                  Empowering professionals globally through personalized, AI-driven learning roadmaps and structured mentorship, designed to close the skills gap.
                </p>
                <div className="flex gap-4 pt-2">
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-gray-400 hover:text-white hover:border-zinc-700 transition">
                    <Github className="w-4 h-4" />
                  </a>
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-gray-400 hover:text-white hover:border-zinc-700 transition">
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-gray-400 hover:text-white hover:border-zinc-700 transition">
                    <Twitter className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Links Column 1 */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Product</h4>
                <ul className="space-y-2 text-xs text-gray-500">
                  <li><a href="#features" className="hover:text-white transition">AI Roadmaps</a></li>
                  <li><a href="#howitworks" className="hover:text-white transition">Expert Review</a></li>
                  <li><a href="/login" className="hover:text-white transition">Dashboard</a></li>
                  <li><a href="/register" className="hover:text-white transition">Pricing</a></li>
                </ul>
              </div>

              {/* Links Column 2 */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Company</h4>
                <ul className="space-y-2 text-xs text-gray-500">
                  <li><a href="#about" className="hover:text-white transition">About Us</a></li>
                  <li><a href="#" className="hover:text-white transition">Careers</a></li>
                  <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                </ul>
              </div>

              {/* Newsletter subscribe form */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Newsletter</h4>
                <p className="text-xs text-gray-500">Get the latest career guides and product updates.</p>
                {newsletterSuccess ? (
                  <p className="text-xs text-emerald-400 font-semibold">Subscribed successfully!</p>
                ) : (
                  <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                    <input 
                      type="email" 
                      required
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Your email"
                      className="bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#8C49E9] flex-grow"
                    />
                    <button 
                      type="submit" 
                      className="px-3 py-2 bg-[#8C49E9] text-white rounded text-xs hover:bg-[#7a3cd1] transition font-semibold cursor-pointer"
                    >
                      Join
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Copyright */}
            <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row justify-between items-center text-[11px] text-gray-600 gap-4">
              <p>© {new Date().getFullYear()} SkillMentor Inc. All rights reserved.</p>
              <div className="flex gap-6">
                <a href="#" className="hover:text-gray-400 transition">Privacy Policy</a>
                <a href="#" className="hover:text-gray-400 transition">Terms of Use</a>
                <a href="#" className="hover:text-gray-400 transition">Cookie Settings</a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
};

export default LandingPage;