import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppContext } from '../contexts/AppContext';
import Navigation from './Navigation';
import Showreel from './Showreel';
import BottomNavigation from './BottomNavigation';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { isReelPlaying } = useAppContext();

  // GLOBAL SCROLL GUARD: Prevents any page from being stuck after navigating
  useEffect(() => {
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
    document.body.style.height = 'auto';
    
    // Ensure the scroll position is actually at the top on new pages
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="bg-background text-accent font-sans min-h-screen relative overflow-x-hidden selection:bg-accent selection:text-background">
      {/* PERFORMANCE FIX: Grain is hidden on mobile to prevent GPU lag */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] overflow-hidden hidden md:block">
        <div className="absolute inset-[-200%] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] animate-grain" />
      </div>

      <AnimatePresence mode="wait">
        {isReelPlaying && <Showreel key="global-showreel" />}
      </AnimatePresence>

      <div className="relative z-10 pb-16 md:pb-0">
        <Navigation />
        <main>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div 
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className="bg-background">{children}</div>
            </motion.div>
          </AnimatePresence>
        </main>
        <BottomNavigation />
      </div>
    </div>
  );
};

export default Layout;