
import React, { createContext, useState, useContext, ReactNode } from 'react';

interface AppContextType {
  isReelPlaying: boolean;
  playReel: () => void;
  stopReel: () => void;
  // Singleton Video State
  activeVideoId: string | null;
  setActiveVideoId: (id: string | null) => void;
  // Sound Persistence
  isGlobalMuted: boolean;
  setIsGlobalMuted: (muted: boolean) => void;
  // Cursor State
  cursorVariant: string;
  setCursorVariant: (variant: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isReelPlaying, setIsReelPlaying] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [isGlobalMuted, setIsGlobalMuted] = useState(true); // Default to muted for browser compatibility
  const [cursorVariant, setCursorVariant] = useState('default');

  const playReel = () => setIsReelPlaying(true);
  const stopReel = () => setIsReelPlaying(false);

  return (
    <AppContext.Provider 
      value={{ 
        isReelPlaying, 
        playReel, 
        stopReel, 
        activeVideoId,
        setActiveVideoId,
        isGlobalMuted,
        setIsGlobalMuted,
        cursorVariant,
        setCursorVariant
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
