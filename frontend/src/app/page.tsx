'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trello, 
  Users, 
  Zap, 
  MessageSquare, 
  Bell, 
  ChevronRight, 
  ArrowRight,
  Menu,
  X,
  Play,
  CheckCircle,
  LayoutGrid
} from 'lucide-react';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll threshold detection for Navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  return (
    <div className="relative min-h-screen bg-[#030014] text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Background decoration elements */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-1/3 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[150px] pointer-events-none -z-10" />
      
      {/* Logo Grid Overlay for depth */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

      {/* NAVBAR */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'py-4 glass shadow-lg shadow-black/40' : 'py-6 bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-500 via-violet-500 to-cyan-500 shadow-md group-hover:scale-105 transition-transform duration-300">
              <Trello className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              FlowBoard
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-indigo-400 transition-colors">Features</a>
            <a href="#workflow" className="hover:text-indigo-400 transition-colors">Workflow</a>
            <a href="#testimonials" className="hover:text-indigo-400 transition-colors">Stories</a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Log in
            </Link>
            <Link href="/signup" className="relative group px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 overflow-hidden transition-all duration-300 hover:shadow-indigo-600/50 hover:scale-[1.02]">
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative flex items-center gap-1.5">
                Get Started <ChevronRight className="w-4 h-4" />
              </span>
            </Link>
          </div>

          {/* Mobile hamburger menu */}
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 text-slate-300 hover:text-white transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 z-50 glass flex flex-col justify-between p-8 md:hidden"
          >
            <div>
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500">
                    <Trello className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold text-lg">FlowBoard</span>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-slate-300 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex flex-col gap-6 text-xl font-semibold text-slate-300">
                <a 
                  href="#features" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-indigo-400 transition-colors"
                >
                  Features
                </a>
                <a 
                  href="#workflow" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-indigo-400 transition-colors"
                >
                  Workflow
                </a>
                <a 
                  href="#testimonials" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-indigo-400 transition-colors"
                >
                  Stories
                </a>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <Link 
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3.5 rounded-xl border border-slate-700 font-semibold text-slate-300 hover:text-white"
              >
                Log In
              </Link>
              <Link 
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 font-semibold text-white shadow-lg shadow-indigo-600/30"
              >
                Start for Free
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-24 md:pt-44 md:pb-36 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="lg:col-span-6 flex flex-col gap-6 text-center lg:text-left"
          >
            <motion.div 
              variants={itemVariants}
              className="inline-flex self-center lg:self-start items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300"
            >
              <Zap className="w-3.5 h-3.5" />
              Introducing FlowBoard v1.0
            </motion.div>

            <motion.h1 
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] text-white"
            >
              The board where teams <br />
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                actually get things done
              </span>
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="text-lg text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              Streamline tasks, assign work, and collaborate with your team in real time. Designed for modern teams who demand visual speed and elegant workflows.
            </motion.p>

            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mt-4"
            >
              <Link 
                href="/signup" 
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 text-base font-semibold text-white shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 group"
              >
                Start for free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/login" 
                className="w-full sm:w-auto px-8 py-4 rounded-xl border border-slate-800 hover:border-slate-700 bg-white/5 hover:bg-white/10 font-semibold text-slate-200 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-slate-200" />
                Go to Dashboard
              </Link>
            </motion.div>
          </motion.div>

          {/* Centered Centerpiece 3D/Parallax Card Stack representation */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="lg:col-span-6 relative flex justify-center perspective-[1200px]"
          >
            {/* Interactive Card stack showing Floating task cards in 3D Space */}
            <div className="relative w-full max-w-[500px] h-[360px] md:h-[400px] border border-white/5 bg-slate-950/40 backdrop-blur-xl rounded-2xl p-6 shadow-2xl shadow-indigo-900/20 transform rotate-x-12 rotate-y-[-10deg] rotate-z-[2deg] hover:rotate-x-6 hover:rotate-y-[-4deg] transition-transform duration-700 ease-out">
              
              {/* Board Header Bar */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  <span className="text-xs text-slate-500 ml-2 font-mono">FlowBoard.io/product-launch</span>
                </div>
                <div className="flex -space-x-1.5">
                  <div className="w-5 h-5 rounded-full bg-indigo-600 border border-slate-900 flex items-center justify-center text-[8px] font-bold">JD</div>
                  <div className="w-5 h-5 rounded-full bg-cyan-600 border border-slate-900 flex items-center justify-center text-[8px] font-bold">AL</div>
                  <div className="w-5 h-5 rounded-full bg-purple-600 border border-slate-900 flex items-center justify-center text-[8px] font-bold">RK</div>
                </div>
              </div>

              {/* Task Columns grid mock */}
              <div className="grid grid-cols-3 gap-4 h-full">
                
                {/* Column 1 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">To Do</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400">2</span>
                  </div>
                  
                  {/* Cards */}
                  <motion.div 
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 shadow-lg cursor-pointer"
                  >
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-bold">Design</span>
                    <h4 className="text-xs font-semibold text-slate-200 mt-2">Finalize landing page structure</h4>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 shadow-lg cursor-pointer opacity-70"
                  >
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-bold">Content</span>
                    <h4 className="text-xs font-semibold text-slate-200 mt-2">Write PRD specs</h4>
                  </motion.div>
                </div>

                {/* Column 2 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider text-indigo-400 font-semibold">In Progress</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300">1</span>
                  </div>
                  
                  {/* Moving Active Card */}
                  <motion.div 
                    animate={{ 
                      y: [0, -6, 0],
                      rotateZ: [0, 0.5, 0]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="p-3 rounded-xl bg-indigo-600/10 border border-indigo-500/30 shadow-indigo-900/10 shadow-xl cursor-pointer"
                  >
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-bold">Dev</span>
                    <h4 className="text-xs font-semibold text-slate-100 mt-2">Configure WebSockets for multiplayers</h4>
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
                      <span className="text-[9px] text-slate-400">3/4 checklist</span>
                      <div className="w-4 h-4 rounded-full bg-purple-600 flex items-center justify-center text-[7px] font-bold">RK</div>
                    </div>
                  </motion.div>
                </div>

                {/* Column 3 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-semibold">Done</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300">1</span>
                  </div>
                  
                  <motion.div 
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 shadow-lg cursor-pointer opacity-50"
                  >
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold font-semibold">Setup</span>
                    <h4 className="text-xs font-semibold text-slate-200 mt-2">Initialize SQLite database</h4>
                  </motion.div>
                </div>

              </div>

              {/* Parallax Floating elements around */}
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-tr from-cyan-400 to-indigo-500 rounded-2xl blur-xl opacity-20 animate-pulse pointer-events-none" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-purple-500 to-indigo-500 rounded-full blur-2xl opacity-10 pointer-events-none" />

            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURE GRID SECTION */}
      <section id="features" className="py-24 border-t border-slate-900 bg-slate-950/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything you need to ship faster, together
            </h2>
            <p className="text-slate-400">
              FlowBoard bridges the gap between structured project management and fast, interactive messaging.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl glass-card flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <LayoutGrid className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">Dynamic Kanban Boards</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Organize projects into custom boards, populate columns, and fluidly drag and drop cards. Re-arrange everything to fit your custom build cycle.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl glass-card flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">Multiplayer Real-time Sync</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Powered by WebSockets. Card movements, status alterations, and comments appear on your team's screens instantly, without any manual refreshing.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl glass-card flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">Integrated Task Discussions</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Add comments, mention teammates, and keep implementation conversations nested contextually within each task instead of losing details in chat.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 rounded-2xl glass-card flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">Instant Notifications</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Get notified the exact moment you are assigned a new task, @mentioned, or when a task status shifts. Keep updated using the integrated system bell.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 rounded-2xl glass-card flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">Optimistic UI Rendering</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Actions feel instantaneous. The UI updates locally instantly and reconciles in the background with the server database for zero perceived lag.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 rounded-2xl glass-card flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">Collaborator Presence</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                See who is viewing the board with active presence indicator bubbles. Instantly know when teammate is working with you on the same project workspace.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* HOW IT WORKS / WORKFLOW SECTION */}
      <section id="workflow" className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Manage work in three simple steps
            </h2>
            <p className="text-slate-400 leading-relaxed">
              We took away the complexity of traditional management tools and focused strictly on card clarity, real-time sync, and speed.
            </p>
            
            <div className="space-y-4 pt-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center font-bold text-indigo-400 text-sm shrink-0">1</div>
                <div>
                  <h4 className="font-semibold text-slate-200">Scaffold Projects & Boards</h4>
                  <p className="text-sm text-slate-400">Group boards by projects to segment work across separate workspaces.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center font-bold text-purple-400 text-sm shrink-0">2</div>
                <div>
                  <h4 className="font-semibold text-slate-200">Assign Cards & Sub-tasks</h4>
                  <p className="text-sm text-slate-400">Delegate tasks to team members and set priority levels.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center font-bold text-cyan-400 text-sm shrink-0">3</div>
                <div>
                  <h4 className="font-semibold text-slate-200">Collaborate Multiplayers</h4>
                  <p className="text-sm text-slate-400">Discuss card implementation inside comment sections with live broadcasts.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 p-2 bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-500 rounded-3xl shadow-2xl shadow-indigo-900/30">
            <div className="bg-[#030014] rounded-[22px] overflow-hidden p-4 md:p-8">
              {/* Inner live-like mock dashboard representation */}
              <div className="space-y-6">
                <div className="flex items-center justify-between text-sm text-slate-400 border-b border-white/5 pb-4">
                  <span className="font-semibold text-white">FlowBoard Beta Sandbox</span>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Real-time connected</span>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-slate-100 text-base">Setup Next.js & Framer Motion</h4>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 font-semibold">High Priority</span>
                  </div>
                  <p className="text-sm text-slate-400">
                    Construct the animated landing page and responsive hamburger side drawer.
                  </p>
                  
                  <div className="flex justify-between items-center pt-2">
                    <div className="flex gap-2">
                      <span className="text-xs px-2 py-1 rounded bg-white/5 text-slate-300">Landing</span>
                      <span className="text-xs px-2 py-1 rounded bg-white/5 text-slate-300">App</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">JD</div>
                      <span className="text-xs text-slate-300">Assigned to John</span>
                    </div>
                  </div>
                </div>

                {/* Comment thread mock */}
                <div className="space-y-3">
                  <div className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-cyan-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">AL</div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-xs text-slate-300 max-w-md">
                      <span className="font-bold text-white block mb-1">Alex Lee</span>
                      I've added the layout.tsx files. Will start updating routes.
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">RK</div>
                    <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-3 text-xs text-slate-200 max-w-md">
                      <span className="font-bold text-indigo-300 block mb-1">Rebecca King</span>
                      Looks incredible! Just pushed the JWT auth routes.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section id="testimonials" className="py-24 border-t border-slate-900 bg-slate-950/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              What teams are building
            </h2>
            <p className="text-slate-400">
              Hundreds of startup leads and freelancers build with FlowBoard daily.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl glass-card space-y-6">
              <p className="text-sm text-slate-300 italic leading-relaxed">
                "FlowBoard transformed how our remote agency operates. Dragging task cards feels incredibly fluid, and comments sync instantly. The WebSockets presence is a game-changer."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold">MS</div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Marcus Stone</h4>
                  <span className="text-xs text-slate-500">Lead Dev, Vector Creative</span>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-2xl glass-card space-y-6">
              <p className="text-sm text-slate-300 italic leading-relaxed">
                "Auth setups, boards loading, and task assignment is bulletproof. The UI feels premium, and my clients love the simplicity of looking at their boards."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center text-xs font-bold font-semibold">SK</div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Sarah Jenkins</h4>
                  <span className="text-xs text-slate-500">Freelance Designer</span>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-2xl glass-card space-y-6">
              <p className="text-sm text-slate-300 italic leading-relaxed">
                "We set up our product roadmap board in less than two minutes. The live in-app notifications keep us completely coordinated on due dates. Truly exceptional."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-xs font-bold">DL</div>
                <div>
                  <h4 className="text-sm font-semibold text-white">David Lim</h4>
                  <span className="text-xs text-slate-500">CTO, PulseAI</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="py-24 max-w-5xl mx-auto px-6 text-center">
        <div className="p-8 md:p-16 rounded-3xl bg-gradient-to-r from-indigo-900/50 via-purple-900/40 to-cyan-900/40 border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-6 max-w-xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">
              Ready to streamline your workflow?
            </h2>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Create an account, invite your team, and construct your first board in under 2 minutes. Start for free.
            </p>
            <div className="pt-4">
              <Link 
                href="/signup" 
                className="inline-flex px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 text-base font-semibold text-white shadow-xl shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 gap-2 items-center"
              >
                Create Account Now
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 py-12 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-500">
              <Trello className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-slate-300">FlowBoard</span>
          </div>
          <div>
            &copy; 2026 FlowBoard. Built with Antigravity AI. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
