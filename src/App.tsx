import { useCallback, useMemo, useRef, useState } from 'react'
import { Dashboard } from './components/Dashboard'
import { ReviewModal } from './components/ReviewModal'
import { reviewQueue } from './data'
import type { FeedbackMessage } from './data'

export type Decision = 'approved' | 'declined' | 'changes'

export default function App() {
  const [reviewOpen, setReviewOpen] = useState(false)
  const [creatorIdx, setCreatorIdx] = useState(0)
  const [clipIdx, setClipIdx] = useState(0)
  const [feedback, setFeedback] = useState<Record<string, FeedbackMessage[]>>({})
  const [decisions, setDecisions] = useState<Record<string, Decision>>({})
  const nextMessageId = useRef(1)

  const openReview = useCallback((creatorId: string) => {
    const idx = reviewQueue.findIndex((c) => c.id === creatorId)
    if (idx >= 0) {
      setCreatorIdx(idx)
      setClipIdx(0)
      setReviewOpen(true)
    }
  }, [])

  const addFeedback = useCallback((clipId: string, text: string, timestamp: number | null) => {
    const message: FeedbackMessage = { id: nextMessageId.current++, text, timestamp }
    setFeedback((prev) => ({ ...prev, [clipId]: [...(prev[clipId] ?? []), message] }))
  }, [])

  const removeFeedback = useCallback((clipId: string, messageId: number) => {
    setFeedback((prev) => ({
      ...prev,
      [clipId]: (prev[clipId] ?? []).filter((m) => m.id !== messageId),
    }))
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
      const creator = reviewQueue[creatorIdx]
      const nextDecisions = { ...decisions, [creator.id]: decision }
      setDecisions(nextDecisions)
      // Advance forward to the next creator still awaiting a decision
      // (wrapping around), else close the review.
      let remaining = -1
      for (let offset = 1; offset < reviewQueue.length; offset++) {
        const i = (creatorIdx + offset) % reviewQueue.length
        if (!nextDecisions[reviewQueue[i].id]) {
          remaining = i
          break
        }
      }
      if (remaining >= 0) {
        setCreatorIdx(remaining)
        setClipIdx(0)
      } else {
        setReviewOpen(false)
      }
    },
    [creatorIdx, decisions],
  )

  const flatIndex = useMemo(() => {
    // Global clip position, used by the arrow buttons to cross creator boundaries.
    let before = 0
    for (let i = 0; i < creatorIdx; i++) before += reviewQueue[i].clips.length
    return before + clipIdx
  }, [creatorIdx, clipIdx])

  const totalClips = useMemo(() => reviewQueue.reduce((n, c) => n + c.clips.length, 0), [])

  const step = useCallback(
    (delta: 1 | -1) => {
      const target = flatIndex + delta
      if (target < 0 || target >= totalClips) return
      let rest = target
      for (let i = 0; i < reviewQueue.length; i++) {
        if (rest < reviewQueue[i].clips.length) {
          setCreatorIdx(i)
          setClipIdx(rest)
          return
        }
        rest -= reviewQueue[i].clips.length
      }
    },
    [flatIndex, totalClips],
  )

  return (
    <>
      <Dashboard onOpenReview={openReview} decisions={decisions} />
      {reviewOpen && (
        <ReviewModal
          creatorIdx={creatorIdx}
          clipIdx={clipIdx}
          feedback={feedback}
          canGoPrev={flatIndex > 0}
          canGoNext={flatIndex < totalClips - 1}
          onStep={step}
          onSelectCreator={goToCreator}
          onSelectClip={goToClip}
          onAddFeedback={addFeedback}
          onRemoveFeedback={removeFeedback}
          onDecide={decide}
          onClose={() => setReviewOpen(false)}
        />
      )}
    </>
  )
}
