
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Project } from '../types';
import { Search, LayoutGrid, ChevronDown } from 'lucide-react';

interface PremiumPortfolioProps {
  projects: Project[];
}

// Layout Constants
const RING_RADIUS_X = 720;
const RING_RADIUS_Y = 120; 
const VISIBLE_RANGE = 3; // Number of cards to show on each side

const PremiumPortfolio: React.FC<PremiumPortfolioProps> = ({ projects }) => {
  const navigate = useNavigate();
  const [centerIndex, setCenterIndex] = useState(0);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const lastWheelTime = useRef(0);
  
  // Filter logic
  const filtered = useMemo(() => {
    if (!query.trim()) return projects;
    const q = query.toLowerCase();
    return projects.filter(p => 
      p.title.toLowerCase().includes(q) || 
      p.category.toLowerCase().includes(q)
    );
  }, [projects, query]);

  // Handle bounds and reset if filtered list changes
  useEffect(() => {
    setCenterIndex(0);
  }, [filtered.length]);

  // Movement Helpers with Wrapping
  const handleNext = () => {
    if (filtered.length === 0) return;
    setCenterIndex(prev => (prev + 1) % filtered.length);
  };
  
  const handlePrev = () => {
    if (filtered.length === 0) return;
    setCenterIndex(prev => (prev - 1 + filtered.length) % filtered.length);
  };

  // Native Wheel Handling to prevent page scroll
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = Date.now();
      if (now - lastWheelTime.current < 450) return;
      
      const dominantDelta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (Math.abs(dominantDelta) < 15) return;

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
  }, [filtered.length]);

  // Positional logic for the "Orbit" with Circular Wrapping
  const getCardProps = (i: number) => {
    const L = filtered.length;
    if (L === 0) return null;

    // Calculate shortest distance in a circular array
    let rel = i - centerIndex;
    if (rel > L / 2) rel -= L;
    if (rel < -L / 2) rel += L;

    const angleStep = 0.45; 
    const angle = rel * angleStep;
    
    const x = Math.sin(angle) * RING_RADIUS_X;
    const y = -Math.cos(angle) * RING_RADIUS_Y + (RING_RADIUS_Y);
    
    const dist = Math.abs(rel);
    const z = -dist * 250; 
    const opacity = Math.max(0, 1 - dist * 0.28);
    const scale = i === centerIndex ? 1.2 : Math.max(0.3, 1 - dist * 0.2);
    const rotateY = -rel * 25; 
    const zIndex = 100 - Math.round(dist * 10);
    
    return { x, y, z, opacity, scale, rotateY, zIndex, rel };
  };

  return (
    <div className="w-full relative select-none">
      {/* Search Bar */}
      <div className="max-w-4xl mx-auto mb-20 px-6">
        <div className="bg-[#0f0f0f]/60 backdrop-blur-2xl border border-white/5 rounded-full px-8 py-1.5 flex items-center gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="flex-1 flex items-center gap-4">
            <Search className="w-4 h-4 text-neutral-600" />
            <input 
              type="text" 
              placeholder="SEARCH PROJECT..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent py-4 text-[10px] uppercase tracking-[0.3em] font-bold outline-none placeholder:text-neutral-700 text-white"
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
        className="relative h-[700px] flex items-center justify-center overflow-visible touch-none"
      >
        {/* Glow & Atmosphere */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
           <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/[0.03] z-0" />
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1600px] h-[800px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)] rounded-full blur-[140px]" />
        </div>

        {/* Cards Container */}
        <div className="relative w-full h-full flex items-center justify-center perspective-[2500px]">
          <AnimatePresence mode="popLayout">
            {filtered.map((p, i) => {
              const props = getCardProps(i);
              if (!props) return null;
              
              const { x, y, z, opacity, scale, rotateY, zIndex, rel } = props;
              const isCenter = i === centerIndex;
              
              // Only render cards within a certain relative distance
              if (Math.abs(rel) > VISIBLE_RANGE) return null;

              return (
                <motion.div
                  key={p.id}
                  className="absolute cursor-pointer will-change-transform"
                  style={{ zIndex }}
                  initial={false}
                  animate={{ 
                    x, 
                    y, 
                    z, 
                    opacity, 
                    scale, 
                    rotateY,
                    filter: isCenter ? 'blur(0px) saturate(1)' : `blur(${Math.abs(rel) * 2}px) saturate(0)`
                  }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 70, 
                    damping: 20, 
                    mass: 1 
                  }}
                  onClick={() => {
                    if (isCenter) navigate(`/portfolio/${p.id}`);
                    else setCenterIndex(i);
                  }}
                >
                  <div className={`relative w-[280px] md:w-[320px] aspect-[9/13] rounded-2xl overflow-hidden group transition-all duration-700 ${isCenter ? 'shadow-[0_40px_120px_rgba(0,0,0,1)] ring-1 ring-white/20' : 'opacity-40 hover:opacity-60'}`}>
                    
                    <div className="absolute inset-0 bg-[#0a0a0a]" />

                    <img 
                      src={p.imageUrl} 
                      alt={p.title} 
                      className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110" 
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    
                    <div className="absolute inset-0 p-8 flex flex-col justify-end text-center">
                       <div className="space-y-3 mb-10">
                          <div className="flex items-center justify-center gap-2">
                             <div className="h-[1px] w-4 bg-white/20" />
                             <span className="text-[8px] uppercase tracking-[0.4em] font-mono text-white/50">{p.category}</span>
                             <div className="h-[1px] w-4 bg-white/20" />
                          </div>
                          <h3 className="text-xl md:text-3xl font-black uppercase tracking-tighter leading-none text-white">{p.title}</h3>
                       </div>

                       <div className="absolute bottom-8 left-8 right-8 flex justify-between items-center text-white/20 font-mono text-[9px]">
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
      <div className="flex flex-col items-center gap-12 -mt-10 mb-20">
        <div className="flex items-center gap-8">
           <button 
            onClick={handlePrev}
            className="p-4 rounded-full border border-white/5 text-neutral-600 hover:text-white hover:bg-white/10 transition-all active:scale-90"
           >
              <ChevronDown className="w-4 h-4 rotate-90" />
           </button>
           
           <div className="flex gap-2.5">
              {filtered.map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => setCenterIndex(idx)}
                  className={`h-1 transition-all duration-700 rounded-full ${idx === centerIndex ? 'w-10 bg-accent' : 'w-2 bg-white/10 hover:bg-white/20'}`}
                />
              ))}
           </div>

           <button 
            onClick={handleNext}
            className="p-4 rounded-full border border-white/5 text-neutral-600 hover:text-white hover:bg-white/10 transition-all active:scale-90"
           >
              <ChevronDown className="w-4 h-4 -rotate-90" />
           </button>
        </div>

        <button 
          onClick={() => {
            const gridSection = document.getElementById('grid-scan-mode');
            gridSection?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="group flex items-center gap-5 bg-white/5 border border-white/10 hover:bg-accent hover:border-accent hover:text-background px-12 py-5 rounded-full transition-all duration-700"
        >
          <LayoutGrid className="w-4 h-4 transition-transform group-hover:rotate-180" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">EXPLORE ALL ARCHIVES</span>
        </button>
      </div>
    </div>
  );
};

export default PremiumPortfolio;
