# Brand Portal — Review content (project map)

Read this first. It exists so you can make changes without re-reading the whole
codebase or re-fetching Figma. Update it whenever you change anything meaningful.

## What this is

Pixel-perfect Vite + React 19 + TypeScript prototype of Benable's Brand Portal
"Review content" flow, built from Figma file `8rB3KQsQhmJrnQk3EFkcDx` (Design Labs).
Plain CSS (no Tailwind — deliberate). Dev: `npm run dev` → http://localhost:5173.
GitHub: private repo `AmineBenjil/brand-portal-review-content`, branch `main`.

## Figma sources (current = v3)

- v3 dashboard page: node `12278:171670` (78%, Review drafts funnel stage, CTA rows)
- v2 modal: page `12274:169758`, overlay `12274:170033`, right panel `12275:170273`
  (Review drafts topbar + pager, thumbnail strip)
- v1 (superseded): `12264:129746` / `12271:169242` / `12271:169266`
- Design canvas is 1512×1024; layout uses left/right anchoring so it's exact at
  that size and stretches sensibly elsewhere. `min-width: 1280px`, `overflow: hidden`.

## File map (all small; read only what you need)

- `src/data.ts` — ALL demo content. `reviewQueue`: 4 creators (emery ×3 clips,
  quinn ×3, carter ×2 — carter's clip ids/files are `jasper-*`, julian ×1), each
  clip = {id, badge IG Reel/Story, src, poster, duration:8, caption segments with
  mention/hashtag tones}. `dashboardCreators`: 8 table rows (3 with reviewId →
  CTA rows, 1 avatar-less "Sourcing" placeholder row).
- `src/App.tsx` — state owner: reviewOpen (starts false), creatorIdx, clipIdx,
  feedback per clipId, decisions per creatorId, flat clip stepping (`step`),
  decide() advances forward-with-wrap to next undecided creator, else closes.
- `src/components/Dashboard.tsx` — sidebar/header/funnel/creators table/side
  cards. Local `reviewFilter` state: clicking the "Review drafts" funnel bar
  filters table to reviewId rows. `decisionLabel()` swaps row status after a
  decision. Funnel stages are a const array at the top.
- `src/components/ReviewModal.tsx` — the whole modal. Topbar pager ‹ n/4 ›,
  creator info, caption, feedback list + composer (timestamp pill), footer
  Decline / Request changes (needs feedback) / Approve. Also: thumbnail strip,
  1s skeleton on flips (`skeleton: 'none'|'video'|'full'` — full on creator
  change, video-only on clip change), approve overlay (1.4s animated check,
  then onDecide), decline prompt (DECLINE_VARIANT const: 'sheet' default,
  '?decline=center' URL param → centered dialog; submit records reason as
  feedback + declines).
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

## Conventions when editing

- Match Figma exactly: fetch the node, use its px values, download any new
  assets into `public/assets` with semantic names.
- Copy follows the Benable brand voice (outcome-first, one concrete detail,
  managed-service "we'll handle it" tone; CTAs name the action).
- Verify with `npx tsc -b` + the running dev server before claiming done.
- After meaningful changes: update this file + README, commit to `main`, push.
