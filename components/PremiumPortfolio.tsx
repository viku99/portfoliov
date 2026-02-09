
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Project } from '../types';
import { Search, LayoutGrid, ChevronDown } from 'lucide-react';

interface PremiumPortfolioProps {
  projects: Project[];
}

const PremiumPortfolio: React.FC<PremiumPortfolioProps> = ({ projects }) => {
  const navigate = useNavigate();
  const [centerIndex, setCenterIndex] = useState(0);
  const [query, setQuery] = useState("");
  const [isPaused, setIsPaused] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastWheelTime = useRef(0);
  const autoScrollRef = useRef<number | null>(null);

  // Dynamic Radius based on screen width
  const isMobile = windowWidth < 768;
  const RING_RADIUS_X = isMobile ? windowWidth * 0.8 : 720;
  const RING_RADIUS_Y = isMobile ? 60 : 120;
  const VISIBLE_RANGE = isMobile ? 2 : 3;

  // Parallax Values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { damping: 50, stiffness: 400 });
  const smoothMouseY = useSpring(mouseY, { damping: 50, stiffness: 400 });

  const rotateActiveX = useTransform(smoothMouseY, [-300, 300], [10, -10]);
  const rotateActiveY = useTransform(smoothMouseX, [-400, 400], [-15, 15]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filter logic
  const filtered = useMemo(() => {
    if (!query.trim()) return projects;
    const q = query.toLowerCase();
    return projects.filter(p => 
      p.title.toLowerCase().includes(q) || 
      p.category.toLowerCase().includes(q)
    );
  }, [projects, query]);

  useEffect(() => {
    setCenterIndex(0);
  }, [filtered.length]);

  const handleNext = useCallback(() => {
    if (filtered.length === 0) return;
    setCenterIndex(prev => (prev + 1) % filtered.length);
  }, [filtered.length]);
  
  const handlePrev = useCallback(() => {
    if (filtered.length === 0) return;
    setCenterIndex(prev => (prev - 1 + filtered.length) % filtered.length);
  }, [filtered.length]);

  // Auto Scroll Engine (6.1 seconds)
  useEffect(() => {
    if (isPaused || filtered.length <= 1) {
      if (autoScrollRef.current) clearInterval(autoScrollRef.current);
      return;
    }

    autoScrollRef.current = window.setInterval(() => {
      handleNext();
    }, 6100);

    return () => {
      if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    };
  }, [isPaused, filtered.length, handleNext]);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return;
      if (e.key === 'ArrowRight') { handleNext(); setIsPaused(true); }
      if (e.key === 'ArrowLeft') { handlePrev(); setIsPaused(true); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  // Mouse Parallax Tracker
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    mouseX.set(x);
    mouseY.set(y);
  };

  // Wheel Handling
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = Date.now();
      if (now - lastWheelTime.current < 450) return;
      
      const dominantDelta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (Math.abs(dominantDelta) < 15) return;

      setIsPaused(true);
      if (dominantDelta > 0) {
        handleNext();
        lastWheelTime.current = now;
      } else if (dominantDelta < 0) {
        handlePrev();
        lastWheelTime.current = now;
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [handleNext, handlePrev]);

  const getCardProps = (i: number) => {
    const L = filtered.length;
    if (L === 0) return null;

    let rel = i - centerIndex;
    if (rel > L / 2) rel -= L;
    if (rel < -L / 2) rel += L;

    const angleStep = isMobile ? 0.6 : 0.45; 
    const angle = rel * angleStep;
    
    const x = Math.sin(angle) * RING_RADIUS_X;
    const y = -Math.cos(angle) * RING_RADIUS_Y + (RING_RADIUS_Y);
    
    const dist = Math.abs(rel);
    const z = -dist * (isMobile ? 180 : 250); 
    const opacity = Math.max(0, 1 - dist * 0.35);
    const scale = i === centerIndex ? 1.15 : Math.max(0.2, 1 - dist * 0.25);
    const rotateY = -rel * (isMobile ? 35 : 25); 
    const zIndex = 100 - Math.round(dist * 10);
    
    return { x, y, z, opacity, scale, rotateY, zIndex, rel };
  };

  const activeProject = filtered[centerIndex];

  return (
    <div 
      className="w-full relative select-none" 
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Search Bar */}
      <div className="max-w-4xl mx-auto mb-12 md:mb-20 px-6">
        <div className="bg-[#0f0f0f]/60 backdrop-blur-2xl border border-white/5 rounded-full px-6 md:px-8 py-1 md:py-1.5 flex items-center gap-4 md:gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="flex-1 flex items-center gap-3 md:gap-4">
            <Search className="w-4 h-4 text-neutral-600" />
            <input 
              type="text" 
              placeholder="SEARCH ARCHIVE..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent py-4 text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-bold outline-none placeholder:text-neutral-700 text-white"
            />
          </div>
          
          <div className="hidden md:flex items-center gap-10 border-l border-white/5 pl-10">
            <div className="text-[9px] uppercase tracking-widest text-neutral-700 font-mono">
              {filtered.length} ARCHIVES
            </div>
          </div>
        </div>
      </div>

      {/* Main Orbit Stage */}
      <div 
        ref={containerRef}
        className="relative h-[550px] md:h-[700px] flex items-center justify-center overflow-visible touch-none"
      >
        {/* Atmosphere */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
           <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/[0.03] z-0" />
           <motion.div 
              animate={{ 
                backgroundColor: activeProject?.themeColor || '#ffffff',
                opacity: [0.01, 0.04, 0.01]
              }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1600px] h-[800px] rounded-full blur-[140px]" 
           />
        </div>

        {/* Cards Container */}
        <div className="relative w-full h-full flex items-center justify-center perspective-[2500px]">
          <AnimatePresence mode="popLayout">
            {filtered.map((p, i) => {
              const props = getCardProps(i);
              if (!props) return null;
              
              const { x, y, z, opacity, scale, rotateY, zIndex, rel } = props;
              const isCenter = i === centerIndex;
              
              if (Math.abs(rel) > VISIBLE_RANGE) return null;

              return (
                <motion.div
                  key={p.id}
                  className="absolute cursor-pointer will-change-transform"
                  style={{ 
                    zIndex,
                    rotateX: isCenter ? rotateActiveX : 0,
                    rotateY: isCenter ? rotateActiveY : rotateY,
                  }}
                  initial={false}
                  animate={{ 
                    x, 
                    y, 
                    z, 
                    opacity, 
                    scale, 
                    filter: isCenter ? 'blur(0px) saturate(1)' : `blur(${Math.abs(rel) * 3}px) saturate(0)`
                  }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 60, 
                    damping: 22, 
                    mass: 0.8
                  }}
                  onClick={() => {
                    if (isCenter) navigate(`/portfolio/${p.id}`);
                    else {
                      setCenterIndex(i);
                      setIsPaused(true);
                    }
                  }}
                >
                  <div className={`relative w-[240px] md:w-[320px] aspect-[9/13] rounded-2xl overflow-hidden group transition-all duration-700 ${isCenter ? 'shadow-[0_40px_120px_rgba(0,0,0,1)] ring-1 ring-white/20' : 'opacity-40'}`}>
                    
                    <div className="absolute inset-0 bg-[#0a0a0a]" />

                    {/* Inner Parallax Image */}
                    <motion.img 
                      style={{
                        scale: 1.2,
                        x: isCenter ? useTransform(smoothMouseX, [-400, 400], [15, -15]) : 0,
                        y: isCenter ? useTransform(smoothMouseY, [-300, 300], [15, -15]) : 0,
                      }}
                      src={p.imageUrl} 
                      alt={p.title} 
                      className="w-full h-full object-cover grayscale-0 group-hover:grayscale-0 transition-transform duration-[4s] group-hover:scale-130" 
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                    
                    <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end text-center">
                       <div className="space-y-2 md:space-y-3 mb-8 md:mb-10">
                          <div className="flex items-center justify-center gap-2">
                             <div className="h-[1px] w-3 md:w-4 bg-white/20" />
                             <span className="text-[7px] md:text-[8px] uppercase tracking-[0.4em] font-mono text-white/50">{p.category}</span>
                             <div className="h-[1px] w-3 md:w-4 bg-white/20" />
                          </div>
                          
                          <motion.h3 
                            key={`title-${centerIndex}`}
                            initial={{ opacity: 0.5, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-lg md:text-3xl font-black uppercase tracking-tighter leading-none text-white drop-shadow-lg"
                          >
                            {p.title}
                          </motion.h3>
                       </div>

                       <div className="absolute bottom-6 md:bottom-8 left-6 md:left-8 right-6 md:right-8 flex justify-between items-center text-white/20 font-mono text-[8px] md:text-[9px]">
                          <span>0{i + 1}</span>
                          <span>{p.details.year}</span>
                       </div>
                    </div>
                    
                    {isCenter && (
                      <motion.div 
                        layoutId="focus-border"
                        className="absolute inset-0 border border-white/10 rounded-2xl pointer-events-none"
                      />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Indicators */}
      <div className="flex flex-col items-center gap-10 md:gap-12 -mt-4 md:-mt-10 mb-20">
        <div className="flex items-center gap-6 md:gap-8">
           <button 
            onClick={() => { handlePrev(); setIsPaused(true); }}
            className="p-3 md:p-4 rounded-full border border-white/5 text-neutral-600 hover:text-white hover:bg-white/10 transition-all active:scale-90"
           >
              <ChevronDown className="w-4 h-4 rotate-90" />
           </button>
           
           <div className="flex gap-2 md:gap-2.5">
              {filtered.map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => { setCenterIndex(idx); setIsPaused(true); }}
                  className={`h-1 transition-all duration-700 rounded-full ${idx === centerIndex ? 'w-8 md:w-10 bg-accent' : 'w-1.5 md:w-2 bg-white/10'}`}
                />
              ))}
           </div>

           <button 
            onClick={() => { handleNext(); setIsPaused(true); }}
            className="p-3 md:p-4 rounded-full border border-white/5 text-neutral-600 hover:text-white hover:bg-white/10 transition-all active:scale-90"
           >
              <ChevronDown className="w-4 h-4 -rotate-90" />
           </button>
        </div>

        <button 
          onClick={() => {
            const gridSection = document.getElementById('grid-scan-mode');
            gridSection?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="group flex items-center gap-4 md:gap-5 bg-white/5 border border-white/10 hover:bg-accent hover:border-accent hover:text-background px-8 md:px-12 py-4 md:py-5 rounded-full transition-all duration-700"
        >
          <LayoutGrid className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />
          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em]">EXPLORE ALL</span>
        </button>
      </div>
    </div>
  );
};

export default PremiumPortfolio;
