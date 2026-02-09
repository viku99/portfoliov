
import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Github, Linkedin, Instagram, Briefcase, Target, Zap, Cpu, Activity, Layout, Sparkles, TrendingUp } from 'lucide-react';
import { SOCIAL_LINKS, SITE_INFO } from '../constants';

const USER_PHOTO = "https://i.postimg.cc/52X4J8tj/moonji.jpg"; 

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1, ease: [0.22, 1, 0.36, 1] },
  },
};

const expertiseData = [
  {
    category: 'Creative Direction',
    skills: [
      { name: 'Motion Narrative', level: 95, label: 'Advanced' },
      { name: 'Visual Concepting', level: 90, label: 'Advanced' },
      { name: 'Art Direction', level: 85, label: 'Inter–Adv' },
    ],
  },
  {
    category: 'Technical Execution',
    skills: [
      { name: 'After Effects / Compositing', level: 98, label: 'Advanced' },
      { name: 'Editorial Rhythm', level: 95, label: 'Advanced' },
      { name: 'VFX & Color', level: 75, label: 'Intermediate' },
    ],
  },
];

const SignatureMethodology = [
    {
        title: "Frame-Data Analysis",
        desc: "Strict adherence to sub-frame audio transients to ensure absolute synchronization.",
        icon: <Cpu className="w-5 h-5" />
    },
    {
        title: "Kinetic Physics",
        desc: "Manual curve-editing in the Graph Editor to simulate real-world weight.",
        icon: <Activity className="w-5 h-5" />
    },
    {
        title: "Modular Comps",
        desc: "Building dynamic, automated workflows for rapid cinematic results.",
        icon: <Layout className="w-5 h-5" />
    }
];

const SkillBar: React.FC<{ name: string; level: number; label: string }> = ({ name, level, label }) => (
  <div className="mb-6 group">
    <div className="flex justify-between items-end mb-2">
      <div className="flex flex-col">
        <h4 className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] text-neutral-500 font-mono group-hover:text-accent transition-colors">{name}</h4>
      </div>
      <span className="text-[7px] md:text-[8px] font-mono text-neutral-700 tracking-widest">{label}</span>
    </div>
    <div className="h-[1px] md:h-[2px] w-full bg-white/5 overflow-hidden">
      <motion.div
        className="h-full bg-accent"
        initial={{ width: 0 }}
        whileInView={{ width: `${level}%` }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  </div>
);

