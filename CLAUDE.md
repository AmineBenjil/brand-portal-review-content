# Brand Portal — Review content (project map)

Read this first. It exists so you can make changes without re-reading the whole
codebase or re-fetching Figma. Update it whenever you change anything meaningful.

## What this is

Pixel-perfect Vite + React 19 + TypeScript prototype of Benable's Brand Portal
"Review content" flow, built from Figma file `8rB3KQsQhmJrnQk3EFkcDx` (Design Labs).
Plain CSS (no Tailwind — deliberate). Dev: `npm run dev` → http://localhost:5173.
GitHub: private repo `AmineBenjil/brand-portal-review-content`, branch `main`.

## Figma sources (current = v5 panel, v4 modal shell, v3 dashboard)

- v5 right panel: page `12295:173210`, panel `12295:173508` (creator → Drafts
  carousel → Caption order, "Drafts (n)" header with pager)
- v5.1 thumb decision state: page `12298:173629`, thumbs `12298:173959` /
  `12298:173962` (20px icon inset 4/4, 0.3 dim overlay on decided thumbs)
- v4 modal: page `12292:172790`, overlay `12292:173065`, left stage `12292:173068`,
  right panel `12292:173088` (superseded by v5 panel layout)
- v4 request-changes prompt: `12289:172657` (410×486 sheet: 🖊️ icon, chips,
  Send, Keep reviewing) — the ONLY feedback entry point (panel composer removed)
- v3 dashboard page: node `12278:171670` (78%, Review drafts funnel stage, CTA rows)
- v2 modal (superseded): page `12274:169758`, overlay `12274:170033`, right panel
  `12275:170273`
- v1 (superseded): `12264:129746` / `12271:169242` / `12271:169266`
- Design canvas is 1512×1024; layout uses left/right anchoring so it's exact at
  that size and stretches sensibly elsewhere. `min-width: 1280px`, `overflow: hidden`.

## File map (all small; read only what you need)

- `src/data.ts` — ALL demo content. `reviewQueue`: 4 creators (emery ×5 clips
  — 4 and 5 reuse emery-2/3 footage as "alternate takes" so the carousel has
  overflow; quinn ×3, carter ×2 — carter's clip ids/files are `jasper-*`,
  julian ×1), each
  clip = {id, badge IG Reel/Story, src, poster, duration:8, caption segments with
  mention/hashtag tones}. `dashboardCreators`: 8 table rows (3 with reviewId →
  CTA rows, 1 avatar-less "Sourcing" placeholder row).
- `src/App.tsx` — state owner: reviewOpen (starts false), creatorIdx, clipIdx,
  feedback per clipId, decisions per CLIP id ('approved' | 'changes').
  decide() advances to the next undecided draft of the creator, else to the
  next creator with undecided drafts (wrapping), else closes. Dashboard gets
  derived creator-level decisions (row flips only when all drafts decided;
  any 'changes' wins over 'approved').
- `src/components/Dashboard.tsx` — sidebar/header/funnel/creators table/side
  cards. Local `reviewFilter` state: clicking the "Review drafts" funnel bar
  filters table to reviewId rows. `decisionLabel()` swaps row status after a
  decision. Funnel stages are a const array at the top.
