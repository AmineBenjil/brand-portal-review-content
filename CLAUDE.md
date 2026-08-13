# Brand Portal — Review content (project map)

Read this first. It exists so you can make changes without re-reading the whole
codebase or re-fetching Figma. Update it whenever you change anything meaningful.

## What this is

Pixel-perfect Vite + React 19 + TypeScript prototype of Benable's Brand Portal
"Review content" flow, built from Figma file `8rB3KQsQhmJrnQk3EFkcDx` (Design Labs).
Plain CSS (no Tailwind — deliberate). Dev: `npm run dev` → http://localhost:5173.
GitHub: private repo `AmineBenjil/brand-portal-review-content`, branch `main`.

## Figma sources (current = v6 panel states + sheet, v5 panel, v3 dashboard)

- v6 "Modal updates" section `12324:1921`: request-sent panel `12321:176959`
  (panel `12321:176980`), approved panel `12324:1922` (footer `12324:1944`),
  request-changes sheet `12324:2042` (410×532). Brings: type labels under
  thumbs, floating lavender selection ring, play glyph + dim on every thumb,
  pre-check grey card, decided-state footer rails, new sheet layout.
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

## Collab modes (LOCAL vs PRODUCT)

Two campaign types, per Julia's master-prototype spec (the pasted
`local-vs-product-collab-instructions.md`): **product** (creator receives a
product — Pikora SPF demo) and **local** (creator visits the business —
Trilogy spas demo; no product/order/shipping vocabulary anywhere, ever).
`src/mode.ts` reads `?mode=local` from the URL (default product), module-
persists it, and the fixed bottom-left demo pill (`.mode-toggle`, base.css)
flips it live (closes any open review, resets indices; decisions survive —
clip ids are distinct per mode). ALL mode-dependent content is keyed by mode
in `data.ts` (`reviewQueues`, `dashboardData`) — never branched ad-hoc in
JSX. Most sheet/overlay strings are Julia's verbatim copy (incl. she/her
pronouns — deliberate, do not "fix"). Local footage reuses the product UGC
clips as stand-ins.

## File map (all small; read only what you need)

- `src/mode.ts` — CollabMode type, `initialMode()` (URL → module cache),
  `persistMode()` (updates cache + replaceState URL).
- `src/data.ts` — ALL demo content, keyed by mode. `reviewQueues.product`:
  4 creators (emery ×5 clips — 4 and 5 reuse emery-2/3 footage as "alternate
  takes" so the carousel has overflow; quinn ×3, carter ×2 — carter's clip
  ids/files are `jasper-*`, julian ×1). `reviewQueues.local`: Maya ×2 (IG
  Reel + IG Story) + Jade ×1 (TikTok — text-only badge, no IG rings), all
  Trilogy-spa captions verbatim from Julia's REVIEW.local. Each clip =
  {id, badge IG Reel/Story/TikTok, src, poster, duration:8, caption segments,
  checks[] (Katie's-team pre-checks), suggestions[] {label, fill} (caption-
  aware chips)}. Pre-check pattern: product verifies the product is shown/
  named + shop linked; local verifies the place is shown/named/tagged +
  booking page linked; disclosure and "sounds like her" in both.
  `dashboardData[mode]`: workspace, campaignTitle, funnelStages (local swaps
  Order shipped/delivered → Confirmed/Visited), reviewSubline, 8 table rows
  (product rows unchanged from v3; local rows use §6 statuses like
  "📅 Visiting tomorrow at 2pm" — keep statuses ≤ one line in the 238px
  column), away/next side-card rows as {emoji, parts[{text, tone}]}.
- `src/App.tsx` — state owner: reviewOpen (starts false), creatorIdx, clipIdx,
  feedback per clipId, decisions per CLIP id ('approved' | 'changes').
  decide() advances to the next undecided draft of the creator, else to the
  next creator with undecided drafts (wrapping), else closes. Dashboard gets
  derived creator-level decisions (row flips only when all drafts decided;
  any 'changes' wins over 'approved').
