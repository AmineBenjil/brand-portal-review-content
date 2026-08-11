import { useEffect, useMemo, useRef, useState } from 'react'
import { reviewQueue } from '../data'
import type { FeedbackMessage } from '../data'
import type { Decision } from '../App'
import { VideoTimeStore, useVideoTime, formatTime } from '../videoTime'
import { VideoPane } from './VideoPane'
import type { VideoApi } from './VideoPane'

/** Decline prompt style: slide-up sheet by default; append ?decline=center to the URL for the centered dialog version. */
const DECLINE_VARIANT: 'sheet' | 'center' =
  new URLSearchParams(window.location.search).get('decline') === 'center' ? 'center' : 'sheet'

type Props = {
  creatorIdx: number
  clipIdx: number
  feedback: Record<string, FeedbackMessage[]>
  canGoPrev: boolean
  canGoNext: boolean
  onStep: (delta: 1 | -1) => void
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
  canGoPrev,
  canGoNext,
  onStep,
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

  const [draft, setDraft] = useState('')
  const [pillVisible, setPillVisible] = useState(true)
  const [declineOpen, setDeclineOpen] = useState(false)
  const [declineText, setDeclineText] = useState('')
  const [approving, setApproving] = useState(false)
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
  const creatorHasFeedback = creator.clips.some((c) => (feedback[c.id] ?? []).length > 0)

  // Reset composition state whenever the clip changes.
  useEffect(() => {
    setDraft('')
    setPillVisible(true)
  }, [clip.id])

  // Keep the newest feedback in view.
  useEffect(() => {
    const list = listRef.current
    if (list) list.scrollTop = list.scrollHeight
  }, [messages.length])

  // Keyboard: Esc closes, arrows change clip when not typing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (declineOpen) {
          setDeclineOpen(false)
          return
        }
        onClose()
      }
      const typing = document.activeElement?.tagName === 'TEXTAREA'
      if (typing) return
      if (e.key === 'ArrowRight') onStep(1)
      if (e.key === 'ArrowLeft') onStep(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, onStep, declineOpen])

  const send = () => {
    const text = draft.trim()
    if (!text) return
    const t = store.getSnapshot().time
    onAddFeedback(clip.id, text, pillVisible ? Math.floor(t) : null)
    setDraft('')
    setPillVisible(true)
  }

  const approve = () => {
    setApproving(true)
    approveTimer.current = window.setTimeout(() => {
      setApproving(false)
      onDecide('approved')
    }, 1400)
  }

  const submitDecline = () => {
    const text = declineText.trim()
    if (!text) return
    onAddFeedback(clip.id, text, null)
    setDeclineOpen(false)
    setDeclineText('')
    onDecide('declined')
  }

  const seekTo = (t: number) => {
    videoApi.current?.pause()
    videoApi.current?.seek(t)
    setPillVisible(true)
  }

  return (
    <div className="review-overlay" onClick={onClose}>
      <div className="review-modal" onClick={(e) => e.stopPropagation()}>
        {/* Left stage: gradient + video + thumbnails + navigation */}
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
          <div className="thumb-strip">
            {creator.clips.map((c, i) => (
              <button
                key={c.id}
                className={`thumb${i === clipIdx ? ' is-selected' : ''}`}
                title={`Clip ${i + 1}`}
                onClick={() => onSelectClip(i)}
              >
                <img src={c.poster} alt="" />
                {i === clipIdx && (
                  <>
                    <span className="thumb-overlay" />
                    <span className="thumb-check">
                      <img src="/assets/icons/check-thumb.svg" alt="" />
                    </span>
                  </>
                )}
              </button>
            ))}
          </div>
          <button
            className={`stage-nav stage-nav-prev${canGoPrev ? '' : ' is-disabled'}`}
            disabled={!canGoPrev}
            onClick={() => onStep(-1)}
            title="Previous clip"
          >
            <span className="chev chev-left">
              <img src="/assets/icons/chevron-shape.svg" alt="" />
            </span>
          </button>
          <button
            className={`stage-nav stage-nav-next${canGoNext ? '' : ' is-disabled'}`}
            disabled={!canGoNext}
            onClick={() => onStep(1)}
            title="Next clip"
          >
            <span className="chev">
              <img src="/assets/icons/chevron-shape.svg" alt="" />
            </span>
          </button>
        </div>

        {/* Right panel */}
        <div className="review-panel">
          <div className="panel-topbar">
            <p className="topbar-title">Review drafts</p>
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
            <div className="panel-info" aria-hidden>
              <div className="panel-creator">
                <span className="skeleton-block skeleton-avatar" />
                <span className="panel-creator-names">
                  <span className="skeleton-block skeleton-line" style={{ width: 120 }} />
                  <span className="skeleton-block skeleton-line skeleton-line-thin" style={{ width: 72, marginTop: 5 }} />
                </span>
              </div>
              <div className="panel-sections">
                <div className="panel-caption">
                  <span className="skeleton-block skeleton-line skeleton-line-thin" style={{ width: 48 }} />
                  <span className="skeleton-block skeleton-line" style={{ width: '100%', marginTop: 8 }} />
                  <span className="skeleton-block skeleton-line" style={{ width: '92%', marginTop: 6 }} />
                  <span className="skeleton-block skeleton-line" style={{ width: '65%', marginTop: 6 }} />
                </div>
                <img src="/assets/misc/line-divider.svg" alt="" className="panel-divider" />
                <span className="skeleton-block skeleton-line skeleton-line-thin" style={{ width: 62 }} />
              </div>
            </div>
          ) : (
          <div className="panel-info">
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
            <div className="panel-sections">
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
              <img src="/assets/misc/line-divider.svg" alt="" className="panel-divider" />
              <div className="panel-feedback-head">
                <p className="panel-feedback-title">Feedback</p>
              </div>
            </div>
          </div>
          )}

          {skeleton === 'full' ? (
            <div className="feedback-list" aria-hidden>
              <span className="skeleton-block skeleton-line" style={{ width: '84%' }} />
              <span className="skeleton-block skeleton-line" style={{ width: '58%' }} />
            </div>
          ) : (
          <div className="feedback-list" ref={listRef}>
            {messages.map((m) => (
              <div key={m.id} className="feedback-message">
                {m.timestamp !== null && (
                  <button
                    className="feedback-message-pill"
                    title="Jump to this moment"
                    onClick={() => seekTo(m.timestamp!)}
                  >
                    {formatTime(m.timestamp)}
                  </button>
                )}
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
          )}

          <div className={`feedback-input${skeleton === 'full' ? ' is-skeleton' : ''}`}>
            <textarea
              className="feedback-textarea"
              placeholder={`Add your feedback — we’ll pass it straight to ${creator.firstName}`}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                const isEnter = e.key === 'Enter' || e.key === 'Return' || e.keyCode === 13
                if (isEnter && !e.shiftKey) {
                  e.preventDefault()
                  send()
                }
              }}
            />
            <div className="feedback-input-row">
              {pillVisible ? (
                <TimestampPill store={store} onDismiss={() => setPillVisible(false)} />
              ) : (
                <span />
              )}
              <button
                className={`feedback-send${draft.trim() ? ' is-ready' : ''}`}
                onClick={send}
                title="Send feedback"
              >
                <img src={draft.trim() ? '/assets/icons/send-btn-active.svg' : '/assets/icons/send-btn.svg'} alt="" />
              </button>
            </div>
          </div>

          <div className="panel-footer">
            <button className="footer-decline" disabled={approving} onClick={() => setDeclineOpen(true)}>
              Decline
            </button>
            <div className="footer-actions">
              <button
                className="footer-changes"
                disabled={!creatorHasFeedback || approving}
                onClick={() => onDecide('changes')}
              >
                Request changes
              </button>
              <button className="footer-approve" disabled={approving} onClick={approve}>
                Approve
              </button>
            </div>
          </div>

          {approving && (
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
              <p className="approve-overlay-title">Approved</p>
              <p className="approve-overlay-sub">
                We’ll let {creator.firstName} know and get this scheduled.
              </p>
            </div>
          )}
        </div>

        {declineOpen && (
          <div
            className={`decline-scrim${DECLINE_VARIANT === 'center' ? ' decline-scrim-center' : ''}`}
            onClick={() => setDeclineOpen(false)}
          >
            <div
              className={DECLINE_VARIANT === 'center' ? 'decline-card decline-card-center' : 'decline-card decline-card-sheet'}
              onClick={(e) => e.stopPropagation()}
            >
              <span className="decline-icon">💬</span>
              <p className="decline-title">Why did you decline?</p>
              <p className="decline-sub">
                Tell us what missed the mark — we’ll pass it to {creator.firstName}’s producer and
                brief the reshoot, so the next draft lands closer.
              </p>
              <label className="decline-label" htmlFor="decline-reason">
                What didn’t work
              </label>
              <textarea
                id="decline-reason"
                className="decline-textarea"
                placeholder="e.g. The hook is too slow — the product should show up in the first 3 seconds"
                value={declineText}
                autoFocus
                onChange={(e) => setDeclineText(e.target.value)}
              />
              <button className="decline-submit" disabled={!declineText.trim()} onClick={submitDecline}>
                Send & decline draft
              </button>
              <button className="decline-cancel" onClick={() => setDeclineOpen(false)}>
                Keep reviewing
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function TimestampPill({ store, onDismiss }: { store: VideoTimeStore; onDismiss: () => void }) {
  const { time, playing } = useVideoTime(store)
  return (
    <span className={`timestamp-pill${playing ? ' is-live' : ''}`}>
      <span className="timestamp-pill-time">{formatTime(time)}</span>
      <button className="timestamp-pill-close" title="Send without timestamp" onClick={onDismiss}>
        <img src="/assets/icons/close-12.svg" alt="" />
      </button>
    </span>
  )
}
