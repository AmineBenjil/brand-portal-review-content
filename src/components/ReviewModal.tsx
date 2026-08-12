import { useEffect, useMemo, useRef, useState } from 'react'
import { reviewQueue } from '../data'
import type { FeedbackMessage } from '../data'
import type { Decision } from '../App'
import { VideoTimeStore } from '../videoTime'
import { VideoPane } from './VideoPane'
import type { VideoApi } from './VideoPane'

/** Quick-fill suggestions in the "Request changes" prompt (Figma 12289:172657). */
const CHANGE_CHIPS = ['Caption tweak', 'Different cover frame', 'Text on screen', 'Trim or reorder clips']

/** Drafts carousel geometry: 85px thumbs, 10px gap, viewport from x=20 to the panel edge. */
const THUMB_STEP = 95
const CAROUSEL_VIEWPORT = 390
/** Scrolled fully right, the last thumb keeps this much air from the panel edge. */
const CAROUSEL_END_PAD = 20

type Props = {
  creatorIdx: number
  clipIdx: number
  feedback: Record<string, FeedbackMessage[]>
  decisions: Record<string, Decision>
  onSelectCreator: (idx: number) => void
  onSelectClip: (idx: number) => void
  onAddFeedback: (clipId: string, text: string, timestamp: number | null) => void
  onRemoveFeedback: (clipId: string, messageId: number) => void
  onDecide: (decision: Decision) => void
  onClose: () => void
}

