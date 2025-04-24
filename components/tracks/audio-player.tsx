"use client";

import { useState, useRef, useEffect } from "react";
import { Track } from "@/types";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { api } from "@/lib/api";
import { Play, Pause, Volume2, VolumeX, X, Music } from "lucide-react";
import Image from "next/image";

interface AudioPlayerProps {
  track: Track;
  onClose: () => void;
}

export function AudioPlayer({ track, onClose }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [hasError, setHasError] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);

  const audioSrc = api.getTrackAudioUrl(track.audioFile);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement || !audioSrc) {
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      return;
    }

    setCurrentTime(0);
    setDuration(audioElement.duration || 0);
    setIsPlaying(false);
    setHasError(false);

    const playPromise = audioElement.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.error("Failed to autoplay:", err);

          setIsPlaying(false);
        });
    } else {
      setIsPlaying(true);
    }

    audioElement.volume = volume;
    audioElement.muted = isMuted;
  }, [audioSrc, volume, isMuted]);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio || !audioSrc || hasError) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((err) => {
        console.error("Failed to play:", err);
        setHasError(true);
        setIsPlaying(false);
      });
    }
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio && !isNaN(audio.currentTime)) {
      setCurrentTime(audio.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (audio && !isNaN(audio.duration)) {
      setDuration(audio.duration);
    }
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (audio && audioSrc && !hasError) {
      const newTime = value[0];
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setIsMuted(newVolume === 0);

    const audio = audioRef.current;
    if (audio) {
      audio.volume = newVolume;
      audio.muted = newVolume === 0;
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (audio) {
      const newMutedState = !isMuted;
      audio.muted = newMutedState;
      setIsMuted(newMutedState);

      if (!newMutedState && volume === 0) {
        const defaultVolume = 0.5;
        setVolume(defaultVolume);
        audio.volume = defaultVolume;
      }
    }
  };

  const handleAudioError = (
    e: React.SyntheticEvent<HTMLAudioElement, Event>
  ) => {
    console.error("Audio Error:", e.currentTarget.error);
    setHasError(true);
    setIsPlaying(false);
  };

  const canPlay = !!audioSrc && !hasError;

  return (
    <div
      className="p-4 flex items-center gap-4 bg-card text-card-foreground"
      data-testid="audio-player"
    >
      <audio
        ref={audioRef}
        src={audioSrc ?? ""}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onError={handleAudioError}
        className="hidden"
        preload="metadata"
      />

      <div className="flex-shrink-0 w-12 h-12 relative rounded overflow-hidden bg-muted">
        {track.coverImage ? (
          <Image
            src={track.coverImage}
            alt={`${track.title} cover`}
            fill
            className="object-cover"
            sizes="48px"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Music className="h-6 w-6 text-muted-foreground" />
          </div>
        )}

        {!track.coverImage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Music className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="flex-grow min-w-0">
        <div className="font-medium text-sm truncate">{track.title}</div>
        <div className="text-xs text-muted-foreground truncate">
          {track.artist}
        </div>
        {hasError && (
          <div className="text-xs text-destructive">Playback error</div>
        )}
        {!audioSrc && !hasError && (
          <div className="text-xs text-muted-foreground">No audio file</div>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePlayPause}
          disabled={!canPlay}
          data-testid="play-pause-button"
          className="h-8 w-8"
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
        </Button>

        <div className="text-xs hidden sm:block min-w-[70px] text-center">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>

        <div className="w-24 md:w-64">
          <Slider
            value={[currentTime]}
            min={0}
            max={duration || 1}
            step={0.1}
            onValueChange={handleSeek}
            disabled={!canPlay || duration === 0}
            data-testid="progress-slider"
          />
        </div>

        <div className="hidden md:flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            disabled={!canPlay}
            data-testid="volume-button"
            className="h-8 w-8"
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>

          <div className="w-20">
            <Slider
              value={[isMuted ? 0 : volume]}
              min={0}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              disabled={!canPlay}
              data-testid="volume-slider"
            />
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          data-testid="close-player-button"
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
