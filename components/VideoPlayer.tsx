
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Loader2,
  Maximize,
  Minimize
} from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

interface VideoPlayerProps {
  type: 'local' | 'youtube' | 'video';
  src: string;
  className?: string;
  showControls?: boolean;
  autoplay?: boolean;
  isReelsMode?: boolean;
  reelId?: string;
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
  showControls = true, 
  autoplay = true,
  isReelsMode = false,
  reelId
}) => {
  const { activeVideoId, setActiveVideoId, isGlobalMuted, setIsGlobalMuted } = useAppContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const isReadyRef = useRef(false);
  const holdTimerRef = useRef<number | null>(null);
  const isHoldingRef = useRef(false);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showStatusIcon, setShowStatusIcon] = useState<'play' | 'pause' | 'mute' | 'unmute' | 'fullscreen' | null>(null);
  
  const playerId = useRef(reelId || `v-${Math.random().toString(36).slice(2, 11)}`).current;

  // Monitor fullscreen state
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement && document.fullscreenElement === containerRef.current);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const applyPlaybackState = useCallback(() => {
    if (!isReadyRef.current || !playerRef.current) return;
    const isActive = activeVideoId === playerId;

    try {
      if (type === 'youtube') {
        if (isActive && !isHoldingRef.current) {
          playerRef.current.playVideo?.();
          if (isGlobalMuted) playerRef.current.mute?.();
          else playerRef.current.unMute?.();
        } else {
          playerRef.current.pauseVideo?.();
        }
      } else {
        const video = playerRef.current as HTMLVideoElement;
        if (isActive && !isHoldingRef.current) {
          video.muted = isGlobalMuted;
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      }
    } catch (e) {}
  }, [activeVideoId, playerId, isGlobalMuted, type]);

  useEffect(() => {
    applyPlaybackState();
  }, [applyPlaybackState]);

  const onPlayerReady = useCallback(() => {
    isReadyRef.current = true;
    setIsReady(true);
    applyPlaybackState();
  }, [applyPlaybackState]);

  const onPlayerStateChange = useCallback((event: any) => {
    if (event.data === 1) setIsPlaying(true);
    else if (event.data === 2) setIsPlaying(false);
    else if (event.data === 0) {
      event.target.seekTo(0);
      event.target.playVideo();
    }
  }, []);

  const initYT = useCallback(() => {
    if (!window.YT || !window.YT.Player || playerRef.current) return;
    
    playerRef.current = new window.YT.Player(playerId, {
      videoId: src,
      playerVars: {
        autoplay: autoplay ? 1 : 0,
        controls: 0,
        rel: 0,
        modestbranding: 1,
        playsinline: 1,
        mute: isGlobalMuted ? 1 : 0,
        loop: 1,
        playlist: src,
        enablejsapi: 1,
        origin: window.location.origin,
        iv_load_policy: 3,
        fs: 0,
        disablekb: 1
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
      }
    });
  }, [src, autoplay, playerId, isGlobalMuted, onPlayerReady, onPlayerStateChange]);

  useEffect(() => {
    if (type !== 'youtube') {
      isReadyRef.current = true;
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
      window._ytInitializers.push(initYT);
    } else {
      initYT();
    }

    return () => {
      if (playerRef.current?.destroy) {
        playerRef.current.destroy();
        playerRef.current = null;
        isReadyRef.current = false;
      }
    };
  }, [type, initYT]);

  const toggleFullscreen = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isReady) return;
    holdTimerRef.current = window.setTimeout(() => {
      isHoldingRef.current = true;
      if (type === 'youtube') playerRef.current?.pauseVideo?.();
      else playerRef.current?.pause();
      setShowStatusIcon('pause');
    }, 150);
  };

  const handlePointerUp = () => {
    if (!isReady) return;
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (isHoldingRef.current) {
      isHoldingRef.current = false;
      setShowStatusIcon(null);
      if (activeVideoId === playerId) {
        if (type === 'youtube') playerRef.current?.playVideo?.();
        else playerRef.current?.play().catch(() => {});
      }
    }
  };

  const handleTap = (e: React.MouseEvent) => {
    if (isHoldingRef.current) return;
    e.stopPropagation();
    if (!isReady) return;

    if (isReelsMode) {
      const newMuted = !isGlobalMuted;
      setIsGlobalMuted(newMuted);
      setShowStatusIcon(newMuted ? 'mute' : 'unmute');
      setTimeout(() => setShowStatusIcon(null), 600);
    } else {
      if (activeVideoId === playerId) {
        if (isPlaying) {
          if (type === 'youtube') playerRef.current?.pauseVideo?.();
          else playerRef.current?.pause();
          setShowStatusIcon('pause');
        } else {
          if (type === 'youtube') playerRef.current?.playVideo?.();
          else playerRef.current?.play().catch(() => {});
          setShowStatusIcon('play');
        }
        setTimeout(() => setShowStatusIcon(null), 600);
      } else {
        setActiveVideoId(playerId);
      }
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden bg-black select-none cursor-pointer ${className} will-change-transform ${isFullscreen ? 'fixed inset-0 z-[300]' : ''}`}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onClick={handleTap}
    >
      {type === 'youtube' ? (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
          <div className="w-[317%] h-full min-w-[317%] absolute top-0 left-1/2 -translate-x-1/2">
            <div id={playerId} className="w-full h-full pointer-events-none" />
          </div>
        </div>
      ) : (
        <video 
          ref={playerRef}
          className="w-full h-full object-cover" 
          src={src} 
          muted={isGlobalMuted} 
          loop 
          playsInline 
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      )}

      {/* Control Overlays */}
      <div className="absolute top-4 right-4 z-[50] flex flex-col gap-3 md:top-6 md:right-6">
        {isReady && (
          <button 
            onClick={toggleFullscreen}
            className="p-2.5 bg-black/40 backdrop-blur-xl rounded-full text-white/70 hover:text-white hover:bg-black/60 transition-all active:scale-90"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        )}
      </div>

      {!isReady && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black">
          <Loader2 className="w-8 h-8 text-white/10 animate-spin" />
        </div>
      )}

      <AnimatePresence>
        {showStatusIcon && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none"
          >
            <div className="bg-black/60 backdrop-blur-xl p-6 rounded-full text-white">
              {showStatusIcon === 'pause' && <Pause fill="currentColor" size={32} />}
              {showStatusIcon === 'play' && <Play fill="currentColor" size={32} />}
              {showStatusIcon === 'mute' && <VolumeX size={32} />}
              {showStatusIcon === 'unmute' && <Volume2 size={32} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isReelsMode && isReady && !isFullscreen && (
        <div className="absolute bottom-6 right-6 z-30 opacity-40">
          {isGlobalMuted ? <VolumeX size={20} className="text-white" /> : <Volume2 size={20} className="text-white" />}
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
