import React, { useMemo, useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronDown, Terminal, Zap, Youtube, ExternalLink, X, Monitor } from 'lucide-react';
import { PROJECTS } from '../constants';
import VideoPlayer from '../components/VideoPlayer';
import { useAppContext } from '../contexts/AppContext';

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
        opacity: 1, 
        y: 0, 
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
    }
};

const ProjectDetail = () => {
  const { projectId } = useParams();
  const { activeVideoId, setActiveVideoId, setIsGlobalMuted } = useAppContext();
  const [isReelsMode, setIsReelsMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showYTPopup, setShowYTPopup] = useState(false);
  const reelsContainerRef = useRef<HTMLDivElement>(null);
  const popupTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const projectIndex = useMemo(() => 
    PROJECTS.findIndex((p) => p.id === projectId),
    [projectId]
  );
  
  const project = projectIndex !== -1 ? PROJECTS[projectIndex] : null;
  const nextProject = project ? PROJECTS[(projectIndex + 1) % PROJECTS.length] : null;

  // Show popup on mount for the project detail page
  useEffect(() => {
    if (project) {
      // Small delay before showing for a more organic entrance
      const initialDelay = setTimeout(() => {
        if (!isReelsMode) setShowYTPopup(true);
      }, 800);

      if (popupTimerRef.current) window.clearTimeout(popupTimerRef.current);
      popupTimerRef.current = window.setTimeout(() => {
          setShowYTPopup(false);
      }, 7000); 
      
      return () => clearTimeout(initialDelay);
    }
  }, [projectId, project, isReelsMode]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      if (popupTimerRef.current) window.clearTimeout(popupTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isReelsMode || !reelsContainerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const id = entry.target.getAttribute('data-reel-id');
            if (id && activeVideoId !== id) {
              setActiveVideoId(id);
            }
          }
        });
      },
      {
        root: reelsContainerRef.current,
        threshold: 0.5,
      }
    );

    const elements = reelsContainerRef.current.querySelectorAll('[data-reel-id]');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [isReelsMode, setActiveVideoId, activeVideoId]);

  if (!project || !nextProject) return null;

  const enterReelsMode = () => {
    setIsGlobalMuted(false); 
    setIsReelsMode(true);
    const firstId = `reel-${projectId}-0`;
    setActiveVideoId(firstId);
    
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    setShowYTPopup(false); 
  };

  const exitReelsMode = () => {
    setIsReelsMode(false);
    setActiveVideoId(null);
    
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  };

  const getYTUrl = (src: string) => `https://www.youtube.com/watch?v=${src}`;

  return (
    <motion.div initial="hidden" animate="visible" className="bg-background text-accent min-h-screen">
      
      {/* Universal Quality Popup - Hidden in Reels Mode */}
      <AnimatePresence>
        {showYTPopup && !isReelsMode && (
          <motion.div 
            initial={{ y: 50, x: "-50%", opacity: 0, scale: 0.95 }}
            animate={{ y: 0, x: "-50%", opacity: 1, scale: 1 }}
            exit={{ y: 20, x: "-50%", opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-10 left-1/2 z-[1000] w-[94%] max-w-lg pointer-events-none"
          >
            <div className="pointer-events-auto bg-neutral-900/90 backdrop-blur-3xl border border-white/10 p-6 md:p-8 rounded-[2.5rem] flex items-center justify-between gap-8 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9)] overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              
              <div className="flex items-center gap-5 md:gap-7">
                <div className="relative">
                  <div className="p-4 md:p-5 bg-white/5 rounded-[1.5rem] border border-white/5 flex items-center justify-center text-white/80 group">
                    <Monitor size={24} className="md:w-8 md:h-8" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full border-2 border-neutral-900 animate-pulse" />
                  </div>
                </div>
                
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] md:text-[11px] uppercase tracking-[0.4em] font-mono text-white/30">Optimization Advisory</span>
                  </div>
                  <h4 className="text-white font-black text-base md:text-xl uppercase tracking-tight leading-tight">High Fidelity Playback</h4>
                  <p className="text-white/60 text-[11px] md:text-[13px] font-medium leading-relaxed max-w-[300px]">
                    To experience this content in original 4K/60FPS quality, please redirect to the <span className="text-red-500 font-bold">YouTube</span> player.
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setShowYTPopup(false)}
                className="p-3 hover:bg-white/10 rounded-full transition-all group flex-shrink-0"
              >
                <X size={22} className="text-white/20 group-hover:text-white transition-colors" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isReelsMode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] bg-black h-[100dvh] w-full overflow-hidden"
          >
            {/* Header controls */}
            <div className={`absolute top-0 left-0 w-full z-[520] p-6 flex justify-between items-center ${isMobile ? 'bg-black/60 backdrop-blur-md' : 'bg-gradient-to-b from-black/95 to-transparent'} pointer-events-none`}>
              <div className="flex items-center gap-4">
                <button 
                   onClick={exitReelsMode}
                   className="pointer-events-auto p-2.5 bg-white/10 rounded-full text-white active:scale-90 transition-all border border-white/10"
                >
                  <ArrowLeft size={22} />
                </button>
                <div className="flex flex-col">
                   <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">{project.category}</span>
                   <h3 className="text-sm font-black uppercase tracking-tight text-white">{project.title}</h3>
                </div>
              </div>
            </div>

            <div 
              ref={reelsContainerRef}
              className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar bg-black"
              style={{ 
                WebkitOverflowScrolling: 'touch',
                scrollSnapType: 'y mandatory',
                overscrollBehavior: 'contain'
              }}
            >
              {project.gallery?.map((item, idx) => {
                const reelId = `reel-${projectId}-${idx}`;
                const isActive = activeVideoId === reelId;
                
                return (
                  <div 
                    key={idx} 
                    data-reel-id={reelId}
                    className="h-[100dvh] w-full snap-start snap-always relative flex items-center justify-center overflow-hidden"
                  >
                    <div className="w-full h-full md:h-[90dvh] md:max-w-[calc(90dvh*(9/16))] aspect-[9/16] bg-black shadow-2xl md:rounded-[3rem] overflow-hidden relative border border-white/5">
                      <div className="absolute inset-0 z-0 pointer-events-none">
                         <img 
                            src={project.imageUrl} 
                            alt="" 
                            className="w-full h-full object-cover opacity-10 blur-2xl scale-125"
                         />
                      </div>

                      {(!isMobile || isActive) ? (
                        <VideoPlayer 
                          type={item.type as 'youtube' | 'local'} 
                          src={item.src} 
                          autoplay={true}
                          isReelsMode={true}
                          reelId={reelId}
                          loop={true}
                        />
                      ) : (
                        <div className="w-full h-full bg-black/40 flex items-center justify-center z-10">
                          <img 
                             src={project.imageUrl} 
                             alt="" 
                             className="absolute inset-0 w-full h-full object-cover grayscale opacity-20" 
                          />
                          <div className="relative z-20 w-8 h-8 rounded-full border-2 border-white/10 border-t-white/40 animate-spin" />
                        </div>
                      )}
                    </div>
                    
                    {/* Metadata Overlay - No YouTube Button Here */}
                    <div className="absolute bottom-12 left-6 right-6 z-20 pointer-events-none flex flex-col gap-4 max-w-sm mx-auto">
                      <div className={`space-y-4 ${isMobile ? 'bg-black/95' : 'bg-black/50 backdrop-blur-xl'} p-8 rounded-[2.5rem] border border-white/10 inline-block self-start shadow-2xl w-full`}>
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase tracking-[0.4em] font-mono text-white/30 block">
                            SEGMENT {idx + 1} // {project.gallery?.length}
                          </span>
                          <h4 className="text-xl font-black uppercase tracking-tighter text-white">
                            {item.label || "Visual Archive"}
                          </h4>
                        </div>
                      </div>
                    </div>

                    {idx === 0 && (
                      <motion.div 
                        animate={{ y: [0, 10, 0] }}
                        transition={{ repeat: Infinity, duration: 2.5 }}
                        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/20 pointer-events-none"
                      >
                        <ChevronDown size={24} />
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="pt-24 px-6">
        <div className="container mx-auto">
            {project.isSeries ? (
              <div className="space-y-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                      <span className="text-[11px] uppercase tracking-[0.5em] font-mono opacity-50">Experimental Archive</span>
                    </div>
                    <h1 className="text-5xl md:text-[8vw] font-black uppercase tracking-tighter leading-[0.8]">{project.title}</h1>
                  </div>
                  
                  <button 
                    onClick={enterReelsMode}
                    className="group relative flex items-center gap-4 bg-white text-black px-10 py-5 rounded-full font-black text-xs uppercase tracking-[0.2em] active:scale-95 transition-all shadow-2xl hover:bg-neutral-200"
                  >
                    <Zap size={16} fill="currentColor" />
                    Enter Cinematic View
                  </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-16">
                  {project.gallery?.map((item, idx) => {
                    const reelId = `gallery-${project.id}-${idx}`;
                    return (
                      <div key={idx} className="space-y-4 md:space-y-6">
                        <motion.div 
                          variants={fadeUp} 
                          className="relative aspect-[9/16] rounded-[2rem] md:rounded-[3rem] overflow-hidden border border-white/5 bg-primary shadow-2xl group/card"
                        >
                          <VideoPlayer 
                            type={item.type as 'youtube' | 'local'} 
                            src={item.src} 
                            autoplay={false} 
                            reelId={reelId}
                          />
                        </motion.div>
                        {item.type === 'youtube' && (
                          <div className="flex justify-center">
                            <a 
                              href={getYTUrl(item.src)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full flex items-center justify-center gap-3 bg-white/[0.03] hover:bg-red-600 transition-all duration-300 py-3.5 md:py-4.5 rounded-full text-[9px] md:text-[11px] uppercase tracking-[0.3em] font-black text-white/20 hover:text-white border border-white/5 hover:border-red-600 active:scale-[0.97] group/btn"
                            >
                              <Youtube size={16} fill="currentColor" className="transition-colors md:w-5 md:h-5" />
                              <span className="transition-colors">WATCH ON YOUTUBE</span>
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-12">
                <div className="relative aspect-video rounded-[2rem] overflow-hidden border border-white/5 bg-primary shadow-2xl group/hero">
                    <VideoPlayer {...project.heroVideo} reelId={`hero-${project.id}`} />
                    {project.heroVideo.type === 'youtube' && (
                      <a 
                        href={getYTUrl(project.heroVideo.src)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`absolute bottom-4 right-4 md:bottom-8 md:right-8 z-40 bg-neutral-900/80 backdrop-blur-xl border border-white/10 hover:bg-red-600 hover:border-red-600 px-6 py-3 md:px-10 md:py-4 rounded-full text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_50px_rgba(220,38,38,0.4)] text-white/40 hover:text-white group/herobtn ${isMobile ? 'opacity-100' : 'opacity-0 group-hover/hero:opacity-100'}`}
                      >
                        <Youtube size={18} fill="currentColor" className="transition-colors md:w-5 md:h-5" />
                        WATCH FULL RESOLUTION
                      </a>
                    )}
                </div>
                <h1 className="text-5xl md:text-[9.5vw] font-black uppercase tracking-tighter leading-[0.8]">{project.title}</h1>
              </div>
            )}
        </div>
      </section>

      <section className="py-24 px-6 border-t border-white/5 mt-24">
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          <div className="lg:col-span-4 space-y-12">
            <div className="space-y-6">
              <span className="text-[10px] uppercase tracking-[0.8em] text-neutral-500 font-mono">Archive // Reference</span>
              <p className="text-neutral-400 leading-relaxed text-lg font-light">{project.description}</p>
            </div>
            <div className="space-y-6">
                <h4 className="text-[10px] uppercase tracking-[0.6em] text-accent/40 font-mono">Technical_Stack</h4>
                <div className="flex flex-wrap gap-3">
                  {project.details.techStack.map(t => (
                    <span key={t} className="px-4 py-2 bg-white/5 rounded-full text-[10px] uppercase tracking-widest border border-white/10 text-white/70 hover:bg-white/10 transition-colors">{t}</span>
                  ))}
                </div>
              </div>
          </div>
          <div className="lg:col-span-8">
            <div className="p-10 md:p-16 rounded-[3rem] bg-white/[0.01] border border-white/5 space-y-10 shadow-inner">
              <div className="flex items-center gap-4 text-accent/30">
                <Terminal size={22} />
                <span className="text-[11px] uppercase tracking-[0.8em] font-mono">Creative_Deep_Dive</span>
              </div>
              <p className="text-2xl md:text-4xl text-neutral-200 font-light leading-tight italic tracking-tight">
                "{project.details.analysis}"
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/5 pt-32 pb-40 px-6 text-center">
        <Link to={`/portfolio/${nextProject.id}`} className="group space-y-8 block">
          <span className="text-[11px] uppercase tracking-[1em] text-neutral-700 block">Next Artifact</span>
          <h2 className="text-5xl md:text-[9vw] font-black uppercase tracking-tighter leading-none group-hover:text-accent transition-colors duration-700">
            {nextProject.title}
          </h2>
          <div className="flex justify-center pt-8">
            <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-500 group-active:scale-90 shadow-xl">
              <ArrowLeft size={24} className="rotate-[135deg]" />
            </div>
          </div>
        </Link>
      </section>
      
      <footer className="py-20 text-center opacity-30">
        <Link to="/portfolio" className="text-[10px] uppercase tracking-[0.6em] font-mono inline-flex items-center gap-4 hover:opacity-100 transition-opacity">
          <ArrowLeft size={12} /> Return to archive
        </Link>
      </footer>
    </motion.div>
  );
};

export default ProjectDetail;