export function ReviewModal({
  creatorIdx,
  clipIdx,
  feedback,
  decisions,
  onSelectCreator,
  onSelectClip,
  onAddFeedback,
  onRemoveFeedback,
  onDecide,
  onClose,
}: Props) {
  const creator = reviewQueue[creatorIdx]
  const clip = creator.clips[clipIdx]
  const store = useMemo(() => new VideoTimeStore(), [])
  const videoApi = useRef<VideoApi | null>(null)

  const [confirming, setConfirming] = useState<Decision | null>(null)
  const [draftScroll, setDraftScroll] = useState(0)
  const [changesOpen, setChangesOpen] = useState(false)
  const [changesText, setChangesText] = useState('')
  const changesRef = useRef<HTMLTextAreaElement>(null)
  const [skeleton, setSkeleton] = useState<'none' | 'video' | 'full'>('none')
  const listRef = useRef<HTMLDivElement>(null)
  const prevCreator = useRef(creatorIdx)
  const prevClip = useRef(clip.id)
  const approveTimer = useRef(0)

  // 1s skeleton: full (details + video) on creator flips, video-only on clip flips.
  useEffect(() => {
    if (prevClip.current === clip.id) return
    const full = prevCreator.current !== creatorIdx
    prevCreator.current = creatorIdx
    prevClip.current = clip.id
    setSkeleton(full ? 'full' : 'video')
    const t = setTimeout(() => setSkeleton('none'), 1000)
    return () => clearTimeout(t)
  }, [clip.id, creatorIdx])

  useEffect(() => () => clearTimeout(approveTimer.current), [])

  const messages = feedback[clip.id] ?? []
  // Once a draft is decided its CTAs stay locked — no second decision on top.
  const decided = decisions[clip.id]

  // With more than four drafts the row overflows the panel; arrows page it.
  const maxDraftScroll = Math.max(
    0,
    creator.clips.length * THUMB_STEP - 10 - (CAROUSEL_VIEWPORT - CAROUSEL_END_PAD),
  )
  const scrollDrafts = (dir: 1 | -1) =>
    setDraftScroll((s) => Math.min(maxDraftScroll, Math.max(0, s + dir * THUMB_STEP)))

  // Fresh creator → carousel back to the start.
  useEffect(() => {
    setDraftScroll(0)
  }, [creatorIdx])

  // Keep the selected thumbnail inside the carousel viewport.
  useEffect(() => {
    const left = clipIdx * THUMB_STEP
    const right = left + THUMB_STEP - 10
    setDraftScroll((s) => {
      const visible = CAROUSEL_VIEWPORT - CAROUSEL_END_PAD
      if (left < s) return left
      if (right > s + visible) return Math.min(maxDraftScroll, right - visible)
      return s
    })
  }, [clipIdx, maxDraftScroll])

  // Reset composition state whenever the clip changes.
  useEffect(() => {
    setChangesOpen(false)
    setChangesText('')
  }, [clip.id])

  // Keep the newest feedback in view.
  useEffect(() => {
    const list = listRef.current
    if (list) list.scrollTop = list.scrollHeight
  }, [messages.length])

  // Keyboard: Esc closes, arrows flip between this creator's drafts when not typing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (changesOpen) {
          setChangesOpen(false)
          return
        }
        onClose()
      }
      const typing = document.activeElement?.tagName === 'TEXTAREA'
      if (typing) return
      if (e.key === 'ArrowRight' && clipIdx < creator.clips.length - 1) onSelectClip(clipIdx + 1)
      if (e.key === 'ArrowLeft' && clipIdx > 0) onSelectClip(clipIdx - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, onSelectClip, clipIdx, creator.clips.length, changesOpen])

  // Animated check overlay (1.4s), then the decision lands.
  const confirmDecision = (decision: Decision) => {
    setConfirming(decision)
    approveTimer.current = window.setTimeout(() => {
      setConfirming(null)
      onDecide(decision)
    }, 1400)
  }

  const submitChanges = () => {
    const text = changesText.trim()
    if (!text) return
    onAddFeedback(clip.id, text, null)
    setChangesOpen(false)
    setChangesText('')
    confirmDecision('changes')
  }

  const fillChip = (chip: string) => {
    setChangesText((t) => (t.trim() ? `${t.replace(/\s+$/, '')}, ${chip.toLowerCase()}` : chip))
    changesRef.current?.focus()
  }

  return (
    <div className="review-overlay" onClick={onClose}>
      <div className="review-modal" onClick={(e) => e.stopPropagation()}>
        {/* Left stage: gradient + video + draft navigation */}
        <div className="review-stage">
          <div className="stage-gradient-clip" aria-hidden>
            <img src="/assets/modal/gradient-bg.png" alt="" className="stage-gradient" />
          </div>
          {skeleton === 'none' ? (
            <VideoPane key={clip.id} clip={clip} store={store} apiRef={videoApi} />
          ) : (
            <div className="video-frame video-skeleton">
              <div className="skeleton-shimmer" />
            </div>
          )}
          <button
            className={`stage-nav stage-nav-prev${clipIdx > 0 ? '' : ' is-disabled'}`}
            disabled={clipIdx === 0}
            onClick={() => onSelectClip(clipIdx - 1)}
            title="Previous draft"
          >
            <span className="chev chev-left">
              <img src="/assets/icons/chevron-shape.svg" alt="" />
            </span>
          </button>
          <button
            className={`stage-nav stage-nav-next${clipIdx < creator.clips.length - 1 ? '' : ' is-disabled'}`}
            disabled={clipIdx === creator.clips.length - 1}
            onClick={() => onSelectClip(clipIdx + 1)}
            title="Next draft"
          >
            <span className="chev">
              <img src="/assets/icons/chevron-shape.svg" alt="" />
            </span>
          </button>
        </div>

        {/* Right panel */}
        <div className="review-panel">
          <div className="panel-topbar">
            <p className="topbar-title">Review</p>
            <div className="topbar-nav">
              <button
                className="topbar-arrow"
                disabled={creatorIdx === 0}
                onClick={() => onSelectCreator(creatorIdx - 1)}
                title="Previous creator"
              >
                <img src="/assets/icons/chevron-12.svg" alt="" className="chev12-left" />
              </button>
              <button
                className="topbar-arrow"
                disabled={creatorIdx === reviewQueue.length - 1}
                onClick={() => onSelectCreator(creatorIdx + 1)}
                title="Next creator"
              >
                <img src="/assets/icons/chevron-12.svg" alt="" />
              </button>
            </div>
            <p className="topbar-count">
              {creatorIdx + 1}/{reviewQueue.length}
            </p>
            <button className="topbar-close" onClick={onClose} title="Close">
              <img src="/assets/icons/close-16.svg" alt="" />
            </button>
          </div>

          {skeleton === 'full' ? (
            <div aria-hidden>
              <div className="panel-creator">
                <span className="skeleton-block skeleton-avatar" />
                <span className="panel-creator-names">
                  <span className="skeleton-block skeleton-line" style={{ width: 120 }} />
                  <span className="skeleton-block skeleton-line skeleton-line-thin" style={{ width: 72, marginTop: 5 }} />
                </span>
              </div>
              <div className="drafts-header">
                <span className="skeleton-block skeleton-line skeleton-line-thin" style={{ width: 52 }} />
              </div>
              <div className="drafts-carousel">
                <div className="drafts-track">
                  {creator.clips.map((c) => (
                    <span key={c.id} className="skeleton-block draft-thumb-skeleton" />
                  ))}
                </div>
              </div>
              <div className="panel-caption">
                <span className="skeleton-block skeleton-line skeleton-line-thin" style={{ width: 48 }} />
                <span className="skeleton-block skeleton-line" style={{ width: '100%', marginTop: 8 }} />
                <span className="skeleton-block skeleton-line" style={{ width: '92%', marginTop: 6 }} />
                <span className="skeleton-block skeleton-line" style={{ width: '65%', marginTop: 6 }} />
              </div>
            </div>
          ) : (
          <div>
            <div className="panel-creator">
              <span className="panel-creator-avatar">
                <img src={creator.avatar} alt="" />
              </span>
              <span className="panel-creator-names">
                <span className="panel-creator-name-line">
                  <span className="panel-creator-name">{creator.name}</span>
                  <img src="/assets/icons/verified.svg" alt="" className="panel-creator-verified" />
                </span>
                <span className="panel-creator-handle">{creator.handle}</span>
              </span>
            </div>
            <div className="drafts-header">
              <p className="panel-drafts-title">
                Drafts <span className="drafts-count">({creator.clips.length})</span>
              </p>
              {creator.clips.length > 4 && (
                <div className="drafts-nav">
                  <button
                    className="drafts-arrow"
                    disabled={draftScroll <= 0}
                    onClick={() => scrollDrafts(-1)}
                    title="Previous drafts"
                  >
                    <img src="/assets/icons/chevron-12.svg" alt="" className="chev12-left" />
                  </button>
                  <button
                    className="drafts-arrow"
                    disabled={draftScroll >= maxDraftScroll}
                    onClick={() => scrollDrafts(1)}
                    title="More drafts"
                  >
                    <img src="/assets/icons/chevron-12.svg" alt="" />
                  </button>
                </div>
              )}
            </div>
            <div className="drafts-carousel">
              <div className="drafts-track" style={{ transform: `translateX(${-draftScroll}px)` }}>
                {creator.clips.map((c, i) => (
                  <button
                    key={c.id}
                    className={`draft-thumb${i === clipIdx ? ' is-selected' : ''}`}
                    title={`Draft ${i + 1}`}
                    onClick={() => onSelectClip(i)}
                  >
                    <img src={c.poster} alt="" className="draft-thumb-img" />
                    {decisions[c.id] && (
                      <>
                        <span className="draft-thumb-dim" />
                        <img
                          src={`/assets/icons/${decisions[c.id] === 'approved' ? 'draft-approved' : 'draft-changes'}.svg`}
                          alt={decisions[c.id] === 'approved' ? 'Approved' : 'Changes requested'}
                          className="draft-thumb-icon"
                        />
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div className="panel-caption">
              <p className="panel-caption-label">Caption</p>
              <div className="panel-caption-body">
                {clip.caption.map((line, i) => (
                  <p key={i}>
                    {line.map((seg, j) => (
                      <span key={j} className={seg.tone ? `caption-${seg.tone}` : undefined}>
                        {seg.text}
                      </span>
                    ))}
                  </p>
                ))}
              </div>
            </div>
          </div>
          )}

          {/* Feedback appears under the drafts only once a note exists */}
          {skeleton !== 'full' && messages.length > 0 && (
            <>
              <img src="/assets/misc/line-divider.svg" alt="" className="panel-divider panel-divider-feedback" />
              <div className="panel-feedback-head panel-feedback-head-fixed">
                <p className="panel-feedback-title">Feedback</p>
              </div>
              <div className="feedback-list" ref={listRef}>
                {messages.map((m) => (
                  <div key={m.id} className="feedback-message">
                    <span className="feedback-message-text">{m.text}</span>
                    <button
                      className="feedback-message-remove"
                      title="Remove"
                      onClick={() => onRemoveFeedback(clip.id, m.id)}
                    >
                      <img src="/assets/icons/close-12.svg" alt="" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="panel-footer">
            <button
              className="footer-changes"
              disabled={!!decided || !!confirming}
              onClick={() => setChangesOpen(true)}
            >
              Request changes
            </button>
            <button
              className="footer-approve"
              disabled={!!decided || !!confirming}
              onClick={() => confirmDecision('approved')}
            >
              Approve
            </button>
          </div>

          {confirming && (
            <div className="approve-overlay">
              <svg className="approve-check" viewBox="0 0 64 64" fill="none">
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
              <p className="approve-overlay-title">
                {confirming === 'approved' ? 'Approved' : 'Changes requested'}
              </p>
              <p className="approve-overlay-sub">
                {confirming === 'approved'
                  ? `We’ll let ${creator.firstName} know and get this scheduled.`
                  : `Your notes are on the way to ${creator.firstName} — we’ll email you when the new draft lands.`}
              </p>
            </div>
          )}
        </div>

        {changesOpen && (
          <div className="changes-scrim" onClick={() => setChangesOpen(false)}>
            <div className="changes-card" onClick={(e) => e.stopPropagation()}>
              <span className="changes-icon">🖊️</span>
              <p className="changes-title">What should change?</p>
              <p className="changes-sub">
                Small tweaks are more welcomed by creators. Need something <strong>re-filmed?</strong>{' '}
                That’s a bigger ask<strong>.</strong> Creators would need another visit.
              </p>
              <textarea
                ref={changesRef}
                className="changes-textarea"
                placeholder={`Add your feedback — we’ll pass it straight to ${creator.firstName}`}
                value={changesText}
                autoFocus
                onChange={(e) => setChangesText(e.target.value)}
                onKeyDown={(e) => {
                  const isEnter = e.key === 'Enter' || e.key === 'Return' || e.keyCode === 13
                  if (isEnter && !e.shiftKey) {
                    e.preventDefault()
                    submitChanges()
                  }
                }}
              />
              <div className="changes-chips">
                {CHANGE_CHIPS.map((chip) => (
                  <button key={chip} className="changes-chip" onClick={() => fillChip(chip)}>
                    {chip}
                  </button>
                ))}
              </div>
              <div className="changes-footer">
                <button className="changes-send" disabled={!changesText.trim()} onClick={submitChanges}>
                  Send
                </button>
                <button className="changes-cancel" onClick={() => setChangesOpen(false)}>
                  Keep reviewing
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
