
import React from 'react';
import { motion } from 'framer-motion';
import { PROJECTS } from '../constants';
import PremiumPortfolio from '../components/PremiumPortfolio';
import ProjectCard from '../components/ProjectCard';

const Portfolio = () => {
  return (
    <div className="bg-background min-h-screen pt-32 md:pt-40 pb-32">
      <div className="container mx-auto px-6">
        <div className="mb-20 text-center space-y-4">
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
              className="text-6xl md:text-[88px] font-black uppercase tracking-[-0.03em] leading-none text-white"
            >
                SELECTED WORKS
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              className="text-[12px] uppercase tracking-[0.4em] font-medium text-white"
            >
              Motion Design • Editing • Visual Experiments
            </motion.p>
        </div>

        {/* Premium Carousel View */}
        <section className="mb-40">
           <PremiumPortfolio projects={PROJECTS} />
        </section>

        {/* Secondary Grid View */}
        <section id="grid-scan-mode" className="max-w-6xl mx-auto pt-20">
          <div className="flex items-center gap-4 mb-20">
            <div className="h-[1px] flex-1 bg-white/5" />
            <span className="text-[10px] uppercase tracking-[0.5em] font-mono text-neutral-700 whitespace-nowrap">GRID SCAN MODE</span>
            <div className="h-[1px] flex-1 bg-white/5" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
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
