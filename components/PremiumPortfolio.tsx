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

  const isMobile = windowWidth < 768;
  const RING_RADIUS_X = isMobile ? windowWidth * 0.7 : 720;
  const RING_RADIUS_Y = isMobile ? 40 : 120;
  const VISIBLE_RANGE = isMobile ? 1 : 3;

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { damping: 50, stiffness: 400 });
  const smoothMouseY = useSpring(mouseY, { damping: 50, stiffness: 400 });

  const rotateActiveX = useTransform(smoothMouseY, [-300, 300], [8, -8]);
  const rotateActiveY = useTransform(smoothMouseX, [-400, 400], [-12, 12]);

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
    if (isMobile || !containerRef.current) return;
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
      if (Math.abs(dominantDelta) < 10) return;

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

    const angleStep = isMobile ? 1.0 : 0.45; 
    const angle = rel * angleStep;
    
    const x = Math.sin(angle) * RING_RADIUS_X;
    const y = -Math.cos(angle) * RING_RADIUS_Y + (RING_RADIUS_Y);
    
    const dist = Math.abs(rel);
    const z = -dist * (isMobile ? 180 : 250); 
    const opacity = Math.max(0, 1 - dist * 0.5);
    const scale = i === centerIndex ? (isMobile ? 1.05 : 1.3) : Math.max(0.4, 1 - dist * 0.4);
    const rotateY = -rel * (isMobile ? 35 : 25); 
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
      onMouseEnter={() => !isMobile && setIsPaused(true)}
      onMouseLeave={() => !isMobile && setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div className="max-w-4xl mx-auto mb-8 md:mb-24 px-6">
        <div className="bg-[#0f0f0f]/40 backdrop-blur-2xl border border-white/5 rounded-full px-6 py-1 flex items-center gap-4 shadow-2xl">
          <div className="flex-1 flex items-center gap-3">
            <Search className="w-4 h-4 text-neutral-800" />
            <input 
              type="text" 
              placeholder="SEARCH ARCHIVE..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent py-3 text-[9px] uppercase tracking-[0.4em] font-bold outline-none placeholder:text-neutral-900 text-white/70"
            />
          </div>
          <div className="hidden md:flex items-center gap-10 border-l border-white/5 pl-10 font-mono text-[10px] uppercase tracking-widest text-neutral-600">
            {filtered.length} ARCHIVES
          </div>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="relative h-[480px] md:h-[750px] flex items-center justify-center overflow-visible touch-none"
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
           <motion.div 
              animate={{ 
                backgroundColor: activeProject?.themeColor || '#ffffff',
                opacity: [0.01, 0.04, 0.01]
              }}
              transition={{ duration: 6, repeat: Infinity }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1600px] h-[800px] rounded-full blur-[140px]" 
           />
        </div>

        <div className="relative w-full h-full flex items-center justify-center perspective-[2000px]">
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
                    rotateX: isCenter && !isMobile ? rotateActiveX : 0,
                    rotateY: isCenter && !isMobile ? rotateActiveY : rotateY,
                  }}
                  initial={false}
                  animate={{ 
                    x, y, z, opacity, scale, 
                    filter: isMobile ? 'none' : (isCenter ? 'blur(0px) saturate(1.1)' : `blur(${Math.abs(rel) * 10}px) saturate(0)`)
                  }}
                  transition={{ type: "spring", stiffness: 60, damping: 20 }}
                  onClick={() => isCenter ? navigate(`/portfolio/${p.id}`) : setCenterIndex(i)}
                >
                  <div className={`relative w-[220px] md:w-[360px] aspect-[9/14] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden group transition-all duration-700 ${isCenter ? 'shadow-[0_40px_100px_rgba(0,0,0,1)] ring-1 ring-white/10' : 'opacity-30'}`}>
                    <div className="absolute inset-0 bg-[#070707]" />
                    <motion.img 
                      style={{ scale: 1.2 }}
                      src={p.imageUrl} 
                      alt={p.title} 
                      className="w-full h-full object-cover grayscale-0" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent z-10" />
                    
                    <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-end text-center z-20">
                       <div className="space-y-3 md:space-y-6 mb-8 md:mb-12">
                          <div className="flex items-center justify-center gap-2">
                             <span className="text-white/30 scale-75">{getPlatformIcon(p)}</span>
                             <span className="text-[8px] md:text-[10px] uppercase tracking-[0.4em] font-mono text-white/40">{p.category}</span>
                          </div>
                          
                          <h3 className="text-xl md:text-5xl font-black uppercase tracking-tighter leading-[0.85] text-white">
                            {p.title}
                          </h3>
                       </div>

                       <div className="absolute bottom-6 md:bottom-10 left-6 md:left-10 right-6 md:right-10 flex justify-between items-center text-white/10 font-mono text-[8px] md:text-[10px]">
                          <span>0{i + 1}</span>
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

      <div className="flex flex-col items-center gap-8 md:gap-12 -mt-4 mb-20">
        <div className="flex items-center gap-8">
           <button 
            onClick={() => { handlePrev(); setIsPaused(true); }}
            className="p-4 rounded-full border border-white/5 text-neutral-800 hover:text-white transition-all active:scale-90"
           >
              <ChevronDown className="w-4 h-4 rotate-90" />
           </button>
           
           <div className="flex gap-2">
              {filtered.map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => { setCenterIndex(idx); setIsPaused(true); }}
                  className={`h-1 transition-all duration-500 rounded-full ${idx === centerIndex ? 'w-8 bg-white/40' : 'w-1.5 bg-white/5'}`}
                />
              ))}
           </div>

           <button 
            onClick={() => { handleNext(); setIsPaused(true); }}
            className="p-4 rounded-full border border-white/5 text-neutral-800 hover:text-white transition-all active:scale-90"
           >
              <ChevronDown className="w-4 h-4 -rotate-90" />
           </button>
        </div>

        <button 
          onClick={() => document.getElementById('grid-scan-mode')?.scrollIntoView({ behavior: 'smooth' })}
          className="group flex items-center gap-4 bg-white/5 border border-white/5 hover:bg-white hover:text-black px-8 py-4 rounded-full transition-all duration-500"
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span className="text-[9px] font-black uppercase tracking-[0.4em]">ARCHIVE LIST</span>
        </button>
      </div>
    </div>
  );
};

export default PremiumPortfolio;