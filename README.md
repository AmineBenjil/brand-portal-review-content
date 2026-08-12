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
- **Timestamp sync** — the amber pill in the feedback composer ticks in real
  time with the video clock while playing and holds the frame when paused.
- **Scrubbing** — click or drag the control-bar track to seek.
- **Timestamped feedback** — send with the arrow button or Enter; the note
  stacks under "Feedback" with its timestamp pill. Clicking a note's pill
  seeks the video to that moment. The pill's × sends without a timestamp.
- **Draft navigation** — the circular arrows flanking the video step through
  the current creator's drafts (badge, caption, duration and per-draft
  feedback follow), and the "Drafts" thumbnails in the panel jump straight to
  any draft (selected thumb shows a purple ring). Arrow keys work too when
  not typing.
- **Creator pager** — the ‹ n/4 › pager in the panel's "Review" header flips
  between creators; arrows disable at either end of the queue.
- **Decisions** — Approve / Request changes decide the current draft, stamp
  its thumbnail (green check / orange changes icon), and advance to the next
  undecided draft. Decided drafts lock their CTAs at 20% opacity — no second
  action on top. A creator's dashboard row updates once every draft is
  decided.
- **Dashboard** — clicking a creator row with a submission reopens the
  review at that creator; Esc or the × closes it.

## Structure

- `src/data.ts` — review queue (4 creators, 9 clips), captions, dashboard rows
- `src/videoTime.ts` — tiny pub/sub store for the video clock (keeps
  per-frame updates out of the React tree except two small subscribers)
- `src/components/VideoPane.tsx` — player, badge, sound, control bar
- `src/components/ReviewModal.tsx` — stage, panel, feedback, decisions
- `src/components/Dashboard.tsx` — background page
- `scripts/make-videos.mjs` — demo clip renderer
