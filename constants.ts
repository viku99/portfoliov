
import { Project } from './types';

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

export const PROJECTS: Project[] = [
  {
    id: "instagram-reel-edits",
    title: "VERTICAL SOCIAL CONTENT",
    category: "Social Media",
    platform: 'instagram',
    themeColor: "#E1306C",
    isSeries: true,
    description: "High-energy short-form content designed for maximum engagement. This collection showcases dynamic editing techniques optimized for the fast-paced nature of Instagram Reels and YouTube Shorts.",
    imageUrl: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=1200",
    cardPreviewVideo: { type: 'youtube', src: 'YrKrMnNG9qs' },
    heroVideo: { type: 'youtube', src: 'YrKrMnNG9qs' },
    gallery: [
      { type: 'youtube', src: 'YrKrMnNG9qs', label: 'Dynamic Motion 01' },
      { type: 'youtube', src: 'FJfR3MZJF0s', label: 'Visual Rhythm 02' }
    ],
    details: {
      role: "Motion Designer & Editor",
      techStack: ["After Effects", "Premiere Pro"],
      year: 2025,
      analysis: "The focus of this series was to master the 'hook'—capturing viewer attention within the first 1.5 seconds. I utilized aggressive speed ramping, rhythmic jump cuts, and custom motion graphics to create a seamless flow that keeps the viewer engaged. Each edit is precisely synchronized with audio transients to enhance the tactile feel of the visuals."
    }
  },
  {
    id: "eyewear-ad-series",
    title: "EYEWEAR AD SERIES",
    category: "Commercial",
    platform: 'youtube',
    themeColor: "#D4AF37",
    isSeries: true,
    description: "Eyewear Advertisement Video Series. A collection of short-form eyewear advertisement videos created with a focus on clean visuals, strong product presence, and platform-ready pacing for social media.",
    imageUrl: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&q=80&w=1200",
    cardPreviewVideo: { type: 'youtube', src: 'f6iuy43bH_c' },
    heroVideo: { type: 'youtube', src: 'f6iuy43bH_c' },
    gallery: [
      { type: 'youtube', src: 'f6iuy43bH_c', label: 'Luxe Frame 01' },
      { type: 'youtube', src: 'rs6GKOwx3Nk', label: 'Urban Silhouette 02' },
      { type: 'youtube', src: 'IQgDgnhNAGc', label: 'Classic Detail 03' },
      { type: 'youtube', src: '4ZBInDJCYxw', label: 'Premium Finish 04' },
      { type: 'youtube', src: 'Xd1u0Nq2OPo', label: 'Visual Impact 05' },
      { type: 'youtube', src: 'zIQeQ7u3jjg', label: 'Cinematic Frame 06' },
      { type: 'youtube', src: 'OPWKwNWvvDg', label: 'Modern Edge 07' },
      { type: 'youtube', src: 'fRXgk7cRHN0', label: 'Classic Look 08' },
      { type: 'youtube', src: 'Pd0-FhXhBrI', label: 'Urban Style 09' },
      { type: 'youtube', src: 'vUv6pDNBOGo', label: 'Premium Flow 10' }
    ],
    details: {
      role: "Visual Designer & Editor",
      techStack: ["After Effects", "Nano Banana", "Photoshop"],
      year: 2025,
      analysis: `This project is a collection of short-form eyewear advertisement videos created with a focus on clean visuals, strong product presence, and platform-ready pacing for social media. The objective was to refine eyewear visuals and convert them into polished, ad-ready videos, emphasizing frame design, clarity, and a premium retail aesthetic.

Workflow & Tools Used:
- Adobe After Effects for video editing, motion refinement, transitions, and final compositing.
- Nano Banana for frame quality enhancement, visual consistency, and AI-assisted asset creation.
- Adobe Photoshop for refining eyewear images, cleaning details, and preparing high-quality visuals for animation.

These videos were developed for an eyewear retail store based in Bangalore. For confidentiality reasons, the client’s logo has been intentionally blurred. All videos are formatted for vertical platforms such as YouTube Shorts and Instagram Reels, with an emphasis on smooth motion, clarity, and visual impact.`
    }
  },
  {
    id: "ai-video-prompting",
    title: "AI-VIDEO PROMPTING",
    category: "AI Experiments",
    platform: 'ai',
    themeColor: "#8a2be2",
    isSeries: true,
    description: "AI-Generated Eyewear Frame Video Series. This project explores AI-driven video generation for eyewear product visualization, focusing on cinematic presentation, mood, and form rather than traditional product shoots.",
    imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1200",
    cardPreviewVideo: { type: 'youtube', src: 'bCnWijdu36Q' },
    heroVideo: { type: 'youtube', src: 'bCnWijdu36Q' },
    gallery: [
      { type: 'youtube', src: 'bCnWijdu36Q', label: 'AI Generation 01' },
      { type: 'youtube', src: '2lB3fNeKpY8', label: 'Neural Narrative 02' },
      { type: 'youtube', src: 'VMVR4tbL3Zc', label: 'Latent Space 03' },
      { type: 'youtube', src: 'm38z7e-SF9Q', label: 'Prompt Craft 04' }
    ],
    details: {
      role: "AI Director",
      techStack: ["Veo 3", "Midjourney", "Stable Diffusion"],
      year: 2025,
      analysis: `The videos were created using AI video generation workflows, with AI-assisted storyboarding and concept development to define framing, pacing, and visual language. Additional AI image tools were used selectively as reference material during ideation and prompt refinement.

Each video is designed to highlight: frame design and silhouette, material presence and reflections, premium retail aesthetics, and smooth, ad-ready motion language.

These visuals were developed for an eyewear retail store based in Bangalore. For confidentiality reasons, the brand logo has been intentionally blurred in the final video outputs shown here. If you’d like to know more about the client or the creative process, feel free to get in touch directly.`
    }
  }
];
