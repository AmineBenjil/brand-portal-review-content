import { useSyncExternalStore } from 'react'

export type VideoTimeSnapshot = {
  time: number
  duration: number
  playing: boolean
}

/**
 * Tiny pub/sub store for the video clock. The <video> element publishes into
 * it on a requestAnimationFrame loop; only the small components that render
 * the ticking time (control bar, timestamp pill) subscribe, so the rest of
 * the modal never re-renders on playback frames.
 */
export class VideoTimeStore {
  private snapshot: VideoTimeSnapshot = { time: 0, duration: 0, playing: false }
  private listeners = new Set<() => void>()

  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  getSnapshot = () => this.snapshot

  publish(next: Partial<VideoTimeSnapshot>) {
    const merged = { ...this.snapshot, ...next }
    if (
      merged.time === this.snapshot.time &&
      merged.duration === this.snapshot.duration &&
      merged.playing === this.snapshot.playing
    ) {
      return
    }
    this.snapshot = merged
    this.listeners.forEach((l) => l())
  }
}

export function useVideoTime(store: VideoTimeStore): VideoTimeSnapshot {
  return useSyncExternalStore(store.subscribe, store.getSnapshot)
}

/** 12.4s → "0:12" */
export function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
