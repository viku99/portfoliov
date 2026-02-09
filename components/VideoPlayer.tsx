import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, 
  Loader2,
  Maximize,
  Minimize,
  VolumeX,
  Volume2
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppContext } from '../contexts/AppContext';

interface VideoPlayerProps {
  type: 'local' | 'youtube' | 'video';
  src: string;
  className?: string;
  autoplay?: boolean;
  isReelsMode?: boolean;
  reelId?: string;
  poster?: string;
  loop?: boolean;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
    _ytInitializers?: Array<() => void>;
  }
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  type, 
  src, 
  className = "", 
  autoplay = true,
  isReelsMode = false,
  reelId,
  poster,
  loop = true
}) => {
  const { activeVideoId, setActiveVideoId } = useAppContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const ytPlayerRef = useRef<any>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const playerId = useRef(reelId || `v-${Math.random().toString(36).slice(2, 11)}`).current;
  const isActive = activeVideoId === playerId;

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement && document.fullscreenElement === containerRef.current);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const callYT = useCallback((methodName: string, ...args: any[]) => {
    const player = ytPlayerRef.current;
    if (player && typeof player[methodName] === 'function') {
      try {
        player[methodName](...args);
      } catch (e) {
        console.warn(`YouTube API ${methodName} error:`, e);
      }
      return true;
    }
    return false;
  }, []);

  const syncPlayback = useCallback(async () => {
    if (!isReady || hasError) return;

    if (type === 'youtube') {
      if (isActive) {
        callYT('mute');
        callYT('playVideo');
        // Stability delay for mobile YouTube bridge
        if (!isMobile) {
          setTimeout(() => {
            callYT('unMute');
            setIsMuted(false);
          }, 300);
        }
      } else {
        callYT('pauseVideo');
        callYT('mute');
        setIsMuted(true);
      }
    } else if (videoRef.current) {
      const video = videoRef.current;
      if (isActive) {
        video.muted = isMobile || isMuted;
        try {
          await video.play();
        } catch (e) {
          video.muted = true;
          video.play().catch(() => {});
        }
      } else {
        video.pause();
      }
    }
  }, [isActive, isReady, type, hasError, callYT, isMobile, isMuted]);

  useEffect(() => {
    syncPlayback();
  }, [syncPlayback]);

  const initYouTube = useCallback(() => {
    if (!window.YT || !window.YT.Player || ytPlayerRef.current) return;

    try {
      ytPlayerRef.current = new window.YT.Player(playerId, {
        videoId: src,
        playerVars: {
          autoplay: autoplay && isActive ? 1 : 0,
          controls: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          mute: 1,
          loop: loop ? 1 : 0,
          playlist: loop ? src : undefined,
          enablejsapi: 1,
          showinfo: 0,
          iv_load_policy: 3
        },
        events: {
          onReady: () => {
            setIsReady(true);
            setHasError(false);
            if (isActive) {
              callYT('playVideo');
              if (!isMobile) callYT('unMute');
            }
          },
          onStateChange: (event: any) => {
            const state = event.data;
            setIsPlaying(state === 1); 
            if (state === 0 && loop) callYT('playVideo');
          },
          onError: () => {
            setHasError(true);
            setIsReady(false);
          }
        }
      });
    } catch (err) {
      setHasError(true);
    }
  }, [src, autoplay, isActive, loop, playerId, callYT, isMobile]);

  useEffect(() => {
    if (type !== 'youtube') {
      setIsReady(true);
      return;
    }

    if (!window.YT || !window.YT.Player) {
      if (!window._ytInitializers) {
        window._ytInitializers = [];
        window.onYouTubeIframeAPIReady = () => {
          window._ytInitializers?.forEach(cb => cb());
          delete window._ytInitializers;
        };
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
      }
      window._ytInitializers.push(initYouTube);
    } else {
      initYouTube();
    }

    return () => {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.destroy === 'function') {
        ytPlayerRef.current.destroy();
        ytPlayerRef.current = null;
        setIsReady(false);
      }
    };
  }, [type, initYouTube]);

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isReady || hasError) return;

    if (!isActive) {
      setActiveVideoId(playerId);
      return;
    }

    if (type === 'youtube') {
      if (isPlaying) {
        callYT('pauseVideo');
      } else {
        callYT('playVideo');
        callYT('unMute');
        setIsMuted(false);
      }
    } else if (videoRef.current) {
      const v = videoRef.current;
      if (v.paused) {
        v.play().catch(() => {});
        v.muted = false;
        setIsMuted(false);
      } else {
        v.pause();
      }
    }
  };

  const handleToggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full bg-black overflow-hidden flex items-center justify-center group/player select-none cursor-pointer ${className} ${isFullscreen ? 'z-[999]' : ''}`}
      onClick={handleTogglePlay}
    >
      {type === 'youtube' ? (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          {/* ALIGNMENT FIX: Centered scaling that handles both mobile and desktop browser iframe behaviors */}
          <div className="w-[320%] h-full min-w-[320%] absolute flex items-center justify-center origin-center">
            <div id={playerId} className="w-full h-full pointer-events-none" />
          </div>
        </div>
      ) : (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          className="w-full h-full object-cover"
          playsInline
          loop={loop}
          preload="auto"
          muted={isMuted}
          onLoadedMetadata={() => setIsReady(true)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onError={() => setHasError(true)}
        />
      )}

      <AnimatePresence>
        {!isReady && !hasError && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
            <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
          </div>
        )}
      </AnimatePresence>

      {/* Manual UI Overlay - Guaranteed visible interaction */}
      <div className="absolute inset-0 z-30 pointer-events-none">
        <div className="absolute top-6 right-6 flex gap-3">
          <button 
            onClick={handleToggleFullscreen}
            className="pointer-events-auto p-3 bg-black/40 backdrop-blur-xl rounded-full text-white/70 hover:text-white transition-all opacity-0 group-hover/player:opacity-100"
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence>
            {!isPlaying && isReady && (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="p-8 bg-white/10 backdrop-blur-3xl rounded-full text-white/80 border border-white/20 shadow-2xl"
              >
                <Play size={48} fill="currentColor" className="translate-x-1" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {isMobile && isPlaying && isMuted && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-black/60 px-5 py-2.5 rounded-full border border-white/10 backdrop-blur-md flex items-center gap-3 animate-bounce">
            <VolumeX size={14} className="text-white/60" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white">Tap to Unmute</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;