const About = () => {
  const socialIcons: { [key: string]: React.ReactNode } = {
    LinkedIn: <Linkedin className="w-4 h-4 md:w-5 md:h-5" />,
    Behance: <Briefcase className="w-4 h-4 md:w-5 md:h-5" />,
    Github: <Github className="w-4 h-4 md:w-5 md:h-5" />,
    Instagram: <Instagram className="w-4 h-4 md:w-5 md:h-5" />,
  };

  return (
    <div className="bg-background min-h-screen selection:bg-accent selection:text-background pb-20">
      <section className="pt-24 md:pt-40 pb-12 md:pb-20 px-6">
        <div className="container mx-auto">
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-24 items-center"
            >
                <motion.div variants={itemVariants} className="lg:col-span-5 relative group order-2 lg:order-1 max-w-md mx-auto lg:max-w-none">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-primary shadow-2xl">
                        <img 
                            src={USER_PHOTO} 
                            alt="Vikas" 
                            className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-1000 ease-in-out scale-105 group-hover:scale-100"
                        />
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_2px,3px_100%] z-10" />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="lg:col-span-7 order-1 lg:order-2 text-center lg:text-left">
                    <div className="space-y-4 md:space-y-6">
                        <div className="flex items-center justify-center lg:justify-start gap-4 text-accent/40 mb-2">
                            <span className="text-[8px] md:text-[10px] uppercase tracking-[0.4em] md:tracking-[0.8em] font-mono">Archive // Identity</span>
                            <div className="h-[1px] w-8 md:w-12 bg-accent/20" />
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85]">
                            Vikas <br className="hidden md:block" /> <span className="text-neutral-700">Bala</span>
                        </h1>
                        <p className="text-base md:text-3xl text-neutral-400 font-light tracking-tight max-w-xl mx-auto lg:mx-0 leading-relaxed">
                            A <span className="text-accent">{SITE_INFO.role}</span> obsessed with frame-perfect timing and cinematic emotion.
                        </p>
                        
                        <div className="flex flex-wrap justify-center lg:justify-start gap-5 md:gap-8 pt-6 md:pt-8">
                            {SOCIAL_LINKS.map(link => (
                                <a 
                                    key={link.name} 
                                    href={link.href} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="flex items-center gap-2 text-neutral-600 hover:text-accent transition-all group"
                                >
                                    <div className="p-2.5 md:p-3 bg-white/5 rounded-full group-hover:bg-accent group-hover:text-background transition-all">
                                        {socialIcons[link.name]}
                                    </div>
                                    <span className="text-[8px] uppercase tracking-widest font-mono hidden md:block">{link.name}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-32 px-6 border-t border-white/5">
        <div className="container mx-auto">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 md:gap-16">
                <div className="flex flex-col items-center lg:items-start gap-4">
                    <div className="flex items-center gap-3 text-neutral-500">
                        <Zap className="w-4 h-4 md:w-5 md:h-5" />
                        <h2 className="text-[10px] md:text-[12px] uppercase tracking-[0.6em] font-black">Expertise</h2>
                    </div>
                </div>
                <div className="lg:col-span-2 space-y-16 md:space-y-24">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
                        {expertiseData.map((group) => (
                            <div key={group.category} className="space-y-6 md:space-y-10">
                                <h3 className="text-[8px] md:text-[10px] uppercase tracking-[0.4em] text-accent/40 font-mono flex items-center gap-4 justify-center md:justify-start">
                                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                                    {group.category}
                                </h3>
                                <div>
                                    {group.skills.map((skill) => (
                                        <SkillBar key={skill.name} name={skill.name} level={skill.level} label={skill.label} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-12">
                        <div className="p-6 md:p-8 bg-white/[0.02] border border-white/5 rounded-2xl md:rounded-3xl space-y-4">
                            <div className="flex items-center gap-3 text-accent/40">
                                <Sparkles className="w-3.5 h-3.5" />
                                <h4 className="text-[8px] md:text-[10px] uppercase tracking-[0.3em] font-mono">Strengths</h4>
                            </div>
                            <p className="text-[11px] md:text-sm text-neutral-400 leading-relaxed">
                                Pacing, timing, editorial rhythm, and clean technical execution.
                            </p>
                        </div>
                        <div className="p-6 md:p-8 bg-white/[0.02] border border-white/5 rounded-2xl md:rounded-3xl space-y-4">
                            <div className="flex items-center gap-3 text-accent/40">
                                <TrendingUp className="w-3.5 h-3.5" />
                                <h4 className="text-[8px] md:text-[10px] uppercase tracking-[0.3em] font-mono">Focus</h4>
                            </div>
                            <p className="text-[11px] md:text-sm text-neutral-400 leading-relaxed">
                                Expanding advanced VFX workflows & cinematic color pipelines.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-10 md:space-y-12">
                        <h3 className="text-[8px] md:text-[10px] uppercase tracking-[0.4em] text-accent/40 font-mono flex items-center gap-4 justify-center md:justify-start">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                            Methodologies
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                            {SignatureMethodology.map((item) => (
                                <div key={item.title} className="p-6 md:p-8 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4 hover:bg-white/[0.05] transition-colors group">
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-accent/30 group-hover:text-accent transition-colors">
                                        {item.icon}
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-[10px] md:text-xs font-bold uppercase tracking-widest">{item.title}</h4>
                                        <p className="text-[9px] md:text-[11px] leading-relaxed text-neutral-500">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      <section className="py-20 md:py-40 px-6 bg-white/[0.01]">
        <div className="container mx-auto text-center">
            <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="max-w-4xl mx-auto space-y-10">
                <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter">Ready to <span className="text-accent/30">ignite</span> your vision?</h2>
                <Link to="/contact" className="inline-flex items-center gap-4 px-10 py-5 md:py-6 bg-accent text-background rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform">
                    Initialize Contact
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                </Link>
            </motion.div>
        </div>
      </section>

      <footer className="py-12 flex flex-col items-center gap-6 opacity-40">
        <div className="text-[7px] md:text-[9px] uppercase tracking-[0.8em] text-neutral-600">Identity Archive // VB-2025</div>
      </footer>
    </div>
  );
};

export default About;
