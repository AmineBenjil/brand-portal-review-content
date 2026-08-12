import { useEffect, useMemo } from 'react'
import type { Creator } from '../data'
import type { Decision } from '../App'

/** Brand-ish confetti palette: accent purple, approve green, plus warm accents. */
const CONFETTI_COLORS = ['#7a5cfa', '#3caa70', '#f5a623', '#ef5da8', '#4aa3ff']
const CONFETTI_COUNT = 56

/** Deterministic pseudo-random so pieces don't reshuffle on re-render. */
const rand = (i: number, salt: number) => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453
  return x - Math.floor(x)
}

type ConfettiPiece = {
  left: number
  delay: number
  duration: number
  drift: number
  spin: number
  color: string
  width: number
  height: number
}

const CONFETTI: ConfettiPiece[] = Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
  left: rand(i, 1) * 100,
  delay: rand(i, 2) * 1.6,
  duration: 2.4 + rand(i, 3) * 1.8,
  drift: (rand(i, 4) - 0.5) * 120,
  spin: 360 + rand(i, 5) * 540,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  width: 6 + rand(i, 6) * 4,
  height: 10 + rand(i, 7) * 6,
}))

type Props = {
  queue: Creator[]
  decisions: Record<string, Decision>
  onClose: () => void
}

export function CelebrationModal({ queue, decisions, onClose }: Props) {
  // One concrete detail for the sub copy: how the review actually landed.
  const { total, approved, changes } = useMemo(() => {
    const all = queue.flatMap((c) => c.clips)
    const approvedCount = all.filter((c) => decisions[c.id] === 'approved').length
    return { total: all.length, approved: approvedCount, changes: all.length - approvedCount }
  }, [queue, decisions])

  const sub =
    changes === 0
      ? `All ${total} approved — we’ll get them scheduled and send you the live links.`
      : approved === 0
        ? `Your notes are with the creators — we’ll email you as the new drafts land.`
        : `${approved} approved and headed for scheduling, ${changes} back with creators for tweaks — we’ll email you when new drafts land.`

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="celebrate-scrim" onClick={onClose}>
      <div className="celebrate-card" onClick={(e) => e.stopPropagation()}>
        <div className="celebrate-confetti" aria-hidden>
          {CONFETTI.map((p, i) => (
            <span
              key={i}
              className="confetti-piece"
              style={{
                left: `${p.left}%`,
                width: p.width,
                height: p.height,
                background: p.color,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
                ['--drift' as string]: `${p.drift}px`,
                ['--spin' as string]: `${p.spin}deg`,
              }}
            />
          ))}
        </div>
        <svg className="celebrate-check" viewBox="0 0 64 64" fill="none">
          <circle className="approve-check-circle" cx="32" cy="32" r="29" stroke="#3caa70" strokeWidth="4" />
          <path
            className="approve-check-mark"
            d="M20 33.5 28.5 42 44 24.5"
            stroke="#3caa70"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <h1 className="celebrate-title">Every draft reviewed!</h1>
        <p className="celebrate-sub">{sub}</p>
        <button className="celebrate-cta" onClick={onClose}>
          Got it!
        </button>
      </div>
    </div>
  )
}
