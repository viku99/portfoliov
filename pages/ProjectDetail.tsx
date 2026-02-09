
import React, { useMemo, useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X, ChevronDown, Terminal, Zap, Volume2, VolumeX } from 'lucide-react';
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
  const { setActiveVideoId, setIsGlobalMuted, isGlobalMuted } = useAppContext();
  const [isReelsMode, setIsReelsMode] = useState(false);
  const reelsContainerRef = useRef<HTMLDivElement>(null);

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
          if (entry.isIntersecting && entry.intersectionRatio >= 0.7) {
            const id = entry.target.getAttribute('data-reel-id');
            if (id) setActiveVideoId(id);
          }
        });
      },
      {
        root: reelsContainerRef.current,
        threshold: 0.7,
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
            <div className="absolute top-0 left-0 w-full z-[220] p-6 flex justify-between items-center bg-gradient-to-b from-black/90 to-transparent pointer-events-none">
              <div className="flex items-center gap-3">
                <button 
                   onClick={exitReelsMode}
                   className="pointer-events-auto p-2 bg-white/10 backdrop-blur-2xl rounded-full text-white active:scale-90"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="flex flex-col">
                   <span className="text-[10px] font-black uppercase tracking-widest text-white/50">{project.category}</span>
                   <h3 className="text-xs font-bold uppercase tracking-tight text-white">{project.title}</h3>
                </div>
              </div>
              
              <button 
                onClick={() => setIsGlobalMuted(!isGlobalMuted)}
                className="pointer-events-auto p-3 bg-white/10 backdrop-blur-2xl rounded-full text-white active:scale-90"
              >
                {isGlobalMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
            </div>

            <div 
              ref={reelsContainerRef}
              className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar bg-black"
            >
              {project.gallery?.map((item, idx) => {
                const reelId = `reel-${projectId}-${idx}`;
                return (
                  <div 
                    key={idx} 
                    data-reel-id={reelId}
                    className="h-[100dvh] w-full snap-start relative flex items-center justify-center overflow-hidden"
                  >
                    <div className="w-full h-full md:max-w-[420px] md:h-[90vh] aspect-[9/16] bg-neutral-900 shadow-2xl md:rounded-[2.5rem] overflow-hidden relative">
                      <VideoPlayer 
                        type={item.type as 'youtube' | 'local'} 
                        src={item.src} 
                        autoplay={idx === 0}
                        isReelsMode={true}
                        reelId={reelId}
                      />
                    </div>
                    
                    <div className="absolute bottom-10 left-6 right-6 z-20 pointer-events-none flex flex-col gap-4 max-w-md mx-auto">
                      <div className="space-y-1 bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/5 inline-block self-start">
                        <span className="text-[9px] uppercase tracking-[0.4em] font-mono text-white/40 block">
                          ITEM 0{idx + 1} / {project.gallery?.length}
                        </span>
                        <h4 className="text-base font-black uppercase tracking-tighter text-white">
                          {item.label || "Visual Proof"}
                        </h4>
                      </div>
                    </div>

                    {idx === 0 && (
                      <motion.div 
                        animate={{ y: [0, 6, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/20 pointer-events-none"
                      >
                        <ChevronDown size={18} />
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
              <div className="space-y-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                      <span className="text-[10px] uppercase tracking-[0.4em] font-mono opacity-50">Active Series</span>
                    </div>
                    <h1 className="text-4xl md:text-[7vw] font-black uppercase tracking-tighter leading-[0.85]">{project.title}</h1>
                  </div>
                  
                  <button 
                    onClick={enterReelsMode}
                    className="group relative flex items-center gap-4 bg-white text-black px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all shadow-xl"
                  >
                    <Zap size={14} fill="currentColor" />
                    Enter Reels Mode
                  </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
                  {project.gallery?.map((item, idx) => {
                    const reelId = `gallery-${project.id}-${idx}`;
                    return (
                      <motion.div 
                        key={idx} 
                        variants={fadeUp} 
                        className="relative aspect-[9/14] rounded-2xl md:rounded-3xl overflow-hidden border border-white/5 bg-primary shadow-xl group/card"
                      >
                        <VideoPlayer 
                          type={item.type as 'youtube' | 'local'} 
                          src={item.src} 
                          autoplay={false} 
                          reelId={reelId}
                          className="scale-100 group-hover/card:scale-105 transition-transform duration-700" 
                        />
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-10">
                <motion.div layoutId={`project-container-${project.id}`} className="relative aspect-video rounded-3xl overflow-hidden border border-white/5 bg-primary shadow-2xl">
                    <VideoPlayer {...project.heroVideo} showControls={true} reelId={`hero-${project.id}`} />
                </motion.div>
                <h1 className="text-4xl md:text-[9vw] font-black uppercase tracking-tighter leading-[0.85]">{project.title}</h1>
              </div>
            )}
        </div>
      </section>

      <section className="py-24 px-6 border-t border-white/5 mt-24">
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-4 space-y-10">
            <div className="space-y-4">
              <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-mono">Archive_Ref</span>
              <p className="text-neutral-400 leading-relaxed text-base">{project.description}</p>
            </div>
            <div className="space-y-4">
                <h4 className="text-[10px] uppercase tracking-[0.4em] text-accent/40 font-mono">Software_Stack</h4>
                <div className="flex flex-wrap gap-2">
                  {project.details.techStack.map(t => (
                    <span key={t} className="px-3 py-1.5 bg-white/5 rounded-full text-[9px] uppercase tracking-widest border border-white/10 text-white/60">{t}</span>
                  ))}
                </div>
              </div>
          </div>
          <div className="lg:col-span-8">
            <div className="p-8 md:p-12 rounded-[2rem] bg-white/[0.01] border border-white/5 space-y-8">
              <div className="flex items-center gap-4 text-accent/30">
                <Terminal size={18} />
                <span className="text-[10px] uppercase tracking-[0.6em] font-mono">Process_Analysis</span>
              </div>
              <p className="text-xl md:text-3xl text-neutral-200 font-light leading-tight italic">
                "{project.details.analysis}"
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/5 pt-24 pb-32 px-6 text-center">
        <Link to={`/portfolio/${nextProject.id}`} className="group space-y-6 block">
          <span className="text-[10px] uppercase tracking-[1em] text-neutral-600 block">Next_Artifact</span>
          <h2 className="text-4xl md:text-[8vw] font-black uppercase tracking-tighter leading-none group-hover:text-accent transition-colors duration-500">
            {nextProject.title}
          </h2>
          <div className="flex justify-center pt-6">
            <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-active:scale-90 transition-all">
              <ArrowLeft size={20} className="rotate-[135deg]" />
            </div>
          </div>
        </Link>
      </section>
      
      <footer className="py-16 text-center opacity-30">
        <Link to="/portfolio" className="text-[9px] uppercase tracking-[0.5em] font-mono inline-flex items-center gap-3">
          <ArrowLeft size={10} /> Return to archive
        </Link>
      </footer>
    </motion.div>
  );
};

export default ProjectDetail;