- `src/components/ReviewModal.tsx` — the whole modal (v5 panel). Topbar
  "Review" + ‹ n/4 › creator pager; stage arrows flip DRAFTS within the
  creator (disabled at ends). Panel order (absolute layout): creator (68),
  "Drafts (n)" header (117, count in #aaa, 12px pager arrows right), drafts
  carousel (viewport 131..261, left 20 → panel edge so a 5th thumb peeks
  clipped; track top 14px inside for icon headroom; steps 95px via
  `draftScroll`, clamped to `maxDraftScroll`, resets per creator,
  auto-scrolls to keep the selected thumb visible), caption (271). Thumbs
  85×110, selected = 2px purple ::after ring; decided thumbs get a 0.3 dark
  overlay + status icon inset in the top-right corner (28px SVG at top
  1/right 0 → 20px circle at 4/4, shadow baked into the export — icons are
  `draft-approved.svg` / `draft-changes.svg`, re-exported at 28px in v5.1).
  Feedback section (divider/head/list at 371/383/406)
  renders ONLY when the draft has notes; no composer in the panel — feedback
  is written solely in the request-changes sheet. Footer Request changes /
  Approve (both disabled at 0.2 opacity once the draft is decided). 1s
  skeleton on flips ('full' on creator
  change, 'video' on clip change), approve overlay (1.4s animated check, then
  onDecide). Decline flow removed in v4. Feedback section kept from v2 (the
  v4 mock leaves that area empty — deliberate carry-over, not in the mock).
  Request changes opens a slide-up sheet (`changes-*` classes, Figma
  `12289:172657`, 410×486 over the right panel): autofocused textarea
  (strong border on :focus), 4 quick-fill chips (append to text), Send wakes
  on first character (else 0.2 opacity), Enter sends; submit records the
  reason as feedback (no timestamp), then the same check overlay runs with
  "Changes requested" copy before the decision locks in. The check overlay is
  shared: `confirming: Decision | null` picks Approved / Changes-requested
  title + sub.
- `src/components/VideoPane.tsx` — <video> + IG badge + sound + play overlay +
  control bar (scrub via pointer capture). Publishes clock via rAF into store.
- `src/videoTime.ts` — VideoTimeStore (useSyncExternalStore pub/sub) so only the
  control bar + timestamp pill re-render per frame. `formatTime`.
- `src/styles/base.css` (tokens + Inter @font-face), `dashboard.css`, `modal.css`.
  Class names are semantic; Figma px values are hardcoded on purpose.
- `scripts/make-videos.mjs` — OFFLINE FALLBACK ONLY (ffmpeg-static Ken Burns).
  Running it OVERWRITES the AI clips in public/videos. Don't run casually.

## Assets

- `public/assets/**` — every icon/image exported from Figma. NEVER hand-draw
  icons; re-export from Figma. Chevrons are one shape rotated via CSS (.chev-*).
  The eye icon is `icons/campaign-brief.svg` (reused in the Review content CTA).
- `public/videos/*.mp4` — 9 AI clips: Higgsfield Soul 2.0 stills → Seedance 2.0
  image-to-video, 8s, 720×1280, AAC speech audio, one consistent woman per
  creator. Stills = `public/assets/video/ugc/*.jpg` (used as posters AND thumbs).
- `public/fonts/inter-var-latin.woff2` — self-hosted Inter variable (100–900).

## Hard-won gotchas (do not rediscover these)

1. `.review-stage`/`.review-modal` use `overflow: clip` and the oversized
   gradient img sits in its own clipped wrapper (`.stage-gradient-clip`).
   With plain `overflow: hidden`, focus/scrollIntoView scrolls the stage 144px
   and the whole layout shifts. Keep `clip`.
2. Video frame border is drawn by `.video-frame::after` (inner ring), NOT a CSS
   border — a real border offsets absolutely-positioned children by 2px vs Figma.
3. The browser-pane automation's coordinate clicks can drift (scale bug); trust
   JS/DOM checks (`elementFromPoint`, dispatched events) over missed clicks, and
   the pane's Return key sends key:"" — the app handles Enter||keyCode 13.
4. Figma design-context output >25k tokens gets truncated — fetch sub-nodes
   (e.g. the right panel node) separately instead of the whole page.
5. zsh doesn't word-split unquoted vars; use `while read` loops in Bash calls.
6. Higgsfield batch API may return a preset recommendation instead of submitting
   — resubmit with `declined_preset_id`.

## Decisions log (chronological)

1. **v1 build** — dashboard + modal, video/timestamp-pill sync, timestamped
   feedback, clip/creator arrows, decisions, Ken Burns placeholder videos.
2. **v2 modal** — "Review drafts" topbar with ‹ n/4 › pager (replaced dropdown +
   progress header), clip thumbnail strip (32×44, selected = white border +
   0.3 overlay + check), video up 17px, "Clip x of y" title + "Clip n" label
   removed, footer pl-12.
3. **AI videos** — replaced Ken Burns clips with Soul 2.0 + Seedance 2.0 renders
   (user request: UGC woman talking about a product; ~325 credits). Durations
   all 8s; posters switched to the generated stills.
4. **v3 dashboard** — 78%, 9-stage funnel with clickable "Review drafts" (5,
   amber badge 3) that filters the table; amber "Waiting your review" rows with
   eye "Review content" CTA pills opening the modal; Carter Price added to the
   queue (owns old jasper clips, willow avatar); dashed "?" Sourcing row; app
   now opens on the dashboard.
5. **Polish** — decline feedback prompt (sheet default / centered via URL param,
   💬 icon, brand-voice copy, records reason as feedback), animated approve
   check overlay, 1s skeletons on creator/clip flips.
6. Mock cursor from Figma (`12271:169247`) intentionally omitted; every creator
   handle is `@maya.skin` (design mock data, kept verbatim).
7. **v4 modal** — thumbnails moved from under the video into a "n Drafts"
   section under the caption (85×110, decision icons `draft-approved.svg` /
   `draft-changes.svg` — 24px exports with baked-in shadow, circle at (4,3));
   video up to 336×598 centered (no thumbs below); stage arrows now switch
   drafts, topbar pager switches creators; Decline CTA + prompt removed —
   footer is Request changes (flex-1, h46) / Approve (197×44); decisions are
   per draft and lock the CTAs at 0.2 opacity on revisit; request-changes no
   longer requires feedback.

## Conventions when editing

- Match Figma exactly: fetch the node, use its px values, download any new
  assets into `public/assets` with semantic names.
- Copy follows the Benable brand voice (outcome-first, one concrete detail,
  managed-service "we'll handle it" tone; CTAs name the action).
- Verify with `npx tsc -b` + the running dev server before claiming done.
- After meaningful changes: update this file + README, commit to `main`, push.
