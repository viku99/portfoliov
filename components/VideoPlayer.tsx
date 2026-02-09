import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Loader2,
  Maximize,
  Minimize
} from 'lucide-react';
// Added AnimatePresence import from framer-motion
import { AnimatePresence } from 'framer-motion';
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
  const { activeVideoId, setActiveVideoId, isGlobalMuted, setIsGlobalMuted } = useAppContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const ytPlayerRef = useRef<any>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasError, setHasError] = useState(false);

  const playerId = useRef(reelId || `v-${Math.random().toString(36).slice(2, 11)}`).current;
  const isActive = activeVideoId === playerId;

  // Stability: Monitor Fullscreen
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement && document.fullscreenElement === containerRef.current);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Performance: Sync Playback state with Global Active ID
  useEffect(() => {
    if (!isReady) return;

    const handlePlayback = async () => {
      try {
        if (type === 'youtube') {
          if (isActive) {
            ytPlayerRef.current?.playVideo?.();
            if (isGlobalMuted) ytPlayerRef.current?.mute?.();
            else ytPlayerRef.current?.unMute?.();
          } else {
            ytPlayerRef.current?.pauseVideo?.();
          }
        } else if (videoRef.current) {
          const video = videoRef.current;
          video.muted = isGlobalMuted;
          
          if (isActive) {
            const playPromise = video.play();
            if (playPromise !== undefined) {
              playPromise.catch(() => {
                // Autoplay was prevented or playback was interrupted
              });
            }
          } else {
            video.pause();
          }
        }
      } catch (err) {
        console.error("Playback error:", err);
      }
    };

    handlePlayback();
  }, [isActive, isGlobalMuted, isReady, type]);

  // YouTube API Setup
  const initYouTube = useCallback(() => {
    if (!window.YT || !window.YT.Player || ytPlayerRef.current) return;

    ytPlayerRef.current = new window.YT.Player(playerId, {
      videoId: src,
      playerVars: {
        autoplay: autoplay && isActive ? 1 : 0,
        controls: 0,
        rel: 0,
        modestbranding: 1,
        playsinline: 1,
        mute: isGlobalMuted ? 1 : 0,
        loop: loop ? 1 : 0,
        playlist: loop ? src : undefined,
        enablejsapi: 1,
        origin: window.location.origin
      },
      events: {
        onReady: () => setIsReady(true),
        onStateChange: (event: any) => {
          if (event.data === 1) setIsPlaying(true);
          else if (event.data === 2) setIsPlaying(false);
          else if (event.data === 0 && loop) event.target.playVideo();
        },
        onError: () => setHasError(true)
      }
    });
  }, [src, autoplay, isActive, isGlobalMuted, loop, playerId]);

  useEffect(() => {
    if (type !== 'youtube') return;

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
      if (ytPlayerRef.current?.destroy) {
        ytPlayerRef.current.destroy();
        ytPlayerRef.current = null;
      }
    };
  }, [type, initYouTube]);

  // Handlers
  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isReady) return;

    if (!isActive) {
      setActiveVideoId(playerId);
      return;
    }

    if (type === 'youtube') {
      if (isPlaying) ytPlayerRef.current?.pauseVideo();
      else ytPlayerRef.current?.playVideo();
    } else if (videoRef.current) {
      if (videoRef.current.paused) videoRef.current.play().catch(() => {});
      else videoRef.current.pause();
    }
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsGlobalMuted(!isGlobalMuted);
  };

  const toggleFs = (e: React.MouseEvent) => {
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
      className={`relative w-full h-full bg-black overflow-hidden flex items-center justify-center group/player select-none ${className} ${isFullscreen ? 'z-[999]' : ''}`}
      onClick={handleTogglePlay}
    >
      {/* 1. Video Layer */}
      {type === 'youtube' ? (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          {/* Cover scaling for 16:9 into vertical 9:16 containers */}
          <div className="w-[317%] h-full min-w-[317%] absolute">
            <div id={playerId} className="w-full h-full" />
          </div>
        </div>
      ) : (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          className="w-full h-full object-cover"
          playsInline
          muted={isGlobalMuted}
          loop={loop}
          preload="metadata"
          onLoadedMetadata={() => setIsReady(true)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onError={() => setHasError(true)}
        />
      )}

      {/* 2. State Overlays */}
      <AnimatePresence>
        {!isReady && !hasError && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-10">
            <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
          </div>
        )}
        {hasError && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10 p-4 text-center">
            <p className="text-[10px] uppercase tracking-widest text-white/40">Load Error</p>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Controls (Minimal YouTube Shorts Style) */}
      <div className="absolute inset-0 flex flex-col justify-between p-4 md:p-6 z-20 pointer-events-none opacity-0 group-hover/player:opacity-100 transition-opacity duration-300">
        <div className="flex justify-end gap-2">
          <button 
            onClick={toggleFs}
            className="pointer-events-auto p-2.5 bg-black/40 backdrop-blur-xl rounded-full text-white/80 hover:text-white transition-all active:scale-90"
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>

        <div className="flex justify-between items-end">
          <div className="flex gap-2">
            <button 
              onClick={handleTogglePlay}
              className="pointer-events-auto p-3 bg-white/10 backdrop-blur-2xl rounded-full text-white active:scale-90"
            >
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="translate-x-0.5" />}
            </button>
            <button 
              onClick={handleToggleMute}
              className="pointer-events-auto p-3 bg-white/10 backdrop-blur-2xl rounded-full text-white active:scale-90"
            >
              {isGlobalMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          </div>
          
          {isReelsMode && (
            <div className="text-[9px] font-mono tracking-widest text-white/20 uppercase">
              {isPlaying ? 'Live' : 'Paused'}
            </div>
          )}
        </div>
      </div>

      {/* Central Play/Pause Indicator (Mobile feel) */}
      {!isPlaying && isReady && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/10">
          <div className="p-6 bg-black/20 backdrop-blur-2xl rounded-full text-white/40 border border-white/5">
            <Play size={40} fill="currentColor" className="translate-x-1" />
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;