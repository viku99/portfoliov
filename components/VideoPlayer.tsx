import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, 
  Loader2,
  Maximize,
  Minimize
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useAppContext } from '../contexts/AppContext';

/**
 * PRODUCTION-READY STABLE VIDEO PLAYER
 * 
 * Specifically engineered for YouTube Shorts (9:16) and Local Video.
 * Audio is strictly tied to playback state. No manual controls.
 * Fixes: TypeError when calling playVideo on uninitialized YT objects.
 */

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

  const playerId = useRef(reelId || `v-${Math.random().toString(36).slice(2, 11)}`).current;
  const isActive = activeVideoId === playerId;

  // Track Fullscreen state
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement && document.fullscreenElement === containerRef.current);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  /**
   * Defensive check for YouTube API methods
   */
  const callYT = useCallback((methodName: string, ...args: any[]) => {
    const player = ytPlayerRef.current;
    if (player && typeof player[methodName] === 'function') {
      try {
        player[methodName](...args);
      } catch (e) {
        console.warn(`YouTube API call ${methodName} failed`, e);
      }
      return true;
    }
    return false;
  }, []);

  /**
   * Automatic Playback & Audio Logic
   * Enforces the rule: Audio only plays when active and playing.
   */
  const syncPlayback = useCallback(async () => {
    if (!isReady || hasError) return;

    if (type === 'youtube') {
      if (isActive) {
        callYT('playVideo');
        // Unmute only when it's the active video
        callYT('unMute');
      } else {
        callYT('pauseVideo');
        callYT('mute');
      }
    } else if (videoRef.current) {
      const video = videoRef.current;
      if (isActive) {
        video.muted = false;
        try {
          await video.play();
        } catch (e) {
          // Autoplay policy fallback: start muted if needed
          video.muted = true;
          video.play().catch(() => {});
        }
      } else {
        video.pause();
        video.muted = true;
      }
    }
  }, [isActive, isReady, type, hasError, callYT]);

  useEffect(() => {
    syncPlayback();
  }, [syncPlayback]);

  // Handle automatic audio muting when video is paused manually or ends
  useEffect(() => {
    if (type === 'youtube') {
      if (!isPlaying) callYT('mute');
      else if (isActive) callYT('unMute');
    }
  }, [isPlaying, isActive, type, callYT]);

  // YouTube API Lifecycle
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
          mute: isActive ? 0 : 1,
          loop: loop ? 1 : 0,
          playlist: loop ? src : undefined,
          enablejsapi: 1,
          origin: window.location.origin
        },
        events: {
          onReady: () => {
            setIsReady(true);
            setHasError(false);
            // After ready, sync again to ensure initial state is correct
            if (isActive) {
              callYT('playVideo');
              callYT('unMute');
            }
          },
          onStateChange: (event: any) => {
            const state = event.data;
            setIsPlaying(state === 1); // 1 = YT.PlayerState.PLAYING
            if (state === 0 && loop) { // 0 = YT.PlayerState.ENDED
              callYT('playVideo');
            }
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
  }, [src, autoplay, isActive, loop, playerId, callYT]);

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
      if (isPlaying) callYT('pauseVideo');
      else callYT('playVideo');
    } else if (videoRef.current) {
      videoRef.current.paused ? videoRef.current.play().catch(() => {}) : videoRef.current.pause();
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
      {/* Precision Media Scaling for 9:16 content inside a 16:9 frame */}
      {type === 'youtube' ? (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          {/* 
            Scaling logic:
            Target container aspect is 9:16 (0.56).
            Iframe aspect is 16:9 (1.77).
            Ratio = 1.77 / 0.56 = 3.1605 (316.05%)
            This ensures the vertical content fills the height and perfectly crops the horizontal black bars.
          */}
          <div className="w-[316.05%] h-full min-w-[316.05%] absolute">
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
          preload="metadata"
          onLoadedMetadata={() => setIsReady(true)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onError={() => setHasError(true)}
        />
      )}

      {/* State Overlays */}
      <AnimatePresence>
        {!isReady && !hasError && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-10">
            <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
          </div>
        )}
        {hasError && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10 p-4 text-center">
            <p className="text-[10px] uppercase tracking-widest text-white/30 font-mono italic">Playback Failure</p>
          </div>
        )}
      </AnimatePresence>

      {/* Interaction Feedback (No Audio Toggles) */}
      <div className="absolute inset-0 flex flex-col justify-between p-4 md:p-6 z-20 pointer-events-none opacity-0 group-hover/player:opacity-100 transition-opacity duration-300">
        <div className="flex justify-end">
          <button 
            onClick={handleToggleFullscreen}
            className="pointer-events-auto p-2.5 bg-black/40 backdrop-blur-xl rounded-full text-white/70 hover:text-white transition-all active:scale-90"
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>

        <div className="flex justify-center items-center">
          {!isPlaying && isReady && (
            <div className="p-6 bg-black/30 backdrop-blur-2xl rounded-full text-white/50 border border-white/5 shadow-2xl">
              <Play size={40} fill="currentColor" className="translate-x-1" />
            </div>
          )}
        </div>

        <div className="flex justify-start">
          {isReelsMode && isPlaying && (
            <div className="text-[9px] font-mono tracking-widest text-white/20 uppercase bg-black/20 px-3 py-1.5 rounded-full border border-white/5 backdrop-blur-md">
              Artifact Streaming
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;