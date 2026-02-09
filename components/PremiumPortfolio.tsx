
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Project } from '../types';
import { Search, LayoutGrid, ChevronDown, Instagram, Youtube, Sparkles, Smartphone } from 'lucide-react';

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

  // Dynamic Scaling - Mobile-first approach
  // Optimized for mobile: smaller base size and more conservative scaling
  const isMobile = windowWidth < 768;
  const RING_RADIUS_X = isMobile ? windowWidth * 0.75 : 720;
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return;
      if (e.key === 'ArrowRight') { handleNext(); setIsPaused(true); }
      if (e.key === 'ArrowLeft') { handlePrev(); setIsPaused(true); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    mouseX.set(x);
    mouseY.set(y);
  };

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

    const angleStep = isMobile ? 0.8 : 0.45; 
    const angle = rel * angleStep;
    
    const x = Math.sin(angle) * RING_RADIUS_X;
    const y = -Math.cos(angle) * RING_RADIUS_Y + (RING_RADIUS_Y);
    
    const dist = Math.abs(rel);
    const z = -dist * (isMobile ? 200 : 250); 
    const opacity = Math.max(0, 1 - dist * 0.45);
    // Reduced scale for mobile (1.1 instead of 1.3) to prevent filling the screen
    const scale = i === centerIndex ? (isMobile ? 1.1 : 1.3) : Math.max(0.4, 1 - dist * 0.35);
    const rotateY = -rel * (isMobile ? 40 : 25); 
    const zIndex = 100 - Math.round(dist * 10);
    
    return { x, y, z, opacity, scale, rotateY, zIndex, rel };
  };

  const getPlatformIcon = (p: Project) => {
    switch (p.platform) {
      case 'instagram': return <Instagram size={14} />;
      case 'youtube': return <Youtube size={14} />;
      case 'ai': return <Sparkles size={14} />;
      default: return <Smartphone size={14} />;
    }
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
      <div className="max-w-4xl mx-auto mb-10 md:mb-24 px-6">
        <div className="bg-[#0f0f0f]/50 backdrop-blur-3xl border border-white/5 rounded-full px-6 md:px-10 py-1 md:py-2 flex items-center gap-4 md:gap-6 shadow-2xl">
          <div className="flex-1 flex items-center gap-3 md:gap-4">
            <Search className="w-4 h-4 text-neutral-700" />
            <input 
              type="text" 
              placeholder="SEARCH ARCHIVE..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent py-3 md:py-4 text-[9px] md:text-[11px] uppercase tracking-[0.4em] font-bold outline-none placeholder:text-neutral-800 text-white/80"
            />
          </div>
          <div className="hidden md:flex items-center gap-10 border-l border-white/5 pl-10 font-mono text-[10px] uppercase tracking-widest text-neutral-600">
            {filtered.length} ARCHIVES
          </div>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="relative h-[500px] md:h-[750px] flex items-center justify-center overflow-visible touch-none"
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
           <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/[0.05] z-0" />
           <motion.div 
              animate={{ 
                backgroundColor: activeProject?.themeColor || '#ffffff',
                opacity: [0.02, 0.06, 0.02]
              }}
              transition={{ duration: 6, repeat: Infinity }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1800px] h-[900px] rounded-full blur-[160px]" 
           />
        </div>

        <div className="relative w-full h-full flex items-center justify-center perspective-[3000px]">
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
                    x, y, z, opacity, scale, 
                    filter: isCenter ? 'blur(0px) saturate(1.1)' : `blur(${Math.abs(rel) * 8}px) saturate(0)`
                  }}
                  transition={{ type: "spring", stiffness: 50, damping: 22, mass: 1 }}
                  onClick={() => isCenter ? navigate(`/portfolio/${p.id}`) : setCenterIndex(i)}
                >
                  {/* Reduced base width on mobile from 280px to 210px for better viewport proportion */}
                  <div className={`relative w-[210px] md:w-[360px] aspect-[9/14] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden group transition-all duration-700 ${isCenter ? 'shadow-[0_40px_100px_rgba(0,0,0,1)] ring-1 ring-white/20' : 'opacity-30'}`}>
                    <div className="absolute inset-0 bg-[#0a0a0a]" />

                    <motion.img 
                      style={{ scale: 1.3 }}
                      src={p.imageUrl} 
                      alt={p.title} 
                      className="w-full h-full object-cover grayscale-0 transition-transform duration-[8s] group-hover:scale-150" 
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-10" />
                    
                    <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-end text-center z-20">
                       <div className="space-y-3 md:space-y-6 mb-8 md:mb-12">
                          <div className="flex items-center justify-center gap-2 md:gap-3">
                             <div className="h-[1px] w-4 md:w-6 bg-white/20" />
                             <span className="text-white/40 scale-75 md:scale-100">{getPlatformIcon(p)}</span>
                             <span className="text-[8px] md:text-[10px] uppercase tracking-[0.4em] md:tracking-[0.5em] font-mono text-white/50">{p.category}</span>
                             <div className="h-[1px] w-4 md:w-6 bg-white/20" />
                          </div>
                          
                          <motion.h3 
                            key={`title-${centerIndex}`}
                            className="text-lg md:text-5xl font-black uppercase tracking-tighter leading-[0.85] text-white drop-shadow-2xl"
                          >
                            {p.title}
                          </motion.h3>
                       </div>

                       <div className="absolute bottom-6 md:bottom-10 left-6 md:left-10 right-6 md:right-10 flex justify-between items-center text-white/20 font-mono text-[8px] md:text-[10px]">
                          <span>NO. {i + 1}</span>
                          <span>{p.details.year}</span>
                       </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex flex-col items-center gap-8 md:gap-12 -mt-4 md:-mt-12 mb-20">
        <div className="flex items-center gap-8 md:gap-10">
           <button 
            onClick={() => { handlePrev(); setIsPaused(true); }}
            className="p-4 md:p-5 rounded-full border border-white/10 text-neutral-600 hover:text-white hover:bg-white/10 transition-all active:scale-90"
           >
              <ChevronDown className="w-4 h-4 md:w-5 md:h-5 rotate-90" />
           </button>
           
           <div className="flex gap-2 md:gap-3">
              {filtered.map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => { setCenterIndex(idx); setIsPaused(true); }}
                  className={`h-1.5 transition-all duration-700 rounded-full ${idx === centerIndex ? 'w-8 md:w-12 bg-accent' : 'w-1.5 md:w-2 bg-white/10'}`}
                />
              ))}
           </div>

           <button 
            onClick={() => { handleNext(); setIsPaused(true); }}
            className="p-4 md:p-5 rounded-full border border-white/10 text-neutral-600 hover:text-white hover:bg-white/10 transition-all active:scale-90"
           >
              <ChevronDown className="w-4 h-4 md:w-5 md:h-5 -rotate-90" />
           </button>
        </div>

        <button 
          onClick={() => document.getElementById('grid-scan-mode')?.scrollIntoView({ behavior: 'smooth' })}
          className="group flex items-center gap-4 md:gap-6 bg-white/5 border border-white/10 hover:bg-accent hover:text-background px-8 md:px-16 py-4 md:py-6 rounded-full transition-all duration-700"
        >
          <LayoutGrid className="w-3.5 h-3.5 md:w-4 md:h-4" />
          <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.4em] md:tracking-[0.5em]">EXPLORE ALL WORKS</span>
        </button>
      </div>
    </div>
  );
};

export default PremiumPortfolio;
