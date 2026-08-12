import { useEffect, useRef, useState } from 'react'
import type { Clip } from '../data'
import { VideoTimeStore, useVideoTime, formatTime } from '../videoTime'

export type VideoApi = {
  seek: (t: number) => void
  play: () => void
  pause: () => void
}

type Props = {
  clip: Clip
  store: VideoTimeStore
  apiRef: { current: VideoApi | null }
}

export function VideoPane({ clip, store, apiRef }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    let raf = 0

    const publish = () =>
      store.publish({
        time: video.currentTime,
        duration: video.duration || clip.duration,
        playing: !video.paused && !video.ended,
      })

    const loop = () => {
      publish()
      raf = requestAnimationFrame(loop)
    }
    const onPlay = () => {
      setPlaying(true)
      cancelAnimationFrame(raf)
      loop()
    }
    const onStop = () => {
      setPlaying(false)
      cancelAnimationFrame(raf)
      publish()
    }

    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onStop)
    video.addEventListener('ended', onStop)
    video.addEventListener('loadedmetadata', publish)
    video.addEventListener('seeked', publish)
    store.publish({ time: 0, duration: clip.duration, playing: false })

    apiRef.current = {
      seek: (t) => {
        video.currentTime = t
      },
      play: () => void video.play(),
      pause: () => video.pause(),
    }

    return () => {
      cancelAnimationFrame(raf)
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onStop)
      video.removeEventListener('ended', onStop)
      video.removeEventListener('loadedmetadata', publish)
      video.removeEventListener('seeked', publish)
      apiRef.current = null
    }
  }, [clip.id, clip.duration, store, apiRef])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused || video.ended) void video.play()
    else video.pause()
  }

  return (
    <div className="video-frame">
      <video
        ref={videoRef}
        className="video-el"
        src={clip.src}
        poster={clip.poster}
        preload="metadata"
        playsInline
        muted={muted}
        onClick={togglePlay}
      />

      <div className="video-badge">
        {/* The IG rings are Instagram-only; TikTok drafts get a text badge
            (no hand-drawn icons — see CLAUDE.md). */}
        {clip.badge !== 'TikTok' && (
          <span className="ig-icon">
            <img src="/assets/icons/instagram-outer.svg" alt="" className="ig-icon-outer" />
            <img src="/assets/icons/instagram-inner.svg" alt="" className="ig-icon-inner" />
          </span>
        )}
        {clip.badge}
      </div>

      <button
        className={`video-sound${muted ? ' is-muted' : ''}`}
        title={muted ? 'Unmute' : 'Mute'}
        onClick={() => setMuted((m) => !m)}
      >
        <img src="/assets/video/sound-btn.svg" alt="" />
      </button>

      {!playing && (
        <button className="video-play-overlay" title="Play" onClick={togglePlay}>
          <img src="/assets/video/play-btn.svg" alt="" />
        </button>
      )}

      <ControlBar store={store} playing={playing} onToggle={togglePlay} videoRef={videoRef} clip={clip} />
    </div>
  )
}

function ControlBar({
  store,
  playing,
  onToggle,
  videoRef,
  clip,
}: {
  store: VideoTimeStore
  playing: boolean
  onToggle: () => void
  videoRef: React.RefObject<HTMLVideoElement | null>
  clip: Clip
}) {
  const { time, duration } = useVideoTime(store)
  const trackRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const pct = duration > 0 ? Math.min(1, time / duration) : 0

  const scrubTo = (clientX: number) => {
    const track = trackRef.current
    const video = videoRef.current
    if (!track || !video) return
    const rect = track.getBoundingClientRect()
    const p = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    video.currentTime = p * (video.duration || clip.duration)
  }

  return (
    <div className="video-controls">
      <button className="video-controls-toggle" onClick={onToggle} title={playing ? 'Pause' : 'Play'}>
        {playing ? (
          <span className="pause-glyph">
            <span />
            <span />
          </span>
        ) : (
          <img src="/assets/video/play-triangle.svg" alt="" className="play-triangle" />
        )}
      </button>
      <div
        ref={trackRef}
        className="video-track"
        onPointerDown={(e) => {
          dragging.current = true
          e.currentTarget.setPointerCapture(e.pointerId)
          scrubTo(e.clientX)
        }}
        onPointerMove={(e) => {
          if (dragging.current) scrubTo(e.clientX)
        }}
        onPointerUp={(e) => {
          dragging.current = false
          e.currentTarget.releasePointerCapture(e.pointerId)
        }}
      >
        <div className="video-track-bg">
          <div className="video-track-fill" style={{ width: `${Math.max(4, pct * 171)}px` }} />
        </div>
        <img
          src="/assets/video/scrub-dot.svg"
          alt=""
          className="video-track-dot"
          style={{ left: `${pct * (171 - 6)}px` }}
        />
      </div>
      <span className="video-time">
        {formatTime(time)} / {formatTime(duration || clip.duration)}
      </span>
    </div>
  )
}
