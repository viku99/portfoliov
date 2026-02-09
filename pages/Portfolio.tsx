import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PROJECTS } from '../constants';
import PremiumPortfolio from '../components/PremiumPortfolio';
import ProjectCard from '../components/ProjectCard';

const Portfolio = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="bg-background min-h-screen pt-32 md:pt-40 pb-32">
      <div className="container mx-auto px-6">
        <div className="mb-12 md:mb-20 text-center space-y-4">
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[10px] uppercase tracking-[0.8em] text-neutral-500 font-mono block"
            >
              ARCHIVE DIRECTORY // VOL 1
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-[88px] font-black uppercase tracking-[-0.03em] leading-none text-white"
            >
                SELECTED WORKS
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              className="text-[10px] md:text-[12px] uppercase tracking-[0.4em] font-medium text-white"
            >
              Motion Design • Editing • Visual Experiments
            </motion.p>
        </div>

        {/* Premium Carousel View: PC Only */}
        {!isMobile && (
          <section className="mb-40 hidden md:block">
             <PremiumPortfolio projects={PROJECTS} />
          </section>
        )}

        {/* Grid View: Main view for mobile, secondary for PC */}
        <section id="grid-scan-mode" className="max-w-6xl mx-auto md:pt-20">
          <div className="flex items-center gap-4 mb-12 md:mb-20">
            <div className="h-[1px] flex-1 bg-white/5" />
            <span className="text-[9px] md:text-[10px] uppercase tracking-[0.5em] font-mono text-neutral-700 whitespace-nowrap">GRID SCAN MODE</span>
            <div className="h-[1px] flex-1 bg-white/5" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-16">
            {PROJECTS.map((project) => (
              <div key={project.id} className="group">
                <ProjectCard project={project} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Portfolio;