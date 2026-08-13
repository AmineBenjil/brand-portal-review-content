# Brand Portal — Review Content

Pixel-perfect implementation of the Figma "Review content" modal
(Design Labs → node `12264:129746`), built with Vite + React + TypeScript
and plain CSS. All visual assets are exported from the Figma file into
`public/assets`; the demo videos are rendered locally from the campaign
photos found in the same file.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
```

## Demo videos

The 9 clips in `public/videos` are AI-generated UGC footage: Higgsfield
Soul 2.0 stills (a consistent woman per creator talking about the product)
animated with Seedance 2.0 — 8 s, 720p, 9:16, native speech audio. Their
first-frame stills live in `public/assets/video/ugc` and double as the
posters and thumbnail images.

`npm run make:videos` still exists as an offline fallback — it renders
silent Ken Burns MP4s from the Figma campaign photos with `ffmpeg-static`
(note it overwrites the AI clips in `public/videos`).

## What's interactive

- **Play/pause** — center overlay, control-bar toggle, or clicking the video.
- **Scrubbing** — click or drag the control-bar track to seek.
- **Feedback** — written in the Request changes sheet only; sent notes stack
  under a "Feedback" heading beneath the draft thumbnails (the section only
  appears once a note exists).
- **Draft navigation** — the circular arrows flanking the video step through
  the current creator's drafts (badge, caption, duration and per-draft
  feedback follow), and the "Drafts (n)" thumbnails jump straight to any
  draft. Every thumb carries a centered play glyph, a dim overlay, and a
  content-type label underneath (IG Reel / IG Story / TikTok); the selected
  thumb gets a floating lavender ring, a drop shadow, and a dark label. With
  more than four drafts the row becomes a carousel — the fifth thumb peeks
  clipped at the panel edge and the small arrows beside the header page it;
  it auto-scrolls to keep the selected draft visible. Arrow keys work too
  when not typing.
- **Creator pager** — the ‹ n/4 › pager in the panel's "Review" header flips
  between creators; arrows disable at either end of the queue.
- **Decisions** — Approve / Request changes decide the current draft, stamp
  its thumbnail (green check / orange changes icon), and advance to the next
  undecided draft. Revisiting a decided draft swaps the footer CTAs for a
  status rail: "🎉 Approved" or "Request sent to {name} — we'll email you
  when the new draft is ready." A creator's dashboard row updates once every
  draft is decided.
- **Request changes prompt** — a slide-up sheet over the right panel with an
  autofocused note box, one wrap of quick-fill chips (the clip's caption-aware
  suggestions plus Caption tweak, Different cover frame, Text on screen, Trim
  or reorder clips — each fills a starter sentence), an "ⓘ One change round
  included" footer note, and a Send button that wakes on the first typed
  character. Sending records the note as feedback, plays the animated check
  ("Changes requested"), then locks the draft.
- **Dashboard** — clicking a creator row with a submission reopens the
  review at that creator; Esc or the × closes it.
- **All done** — deciding the last draft in the queue closes the review and
  pops a confetti congrats modal ("Every draft reviewed!") with an animated
  check, an approved/changes tally, and a "Got it!" CTA.
- **Collab modes** — the whole app runs as a product collab (Pikora SPF,
  shipping funnel) or a local collab (Trilogy spas, Confirmed → Visited
  funnel, booking statuses, spa review content). Load `?mode=local` or flip
  the bottom-left "Collab type" pill live; captions, pre-checks, suggestion
  chips, and dashboard copy all swap from the data layer.

## Structure

- `src/mode.ts` — collab mode (`?mode=local` | product) read + persistence
- `src/data.ts` — review queues, captions, pre-checks, suggestion chips, and
  dashboard content for both collab modes
- `src/videoTime.ts` — tiny pub/sub store for the video clock (keeps
  per-frame updates out of the React tree except two small subscribers)
- `src/components/VideoPane.tsx` — player, badge, sound, control bar
- `src/components/ReviewModal.tsx` — stage, panel, feedback, decisions
- `src/components/Dashboard.tsx` — background page
- `src/components/CelebrationModal.tsx` — end-of-queue congrats pop-up
- `scripts/make-videos.mjs` — demo clip renderer
