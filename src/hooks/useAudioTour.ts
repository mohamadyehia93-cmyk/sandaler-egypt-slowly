import { useEffect, useState } from 'react';
import { audioTourPlayer, type AudioTourStop, type PlayerState } from '@/lib/audio/AudioPlayer';

export function useAudioTour() {
  const [state, setState] = useState<PlayerState | null>(null);
  const [position, setPosition] = useState(0);

  useEffect(() => {
    const unsubscribe = audioTourPlayer.subscribe(setState);
    const interval = setInterval(() => {
      if (audioTourPlayer.isPlaying) setPosition(audioTourPlayer.position);
    }, 500);
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return {
    currentStop: state?.stop ?? null,
    isPlaying: audioTourPlayer.isPlaying,
    position,
    duration: audioTourPlayer.duration,
    play: (stop: AudioTourStop) => audioTourPlayer.play(stop),
    pause: () => audioTourPlayer.pause(),
    resume: () => audioTourPlayer.resume(),
    stop: () => audioTourPlayer.stop(),
    seek: (seconds: number) => audioTourPlayer.seek(seconds),
  };
}
