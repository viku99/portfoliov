
import { Project } from './types';

// ============================================================================
// SITE CONFIGURATION
// ============================================================================

export const SOCIAL_LINKS = [
  { name: 'LinkedIn', href: "https://www.linkedin.com/in/vikasbala19" },
  { name: 'Behance', href: "https://www.behance.net/vikasbala" },
  { name: 'Github', href: "https://github.com/viku99" },
  { name: 'Instagram', href: "https://www.instagram.com/zorox.x_" },
];

export const SITE_INFO = {
  name: "VIKAS",
  role: "Visual Storyteller",
  tagline: "Designing attention through motion and cinematic visual narratives.",
  showreelId: "CPnMek8iU1U",
  domain: "vikasbala.in"
};

// ============================================================================
// PROJECT DATA
// ============================================================================

export const PROJECTS: Project[] = [
  {
    id: "cyber-runner",
    title: "CYBER RUNNER",
    category: "AMV",
    description: "High-octane rhythmic edit exploring futuristic urban landscapes.",
    imageUrl: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&q=80&w=1200",
    cardPreviewVideo: { type: 'youtube', src: 'CPnMek8iU1U' },
    heroVideo: { type: 'youtube', src: 'CPnMek8iU1U' },
    details: {
      role: "Editor",
      techStack: ["After Effects", "Premiere Pro"],
      year: 2025,
      analysis: "Focused on kinetic typography and frame-perfect audio sync."
    }
  },
  {
    id: "sync-escape",
    title: "SYNC: ESCAPE",
    category: "Motion design",
    description: "Visualizing the feeling of digital liberation through fluid motion.",
    imageUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=1200",
    cardPreviewVideo: { type: 'youtube', src: 'CPnMek8iU1U' },
    heroVideo: { type: 'youtube', src: 'CPnMek8iU1U' },
    details: {
      role: "Motion Designer",
      techStack: ["Cinema 4D", "Redshift"],
      year: 2025,
      analysis: "Exploring organic shapes within a digital void."
    }
  },
  {
    id: "mg-shining-star",
    title: "MG - SHINING STAR",
    category: "AMV",
    description: "A tribute to classic motion graphics through contemporary anime editing.",
    imageUrl: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=1200",
    cardPreviewVideo: { type: 'youtube', src: 'CPnMek8iU1U' },
    heroVideo: { type: 'youtube', src: 'CPnMek8iU1U' },
    details: {
      role: "Editor",
      techStack: ["After Effects"],
      year: 2024,
      analysis: "Synthesizing vector graphics with high-fidelity footage."
    }
  },
  {
    id: "striking-bold",
    title: "STRIKING BOLD",
    category: "Motion design",
    description: "Heavy typography and high-contrast visuals for a sports broadcast opener.",
    imageUrl: "https://images.unsplash.com/photo-1541462608141-ad6034e40263?auto=format&fit=crop&q=80&w=1200",
    cardPreviewVideo: { type: 'youtube', src: 'CPnMek8iU1U' },
    heroVideo: { type: 'youtube', src: 'CPnMek8iU1U' },
    details: {
      role: "Lead Motion Designer",
      techStack: ["After Effects", "Illustrator"],
      year: 2024,
      analysis: "Maximizing impact through bold color palettes and aggressive easing."
    }
  },
  {
    id: "gravity",
    title: "GRAVITY",
    category: "Short Film",
    description: "An experimental short exploring weightlessness and isolation.",
    imageUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=1200",
    cardPreviewVideo: { type: 'youtube', src: 'CPnMek8iU1U' },
    heroVideo: { type: 'youtube', src: 'CPnMek8iU1U' },
    details: {
      role: "Director",
      techStack: ["Unreal Engine 5", "DaVinci Resolve"],
      year: 2025,
      analysis: "Cinematic storytelling within a real-time environment."
    }
  },
  {
    id: "akira-tribute",
    title: "AKIRA TRIBUTE",
    category: "AMV",
    description: "Remastering the visual energy of Akira for the modern age.",
    imageUrl: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?auto=format&fit=crop&q=80&w=1200",
    cardPreviewVideo: { type: 'youtube', src: 'CPnMek8iU1U' },
    heroVideo: { type: 'youtube', src: 'CPnMek8iU1U' },
    details: {
      role: "Editor",
      techStack: ["After Effects", "Premiere Pro"],
      year: 2023,
      analysis: "Enhancing frame-by-frame animation with custom lighting effects."
    }
  },
  {
    id: "guardian",
    title: "GUARDIAN",
    category: "VFX",
    description: "Complex character integration and environment replacement.",
    imageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=1200",
    cardPreviewVideo: { type: 'youtube', src: 'CPnMek8iU1U' },
    heroVideo: { type: 'youtube', src: 'CPnMek8iU1U' },
    details: {
      role: "VFX Artist",
      techStack: ["Nuke", "Cinema 4D", "X-Particles"],
      year: 2025,
      analysis: "Seamlessly blending real-world photography with high-end digital assets."
    }
  }
];