- `src/components/Dashboard.tsx` — sidebar/header/funnel/creators table/side
  cards, all content from `dashboardData[mode]` (funnel, rows, side cards —
  no hardcoded copy left in the JSX). Local `reviewFilter` state: clicking
  the "Review drafts" funnel bar filters table to reviewId rows.
  `decisionLabel()` swaps row status after a decision. Layout: sidebar +
  header are fixed; everything else lives in `.dashboard-scroll` (absolute,
  below the 165px header, overflow-y auto, padding 32/24/24/32) — progress
  section in flow, then `.dashboard-columns` (flex, gap 20) with the
  creators table (flex:1, min-width 615) and side cards (370 fixed). At
  1512 this reproduces the Figma px exactly (table 847 @ 251); wider
  windows stretch the table, keeping the 20px gutter. Row status pill/CTA
  are right-anchored (order right 155, CTA center 187 from row right).
- `src/components/ReviewModal.tsx` — the whole modal (v6 panel states). Topbar
  "Review" + ‹ n/4 › creator pager; stage arrows flip DRAFTS within the
  creator (disabled at ends). Panel order (absolute layout): creator (68),
  "Drafts (n)" header (124, count in #aaa, 12px pager arrows right), drafts
  carousel (viewport left 18 → panel edge, top 138 h146, so a 5th thumb peeks
  clipped; track left 2/top 14 inside for ring + icon headroom; steps 95px via
  `draftScroll`, clamped to `maxDraftScroll`, resets per creator,
  auto-scrolls to keep the selected thumb visible), caption (298). Thumbs
  85×110 at panel x20/y152: every thumb has a 0.2 dim + centered play glyph
  (`thumb-play.svg` 8.93×8, CSS-rotated 90°) + a 10px type label hanging at
  top 118 (`clip.badge`; #aaa, selected #1c1c1c); selected = 1.5px #aa97ff
  ring floating 2px OUTSIDE the thumb (::after inset -2, radius 10) + 0 4 12
  shadow; decided thumbs deepen the dim to 0.3 + status icon in the top-right
  corner (28px SVG at top 1/right 0 → 20px circle at 4/4, shadow baked into
  the export — `draft-approved.svg` / `draft-changes.svg`). `.panel-below`
  (top 402) holds the pre-check grey card (`.precheck`: #f9f9f9, 1px #efefef,
  radius 12, green `precheck-tick.svg` ticks — no foot line since v6) then
  the Feedback list, ONLY when the draft has notes; no composer in the panel.
  Footer: undecided = nudge + Request changes / Approve CTAs (disabled only
  while confirming); decided = `.is-decided` grey rail (h82, #f9f9f9) with
  "🎉 Approved" (🎉 bold, text medium) or "Request sent to {name} — we'll
  email you when the new draft is ready." (296px wrap, lead semibold) — the
  old 0.2-opacity locked CTAs are gone. 1s skeleton on flips ('full' on
  creator change, 'video' on clip change), approve overlay (1.4s animated
  check, then onDecide). Request changes opens the v6 slide-up sheet
  (`changes-*` classes, Figma `12324:2042`, 410 wide, min-height 532, close X
  top-right): 48px 🖊️ circle, "What should change?", sub "Small tweaks are
  more welcomed by creators. Need something re-filmed? That's a bigger ask.
  {tail}" (tail by mode: product "Creators would need to re-film from
  scratch." / local verbatim "Creators would need another visit."),
  autofocused textarea (placeholder "Add your feedback — we'll pass it
  straight to {name}", strong border on :focus), ONE flat chip wrap =
  clip.suggestions + shared QUICK_FIXES (Caption tweak, Different cover
  frame, Text on screen, Trim or reorder clips — no emojis/group labels;
  chips FILL starter sentences), full-bleed footer rail (#fcfcfc, 1px top)
  with purple `info-16.svg` + "One change round included" above "Send to
  {name}" (disabled = #c6c6c6 at 0.7 until first character; Enter sends).
  Removed in v6: "Keep reviewing", "Talk to Katie's team →", chip group
  headers, mode placeholders, "Goes straight to her" meta line. Submit
  records the reason as feedback (no timestamp), then the shared check
  overlay (`confirming: Decision | null`) runs before the decision locks in.
- `src/components/CelebrationModal.tsx` — "Every draft reviewed!" congrats pop-up.
  Shown by App once ALL drafts across the queue are decided (decide()'s close
  branch sets `celebrating`). Fixed scrim over the dashboard, 440px card,
  CSS-only confetti (56 deterministic pieces, sin-hash rand — no Math.random),
  reuses the approve-check draw animation at 76px, sub copy swaps on the
  approved/changes split (all approved / none approved / mixed with counts),
  CTA "Got it!" (click scrim or Esc also dismiss). Styles at the bottom of
  modal.css (`celebrate-*`, `confetti-*`).
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
  v6 adds `icons/precheck-tick.svg` (green #18906C 12px check),
  `icons/thumb-play.svg` (white triangle, CSS-rotated 90°), `icons/info-16.svg`
  (purple #7A5CFA ⓘ). Figma exports carry `preserveAspectRatio="none"` — size
  imgs to the SVG's own ratio or they stretch.
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
7. Figma draws dividers as `0.5px` hairlines (e.g. panel topbar `12298:173947`,
   panel footer). Browsers snap sub-pixel borders away, so they paint as nothing.
   Always use `1px solid var(--default-border-base)` — that's what every other
   divider in the app uses. Deliberate deviation from the Figma px value.

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
8. **Celebration pop-up** — when the last undecided draft in the queue gets a
   decision, the review modal closes and a one-shot congrats modal appears
   (confetti + animated check + counts + "Got it!"). No Figma node — designed
   in code to match the app's tokens; copy follows the brand-voice pattern.
9. **LOCAL vs PRODUCT modes** (Julia's spec) — `?mode=` + demo toggle; data
   layer keyed by mode; review sheet upgraded: verbatim reshoot line with
   mode-dependent ask + "Talk to Katie's team →" (no-op link), mode
   placeholders, "Suggested · from her caption" chips + "Quick fixes · no
   re-filming" chips (chips now FILL starter sentences, not comma-append),
   "Send to {name}" + "Goes straight to her · one change round included";
   panel gained a "Katie's team pre-checked" section (flow `.panel-below`
   container that also hosts feedback — the old absolute feedback layout is
   gone) and a waiting nudge above the footer CTAs; approve overlay copy is
   now Julia's verbatim ("Approved — {name} will post it within days." /
   "Sent to {name}."). The sheet is flow-layout now (min-height 486, grows).
   NOT implemented (no surface in this prototype): §6 Confirm-visit /
   Ship-and-add-tracking modals, rail NEXT_HINTS, approved-state note input.
10. **v6 modal states** (Figma section `12324:1921`) — thumbs gained type
    labels + play glyph + always-on dim + floating lavender selection ring;
    pre-checks became a grey card (foot line dropped); decided drafts swap
    the footer CTAs for status rails ("🎉 Approved" / "Request sent to
    {name} — …"); request-changes sheet rebuilt (410×532: new sub copy with
    mode-keyed re-film tail — the mock's "another visit" line kept verbatim
    for local, product uses "re-film from scratch" to respect mode vocab —
    name-based placeholder, one flat chip wrap keeping the fill treatment,
    ⓘ "One change round included" + Send footer rail; removed "Keep
    reviewing", "Talk to Katie's team →", chip group headers). Feedback list
    kept below the pre-check card — deliberate carry-over, not in the mock.

## Conventions when editing

- Match Figma exactly: fetch the node, use its px values, download any new
  assets into `public/assets` with semantic names.
- Copy follows the Benable brand voice (outcome-first, one concrete detail,
  managed-service "we'll handle it" tone; CTAs name the action).
- Verify with `npx tsc -b` + the running dev server before claiming done.
- After meaningful changes: update this file + README, commit to `main`, push.
