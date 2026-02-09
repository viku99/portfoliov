import React, { useMemo, useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronDown, Terminal, Zap } from 'lucide-react';
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
  const reelsContainerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsReelsMode(false);
    setActiveVideoId(null);
  }, [projectId, setActiveVideoId]);

  useEffect(() => {
    if (!isReelsMode || !reelsContainerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const id = entry.target.getAttribute('data-reel-id');
            if (id) setActiveVideoId(id);
          }
        });
      },
      {
        root: reelsContainerRef.current,
        threshold: 0.6,
      }
    );

    const elements = reelsContainerRef.current.querySelectorAll('[data-reel-id]');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [isReelsMode, setActiveVideoId]);

  if (!project || !nextProject) return null;

  const enterReelsMode = () => {
    setIsGlobalMuted(false); 
    setIsReelsMode(true);
    const firstId = `reel-${projectId}-0`;
    setActiveVideoId(firstId);
    document.body.style.overflow = 'hidden';
  };

  const exitReelsMode = () => {
    setIsReelsMode(false);
    setActiveVideoId(null);
    document.body.style.overflow = 'auto';
  };

  return (
    <motion.div initial="hidden" animate="visible" className="bg-background text-accent min-h-screen">
      
      <AnimatePresence>
        {isReelsMode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black h-[100dvh] w-full"
          >
            {/* Minimal Header - Solid bg on mobile for performance */}
            <div className={`absolute top-0 left-0 w-full z-[220] p-6 flex justify-between items-center ${isMobile ? 'bg-black' : 'bg-gradient-to-b from-black/95 to-transparent backdrop-blur-sm'} pointer-events-none`}>
              <div className="flex items-center gap-4">
                <button 
                   onClick={exitReelsMode}
                   className="pointer-events-auto p-2.5 bg-white/10 rounded-full text-white active:scale-90 transition-all"
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
            >
              {project.gallery?.map((item, idx) => {
                const reelId = `reel-${projectId}-${idx}`;
                const isActive = activeVideoId === reelId;
                
                return (
                  <div 
                    key={idx} 
                    data-reel-id={reelId}
                    className="h-[100dvh] w-full snap-start relative flex items-center justify-center overflow-hidden"
                  >
                    {/* Perfect 9:16 Responsive Container */}
                    <div className="w-full h-full md:max-w-[calc(100dvh*(9/16))] aspect-[9/16] bg-[#050505] shadow-2xl md:rounded-[3rem] overflow-hidden relative border border-white/5">
                      {/* VIRTUALIZATION: Only mount VideoPlayer if it is the active one to prevent mobile memory/lag issues */}
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
                        <div className="w-full h-full bg-black flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-white/40 animate-spin" />
                        </div>
                      )}
                    </div>
                    
                    <div className="absolute bottom-12 left-6 right-6 z-20 pointer-events-none flex flex-col gap-4 max-w-sm mx-auto">
                      <div className={`space-y-1.5 ${isMobile ? 'bg-black/90' : 'bg-black/50 backdrop-blur-xl'} p-5 rounded-3xl border border-white/10 inline-block self-start shadow-2xl`}>
                        <span className="text-[9px] uppercase tracking-[0.4em] font-mono text-white/30 block">
                          SEGMENT {idx + 1} // {project.gallery?.length}
                        </span>
                        <h4 className="text-lg font-black uppercase tracking-tighter text-white">
                          {item.label || "Visual Archive"}
                        </h4>
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
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
                  {project.gallery?.map((item, idx) => {
                    const reelId = `gallery-${project.id}-${idx}`;
                    return (
                      <motion.div 
                        key={idx} 
                        variants={fadeUp} 
                        className="relative aspect-[9/15] rounded-3xl overflow-hidden border border-white/5 bg-primary shadow-xl group/card"
                      >
                        <VideoPlayer 
                          type={item.type as 'youtube' | 'local'} 
                          src={item.src} 
                          autoplay={false} 
                          reelId={reelId}
                        />
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-12">
                <motion.div 
                   layoutId={isMobile ? undefined : `project-container-${project.id}`} 
                   className="relative aspect-video rounded-[2rem] overflow-hidden border border-white/5 bg-primary shadow-2xl"
                >
                    <VideoPlayer {...project.heroVideo} reelId={`hero-${project.id}`} />
                </motion.div>
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