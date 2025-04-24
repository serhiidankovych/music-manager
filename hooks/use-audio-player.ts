"use client";

import { useState, useCallback } from "react";
import { Track } from "@/types";

export function useAudioPlayer() {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = useCallback(
    (track: Track) => {
      if (currentTrack?.id === track.id) {
        setIsPlaying(!isPlaying);
      } else {
        setCurrentTrack(track);
        setIsPlaying(true);
      }
    },
    [currentTrack, isPlaying]
  );

  const closePlayer = useCallback(() => {
    setCurrentTrack(null);
    setIsPlaying(false);
  }, []);

  return {
    currentTrack,
    isPlaying,
    handlePlay,
    closePlayer,
  };
}
