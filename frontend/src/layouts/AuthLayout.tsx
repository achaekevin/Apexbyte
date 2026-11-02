import { FC } from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { FiShield, FiCpu, FiAward, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';
import TechBackground from '../components/ui/TechBackground';

const AuthLayout: FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const shouldReduceMotion = useReducedMotion();

  if (isAuthenticated) {
    if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <TechBackground variant="auth" className="min-h-screen bg-slate-50 dark:bg-gray-950 flex flex-col justify-between">
      {/* Top Navbar / Return link */}
      <header className="w-full px-4 sm:px-8 py-4 sm:py-6 flex items-center justify-between relative z-20">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors group"
        >
          <span className="p-1.5 rounded-lg bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 shadow-xs group-hover:-translate-x-0.5 transition-transform">
            <FiArrowLeft size={16} />
          </span>
          <span>Back to Store</span>
        </Link>

        {/* Brand pill */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary-600 to-emerald-500 flex items-center justify-center text-white shadow-md">
            <FiCpu size={18} />
          </div>
          <span className="font-black text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
            Apex<span className="text-primary-600 dark:text-primary-400">byte</span>
          </span>
        </Link>
      </header>

      {/* Main Center Area: Responsive Split Grid on Desktop */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 flex items-center justify-center relative z-10">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Dedicated Laptop Showcase on Large Screens */}
          <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 flex-col justify-center space-y-8 pr-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-primary-100/80 text-primary-800 dark:bg-primary-950/60 dark:text-primary-300 border border-primary-200 dark:border-primary-800/80 mb-4 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Certified High-Performance Computing</span>
              </div>
              <h1 className="text-3xl xl:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                Power Your Ambition With <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-teal-600 to-emerald-500 dark:from-primary-400 dark:via-teal-400 dark:to-emerald-400">
                  Precision-Engineered Laptops
                </span>
              </h1>
              <p className="mt-3 text-slate-600 dark:text-slate-300 text-sm max-w-lg leading-relaxed">
                Log in to track your hardware orders, manage your warranties, save items to your wishlist, and access exclusive laptop offers.
              </p>
            </div>

            {/* Floating Laptop Visual with Glow Pedestal */}
            <div className="relative flex flex-col items-center justify-center py-4">
              {/* Soft Pedestal Glow */}
              <div className="absolute w-72 h-36 bg-primary-500/15 dark:bg-primary-600/25 blur-2xl rounded-full -bottom-4" />

              <motion.div
                animate={
                  shouldReduceMotion
                    ? undefined
                    : {
                        y: [-6, 6, -6],
                      }
                }
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="relative z-10 max-w-md w-full"
              >
                <img
                  src="/laptops/hero-showcase.png"
                  alt="Apexbyte Flagship Laptop"
                  className="w-full h-auto max-h-[340px] object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.18)] dark:drop-shadow-[0_20px_40px_rgba(0,0,0,0.45)]"
                />
              </motion.div>

              {/* Realistic Shadow */}
              <div className="w-56 h-3 bg-black/20 dark:bg-black/50 blur-md rounded-full mt-2" />
            </div>

            {/* Feature Pills */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-white/70 dark:bg-gray-800/70 border border-slate-200/80 dark:border-gray-700/80 backdrop-blur-xs flex items-center gap-2.5 shadow-xs">
                <FiShield className="text-emerald-500 shrink-0" size={18} />
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">1-Yr Warranty</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">Store backed</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/70 dark:bg-gray-800/70 border border-slate-200/80 dark:border-gray-700/80 backdrop-blur-xs flex items-center gap-2.5 shadow-xs">
                <FiCheckCircle className="text-primary-500 shrink-0" size={18} />
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">7-Point Tested</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">Every component</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/70 dark:bg-gray-800/70 border border-slate-200/80 dark:border-gray-700/80 backdrop-blur-xs flex items-center gap-2.5 shadow-xs">
                <FiAward className="text-amber-500 shrink-0" size={18} />
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">100% Genuine</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">Official hardware</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: The Form Container */}
          <div className="lg:col-span-6 xl:col-span-5 flex justify-center w-full">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="w-full max-w-md"
            >
              <Outlet />
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer copyright */}
      <footer className="w-full px-4 py-4 text-center text-xs text-slate-500 dark:text-slate-400 relative z-10">
        &copy; {new Date().getFullYear()} Apexbyte Kenya. All rights reserved. Hospital Road, Kisii.
      </footer>
    </TechBackground>
  );
};

export default AuthLayout;
