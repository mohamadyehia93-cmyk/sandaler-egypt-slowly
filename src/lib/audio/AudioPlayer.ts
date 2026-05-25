import { Howl } from 'howler';

export interface AudioTourStop {
  id: string;
  title: string;
  audioUrl: string;
  duration: number; // seconds
  latitude: number;
  longitude: number;
}

export interface PlayerState {
  status: 'playing' | 'paused' | 'ended' | 'error';
  stop: AudioTourStop;
  position: number;
}

export class AudioTourPlayer {
  private howl: Howl | null = null;
  private currentStop: AudioTourStop | null = null;
  private listeners: Set<(state: PlayerState) => void> = new Set();

  play(stop: AudioTourStop) {
    this.stop();

    this.currentStop = stop;
    this.howl = new Howl({
      src: [stop.audioUrl],
      html5: true, // enables streaming + Media Session API
      preload: true,
      onplay: () => this.emit({ status: 'playing', stop, position: 0 }),
      onpause: () => this.emit({ status: 'paused', stop, position: this.position }),
      onend: () => this.emit({ status: 'ended', stop, position: 0 }),
      onloaderror: () => this.emit({ status: 'error', stop, position: 0 }),
    });

    this.howl.play();
    this.setupMediaSession(stop);
  }

  pause() { this.howl?.pause(); }
  resume() { this.howl?.play(); }
  stop() {
    this.howl?.stop();
    this.howl?.unload();
    this.howl = null;
    this.currentStop = null;
  }

  seek(seconds: number) { this.howl?.seek(seconds); }
  get position(): number { return (this.howl?.seek() as number) || 0; }
  get duration(): number { return this.howl?.duration() || 0; }
  get isPlaying(): boolean { return this.howl?.playing() || false; }

  subscribe(listener: (state: PlayerState) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(state: PlayerState) {
    this.listeners.forEach(l => l(state));
  }

  private setupMediaSession(stop: AudioTourStop) {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: stop.title,
        artist: 'Sandal Audio Tour',
        album: 'Sandal',
      });
      navigator.mediaSession.setActionHandler('play', () => this.resume());
      navigator.mediaSession.setActionHandler('pause', () => this.pause());
    }
  }
}

export const audioTourPlayer = new AudioTourPlayer();
