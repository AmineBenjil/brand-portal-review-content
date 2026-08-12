import { useCallback, useMemo, useRef, useState } from 'react'
import { CelebrationModal } from './components/CelebrationModal'
import { Dashboard } from './components/Dashboard'
import { ReviewModal } from './components/ReviewModal'
import { reviewQueues } from './data'
import type { FeedbackMessage } from './data'
import { initialMode, persistMode } from './mode'
import type { CollabMode } from './mode'

export type Decision = 'approved' | 'changes'

export default function App() {
  // Collab mode: URL ?mode=local, default product; demo toggle flips it live.
  const [mode, setMode] = useState<CollabMode>(initialMode)
  const [reviewOpen, setReviewOpen] = useState(false)
  // One-shot congrats pop-up once the whole queue has a decision.
  const [celebrating, setCelebrating] = useState(false)
  const [creatorIdx, setCreatorIdx] = useState(0)
  const [clipIdx, setClipIdx] = useState(0)
  const [feedback, setFeedback] = useState<Record<string, FeedbackMessage[]>>({})
  // Decisions are per draft (clip id). Once a draft is decided it stays locked.
  // Clip ids are distinct across modes, so the map never cross-contaminates.
  const [decisions, setDecisions] = useState<Record<string, Decision>>({})
  const nextMessageId = useRef(1)

  const queue = reviewQueues[mode]

  const switchMode = useCallback(
    (next: CollabMode) => {
      if (next === mode) return
      persistMode(next)
      setMode(next)
      // The open review points into the other mode's queue — close it.
      setReviewOpen(false)
      setCelebrating(false)
      setCreatorIdx(0)
      setClipIdx(0)
    },
    [mode],
  )

  const openReview = useCallback(
    (creatorId: string) => {
      const idx = queue.findIndex((c) => c.id === creatorId)
      if (idx >= 0) {
        setCreatorIdx(idx)
        setClipIdx(0)
        setReviewOpen(true)
      }
    },
    [queue],
  )

  const addFeedback = useCallback((clipId: string, text: string, timestamp: number | null) => {
    const message: FeedbackMessage = { id: nextMessageId.current++, text, timestamp }
    setFeedback((prev) => ({ ...prev, [clipId]: [...(prev[clipId] ?? []), message] }))
  }, [])

  const goToCreator = useCallback((idx: number) => {
    setCreatorIdx(idx)
    setClipIdx(0)
  }, [])

  const goToClip = useCallback((idx: number) => {
    setClipIdx(idx)
  }, [])

  const decide = useCallback(
    (decision: Decision) => {
      const creator = queue[creatorIdx]
      const clip = creator.clips[clipIdx]
      const nextDecisions = { ...decisions, [clip.id]: decision }
      setDecisions(nextDecisions)
      // Advance to the next undecided draft of this creator, else to the next
      // creator (wrapping) with drafts still awaiting a decision, else close.
      for (let offset = 1; offset < creator.clips.length; offset++) {
        const i = (clipIdx + offset) % creator.clips.length
        if (!nextDecisions[creator.clips[i].id]) {
          setClipIdx(i)
          return
        }
      }
      for (let offset = 1; offset <= queue.length; offset++) {
        const i = (creatorIdx + offset) % queue.length
        const undecided = queue[i].clips.findIndex((c) => !nextDecisions[c.id])
        if (undecided >= 0) {
          setCreatorIdx(i)
          setClipIdx(undecided)
          return
        }
      }
      setReviewOpen(false)
      setCelebrating(true)
    },
    [queue, creatorIdx, clipIdx, decisions],
  )

  // A creator's dashboard row flips once every draft has a decision.
  const creatorDecisions = useMemo(() => {
    const map: Record<string, Decision> = {}
    for (const creator of queue) {
      if (creator.clips.every((c) => decisions[c.id])) {
        map[creator.id] = creator.clips.some((c) => decisions[c.id] === 'changes')
          ? 'changes'
          : 'approved'
      }
    }
    return map
  }, [queue, decisions])

  return (
    <>
      <Dashboard mode={mode} onOpenReview={openReview} decisions={creatorDecisions} />
      {reviewOpen && (
        <ReviewModal
          mode={mode}
          creatorIdx={creatorIdx}
          clipIdx={clipIdx}
          feedback={feedback}
          decisions={decisions}
          onSelectCreator={goToCreator}
          onSelectClip={goToClip}
          onAddFeedback={addFeedback}
          onDecide={decide}
          onClose={() => setReviewOpen(false)}
        />
      )}
      {celebrating && (
        <CelebrationModal queue={queue} decisions={decisions} onClose={() => setCelebrating(false)} />
      )}

      {/* Demo chrome (not part of the design): flips the collab type live. */}
      <div className="mode-toggle">
        <span className="mode-toggle-label">Collab type</span>
        <button
          className={`mode-toggle-btn${mode === 'product' ? ' is-active' : ''}`}
          onClick={() => switchMode('product')}
        >
          Product
        </button>
        <button
          className={`mode-toggle-btn${mode === 'local' ? ' is-active' : ''}`}
          onClick={() => switchMode('local')}
        >
          Local
        </button>
      </div>
    </>
  )
}
