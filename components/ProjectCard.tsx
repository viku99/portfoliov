import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Project } from '../types';
import { ArrowUpRight, Instagram, Youtube, Sparkles, Smartphone } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getPlatformIcon = () => {
    switch (project.platform) {
      case 'instagram': return <Instagram size={12} className="md:w-5 md:h-5" />;
      case 'youtube': return <Youtube size={12} className="md:w-5 md:h-5" />;
      case 'ai': return <Sparkles size={12} className="md:w-5 md:h-5" />;
      default: return <Smartphone size={12} className="md:w-5 md:h-5" />;
    }
  };

  return (
    <Link
      to={`/portfolio/${project.id}`}
      className="block group relative"
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
    >
      <motion.div 
        layoutId={isMobile ? undefined : `project-container-${project.id}`} 
        className="relative aspect-video md:aspect-[16/10] overflow-hidden bg-[#0d0d0d] rounded-xl md:rounded-3xl ring-1 ring-white/5 group-hover:ring-white/10 transition-all duration-700 shadow-xl"
      >
        <div className="absolute inset-0 z-0">
          <motion.img
            src={project.imageUrl}
            alt={project.title}
            className="w-full h-full object-cover grayscale opacity-70 md:opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] scale-[1.01] group-hover:scale-105"
            loading="lazy"
            decoding="async"
            onLoad={() => setIsImageLoaded(true)}
            initial={{ opacity: 0 }}
            animate={{ opacity: isImageLoaded ? 1 : 0 }}
            layoutId={isMobile ? undefined : `project-image-${project.id}`}
          />
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-20" />
        
        <div className="absolute bottom-0 left-0 w-full p-5 md:p-12 z-30 pointer-events-none">
          <div className="flex flex-col gap-1.5 md:gap-4">
            <div className="flex items-center gap-2 md:gap-3">
              <span className="p-1 bg-white/10 rounded-md text-white/60">
                {getPlatformIcon()}
              </span>
              <span className="text-[7px] md:text-[9px] uppercase tracking-[0.3em] md:tracking-[0.4em] text-accent/60 font-mono block">
                {project.category}
              </span>
            </div>
            
            <div className="flex justify-between items-end gap-4">
              <h3 className="text-lg md:text-4xl font-black tracking-tighter uppercase leading-[0.85] max-w-[80%] text-white drop-shadow-md">
                {project.title}
              </h3>
              <div className="text-2xl md:text-7xl font-black text-white/[0.05] select-none tracking-tighter leading-none whitespace-nowrap mb-1">
                {project.details.year}
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-4 right-4 md:top-10 md:right-10 z-30">
            <motion.div
                animate={isHovered ? { scale: 1.1, rotate: 0, opacity: 1 } : { scale: 0.9, rotate: -45, opacity: 0.5 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="bg-accent text-background rounded-full p-2.5 md:p-4 shadow-2xl"
            >
                <ArrowUpRight strokeWidth={3} className="w-3 h-3 md:w-5 md:h-5" />
            </motion.div>
        </div>
      </motion.div>
      
      <AnimatePresence>
        {!isMobile && isHovered && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.12 }}
                exit={{ opacity: 0 }}
                className="absolute -inset-10 bg-accent blur-[120px] -z-10 rounded-full"
            />
        )}
      </AnimatePresence>
    </Link>
  );
};

export default ProjectCard;