import type { CollabMode } from './mode'

export type CaptionSegment = {
  text: string
  tone?: 'mention' | 'hashtag'
}

/** Caption-aware suggestion chip in the request-changes sheet (label → fill). */
export type Suggestion = {
  label: string
  fill: string
}

export type Clip = {
  id: string
  badge: 'IG Reel' | 'IG Story' | 'TikTok'
  src: string
  poster: string
  /** seconds — used for layout before metadata loads */
  duration: number
  caption: CaptionSegment[][]
  /** Katie's-team pre-checks, verified against the brief before review */
  checks: string[]
  /** caption-aware suggestions shown above the shared quick fixes */
  suggestions: Suggestion[]
}

export type Creator = {
  id: string
  name: string
  firstName: string
  handle: string
  avatar: string
  clips: Clip[]
}

/**
 * Product collab — Pikora SPF. Creators with submitted content, in review
 * order. Pre-check pattern: the *product* is shown/named, the shop is
 * linked; disclosure + "sounds like her" appear in both modes.
 */
const productQueue: Creator[] = [
  {
    id: 'emery',
    name: 'Emery Peterson',
    firstName: 'Emery',
    handle: '@maya.skin',
    avatar: '/assets/avatars/emery-c.png',
    clips: [
      {
        id: 'emery-1',
        badge: 'IG Reel',
        src: '/videos/emery-1.mp4',
        poster: '/assets/video/ugc/emery-1.jpg',
        duration: 8,
        caption: [
          [
            { text: '@holapikora', tone: 'mention' },
            {
              text: ' Obsessed with this SPF from 28litsea 🌞 It goes on so clean — no white cast, no greasy feeling. This is the one for summer. Link in bio!',
            },
          ],
          [{ text: '#pikora', tone: 'hashtag' }],
        ],
        checks: [
          'Shows the product clearly',
          'Names Pikora',
          'Discloses the partnership',
          'Sounds like her — no script',
        ],
        suggestions: [
          { label: 'Mention it’s reef-safe', fill: 'Could the caption mention it’s reef-safe?' },
          { label: 'Add the shade name', fill: 'Could the caption include the shade you’re wearing?' },
        ],
      },
      {
        id: 'emery-2',
        badge: 'TikTok',
        src: '/videos/emery-2.mp4',
        poster: '/assets/video/ugc/emery-2.jpg',
        duration: 8,
        caption: [
          [
            { text: '@holapikora', tone: 'mention' },
            {
              text: ' Unboxing day 📦 The full summer kit just landed and the packaging is SO satisfying. Wait for the reveal…',
            },
          ],
          [{ text: '#pikora', tone: 'hashtag' }],
        ],
        checks: [
          'Shows the product clearly',
          'Names Pikora',
          'Discloses the partnership',
          'Sounds like her — no script',
        ],
        suggestions: [
          { label: 'Say it’s SPF 50', fill: 'Could the caption say it’s SPF 50?' },
          { label: 'Add the shade name', fill: 'Could the caption include the shade you’re wearing?' },
        ],
      },
      {
        id: 'emery-3',
        badge: 'IG Story',
        src: '/videos/emery-3.mp4',
        poster: '/assets/video/ugc/emery-3.jpg',
        duration: 8,
        caption: [
          [
            {
              text: 'That post-SPF glow ✨ No filter, no fuss — just ',
            },
            { text: '@holapikora', tone: 'mention' },
            { text: ' doing its thing.' },
          ],
          [{ text: '#pikora', tone: 'hashtag' }],
        ],
        checks: [
          'Shows the product clearly',
          'Names Pikora',
          'Discloses the partnership',
          'Sounds like her — no script',
        ],
        suggestions: [
          { label: 'Mention it’s reef-safe', fill: 'Could the caption mention it’s reef-safe?' },
          { label: 'Point to the shop link', fill: 'Could the caption point to the shop link in your bio?' },
        ],
      },
      // Alternate takes (same shoot, reused footage) — they push Emery past
      // four drafts so the thumbnail carousel has something to scroll.
      {
        id: 'emery-4',
        badge: 'IG Reel',
        src: '/videos/emery-2.mp4',
        poster: '/assets/video/ugc/emery-2.jpg',
        duration: 8,
        caption: [
          [
            { text: 'Round two with ' },
            { text: '@holapikora', tone: 'mention' },
            { text: ' — tried the dewy-finish look this time. Which take wins?' },
          ],
          [{ text: '#pikora', tone: 'hashtag' }],
        ],
        checks: [
          'Shows the product clearly',
          'Names Pikora',
          'Discloses the partnership',
          'Sounds like her — no script',
        ],
        suggestions: [
          { label: 'Add the shade name', fill: 'Could the caption include the shade you’re wearing?' },
          { label: 'Mention it’s reef-safe', fill: 'Could the caption mention it’s reef-safe?' },
        ],
      },
      {
        id: 'emery-5',
        badge: 'TikTok',
        src: '/videos/emery-3.mp4',
        poster: '/assets/video/ugc/emery-3.jpg',
        duration: 8,
        caption: [
          [
            { text: 'One week update — ' },
            { text: '@holapikora', tone: 'mention' },
            { text: ' every single morning. Zero breakouts, all glow.' },
          ],
          [{ text: '#pikora', tone: 'hashtag' }],
        ],
        checks: [
          'Shows the product clearly',
          'Names Pikora',
          'Discloses the partnership',
          'Sounds like her — no script',
        ],
        suggestions: [
          { label: 'Say it’s SPF 50', fill: 'Could the caption say it’s SPF 50?' },
          { label: 'Point to the shop link', fill: 'Could the caption point to the shop link in your bio?' },
        ],
      },
    ],
  },
  {
    id: 'quinn',
    name: 'Quinn Brooks',
    firstName: 'Quinn',
    handle: '@maya.skin',
    avatar: '/assets/avatars/quinn.png',
    clips: [
      {
        id: 'quinn-1',
        badge: 'IG Reel',
        src: '/videos/quinn-1.mp4',
        poster: '/assets/video/ugc/quinn-1.jpg',
        duration: 8,
        caption: [
          [
            { text: 'Morning routine, but make it minimal 🤍 Step one: ' },
            { text: '@holapikora', tone: 'mention' },
          ],
          [{ text: '#pikora', tone: 'hashtag' }],
        ],
        checks: [
          'Shows the product clearly',
          'Tags @pikora',
          'Shop linked in bio',
          'Discloses the partnership',
        ],
        suggestions: [
          {
            label: 'Link the product page',
            fill: 'Could the bio link point to the tinted SPF page instead of the shop home?',
          },
          { label: 'Say it’s SPF 50', fill: 'Could the caption say it’s SPF 50?' },
        ],
      },
      {
        id: 'quinn-2',
        badge: 'IG Story',
        src: '/videos/quinn-2.mp4',
        poster: '/assets/video/ugc/quinn-2.jpg',
        duration: 8,
        caption: [
          [
            { text: 'Swipe up for the before & after — still can’t believe this is one week with ' },
            { text: '@holapikora', tone: 'mention' },
          ],
          [{ text: '#pikora', tone: 'hashtag' }],
        ],
        checks: [
          'Shows the product clearly',
          'Tags @pikora',
          'Link sticker to your shop',
          'Discloses the partnership',
        ],
        suggestions: [
          { label: 'Add the shade name', fill: 'Could the caption include the shade you’re wearing?' },
          {
            label: 'Link the product page',
            fill: 'Could the link sticker point to the tinted SPF page instead of the shop home?',
          },
        ],
      },
      {
        id: 'quinn-3',
        badge: 'TikTok',
        src: '/videos/quinn-3.mp4',
        poster: '/assets/video/ugc/quinn-3.jpg',
        duration: 8,
        caption: [
          [
            { text: 'Restock day 👀 Use my code QUINN10 at ' },
            { text: '@holapikora', tone: 'mention' },
          ],
          [{ text: '#pikora', tone: 'hashtag' }],
        ],
        checks: [
          'Shows the product clearly',
          'Tags @pikora',
          'Shop linked in bio',
          'Discloses the partnership',
        ],
        suggestions: [
          { label: 'Say it’s SPF 50', fill: 'Could the caption say it’s SPF 50?' },
          { label: 'Mention it’s reef-safe', fill: 'Could the caption mention it’s reef-safe?' },
        ],
      },
    ],
  },
  {
    id: 'carter',
    name: 'Carter Price',
    firstName: 'Carter',
    handle: '@maya.skin',
    avatar: '/assets/avatars/willow.png',
    clips: [
      {
        id: 'jasper-1',
        badge: 'IG Reel',
        src: '/videos/jasper-1.mp4',
        poster: '/assets/video/ugc/jasper-1.jpg',
        duration: 8,
        caption: [
          [
            { text: 'POV: your skincare finally keeps up with festival season 🎪 ' },
            { text: '@holapikora', tone: 'mention' },
          ],
          [{ text: '#pikora', tone: 'hashtag' }],
        ],
        checks: [
          'Shows the product clearly',
          'Names Pikora',
          'Discloses the partnership',
          'Sounds like her — no script',
        ],
        suggestions: [
          { label: 'Mention it’s reef-safe', fill: 'Could the caption mention it’s reef-safe?' },
          { label: 'Point to the shop link', fill: 'Could the caption point to the shop link in your bio?' },
        ],
      },
      {
        id: 'jasper-2',
        badge: 'IG Story',
        src: '/videos/jasper-2.mp4',
        poster: '/assets/video/ugc/jasper-2.jpg',
        duration: 8,
        caption: [
          [
            { text: 'Day 30 with ' },
            { text: '@holapikora', tone: 'mention' },
            { text: ' — the results speak for themselves.' },
          ],
          [{ text: '#pikora', tone: 'hashtag' }],
        ],
        checks: [
          'Shows the product clearly',
          'Names Pikora',
          'Discloses the partnership',
          'Sounds like her — no script',
        ],
        suggestions: [
          { label: 'Say it’s SPF 50', fill: 'Could the caption say it’s SPF 50?' },
          { label: 'Add the shade name', fill: 'Could the caption include the shade you’re wearing?' },
        ],
      },
    ],
  },
  {
    id: 'julian',
    name: 'Julian Long',
    firstName: 'Julian',
    handle: '@maya.skin',
    avatar: '/assets/avatars/julian.png',
    clips: [
      {
        id: 'julian-1',
        badge: 'IG Reel',
        src: '/videos/julian-1.mp4',
        poster: '/assets/video/ugc/julian-1.jpg',
        duration: 8,
        caption: [
          [
            { text: 'Asked my barber, asked my dermatologist — both said ' },
            { text: '@holapikora', tone: 'mention' },
            { text: ' 💈 Full review in the comments.' },
          ],
          [{ text: '#pikora', tone: 'hashtag' }],
        ],
        checks: [
          'Shows the product clearly',
          'Names Pikora',
          'Discloses the partnership',
          'Sounds like her — no script',
        ],
        suggestions: [
          { label: 'Mention it’s reef-safe', fill: 'Could the caption mention it’s reef-safe?' },
          { label: 'Add the shade name', fill: 'Could the caption include the shade you’re wearing?' },
        ],
      },
    ],
  },
]

/**
 * Local collab — Trilogy spas (verbatim from Julia's REVIEW.local).
 * Pre-check pattern: the *place* is shown/named/tagged, the booking page is
 * linked. No product, no order, no shipping — ever. Footage reuses the UGC
 * clips (prototype stand-ins).
 */
const localQueue: Creator[] = [
  {
    id: 'maya',
    name: 'Maya Bennett',
    firstName: 'Maya',
    handle: '@maya.skin',
    avatar: '/assets/avatars/emery-c.png',
    clips: [
      {
        id: 'maya-1',
        badge: 'IG Reel',
        src: '/videos/emery-1.mp4',
        poster: '/assets/video/ugc/emery-1.jpg',
        duration: 8,
        caption: [
          [
            { text: 'Treated myself to the dreamiest facial at ' },
            { text: '@trilogyspas', tone: 'mention' },
            { text: ' — the full experience in one reel 🧖‍♀️' },
          ],
          [{ text: '#trilogypartner', tone: 'hashtag' }],
        ],
        checks: [
          'Mentions Trilogy by name',
          'Shows the treatment room',
          'Discloses the partnership',
          'Sounds like her — no script',
        ],
        suggestions: [
          { label: 'Mention the hot-stone add-on', fill: 'Could the caption mention the hot-stone add-on?' },
          { label: 'Add your booking link', fill: 'Could you add the booking link to the caption?' },
          { label: 'Name the facial', fill: 'Could the caption name the exact facial — the Glow Ritual?' },
        ],
      },
      {
        id: 'maya-2',
        badge: 'IG Story',
        src: '/videos/emery-2.mp4',
        poster: '/assets/video/ugc/emery-2.jpg',
        duration: 8,
        caption: [
          [{ text: 'Come with me for a reset day 🧖‍♀️' }],
          [{ text: 'Link sticker to your booking page on frame 3' }],
        ],
        checks: ['Tags @trilogyspas', 'Link sticker to booking page', 'Discloses the partnership'],
        suggestions: [
          {
            label: 'Link sticker earlier',
            fill: 'Could the link sticker be on the first frame instead of frame 3?',
          },
          { label: 'Tag the location', fill: 'Could you add the location tag on frame 1?' },
        ],
      },
    ],
  },
  {
    id: 'jade',
    name: 'Jade Coleman',
    firstName: 'Jade',
    handle: '@maya.skin',
    avatar: '/assets/avatars/quinn.png',
    clips: [
      {
        id: 'jade-1',
        badge: 'TikTok',
        src: '/videos/quinn-1.mp4',
        poster: '/assets/video/ugc/quinn-1.jpg',
        duration: 8,
        caption: [
          [
            { text: 'POV: your Sunday reset at ' },
            { text: '@trilogyspas', tone: 'mention' },
            { text: ' 💆‍♀️ — wait for the steam room' },
          ],
        ],
        checks: [
          'Mentions Trilogy by name',
          'Shows the space',
          'Discloses the partnership',
          'Tags the location',
        ],
        suggestions: [
          { label: 'Mention weekday hours', fill: 'Could the caption mention you can book weekdays too?' },
          {
            label: 'Point to the booking link',
            fill: 'Could the caption point to the booking link in your bio?',
          },
        ],
      },
    ],
  },
]

/** The review queue for each collab mode. */
export const reviewQueues: Record<CollabMode, Creator[]> = {
  product: productQueue,
  local: localQueue,
}

/** Kept for compatibility: the product queue (the original prototype data). */
export const reviewQueue = productQueue

export type FeedbackMessage = {
  id: number
  text: string
  /** seconds into the clip, or null when sent without a timestamp */
  timestamp: number | null
}

/* ------------------------------------------------------------------------- */
/* Dashboard content, keyed by mode                                          */
/* ------------------------------------------------------------------------- */

/** Rows shown in the dashboard "Creators" card, top to bottom (v3). */
export type DashboardRow = {
  name: string
  sub: string
  avatar: string | null
  status: string
  /** creator id in the review queue when this row is awaiting review */
  reviewId: string | null
  /** right-hand pill state for non-review rows */
  order: string | null
  orderTone: 'green' | 'gray'
}

export type FunnelStageData = {
  label: string
  sub: string
  check?: boolean
  fixed?: boolean
  count?: number
  active?: boolean
  review?: boolean
  badge?: number
}

export type SideRowPart = {
  text: string
  tone?: 'strong' | 'muted' | 'muted-normal' | 'muted-medium'
}

export type SideRowData = {
  emoji: string
  parts: SideRowPart[]
  /** first away-card row carries a width-tuning class from Figma */
  away1?: boolean
}

export type DashboardData = {
  workspace: string
  campaignTitle: string
  funnelStages: FunnelStageData[]
  reviewSubline: string
  rows: DashboardRow[]
  away: SideRowData[]
  next: SideRowData[]
}

const productRows: DashboardRow[] = [
  {
    name: 'Emery Peterson',
    sub: '@maya.skin',
    avatar: '/assets/avatars/emery-c.png',
    status: 'Waiting your review',
    reviewId: 'emery',
    order: null,
    orderTone: 'green',
  },
  {
    name: 'Quinn Brooks',
    sub: '@maya.skin',
    avatar: '/assets/avatars/quinn.png',
    status: 'Waiting your review',
    reviewId: 'quinn',
    order: null,
    orderTone: 'green',
  },
  {
    name: 'Carter Price',
    sub: '@maya.skin',
    avatar: '/assets/avatars/willow.png',
    status: 'Waiting your review',
    reviewId: 'carter',
    order: null,
    orderTone: 'green',
  },
  {
    name: 'Jasper Bryant',
    sub: '@maya.skin',
    avatar: '/assets/avatars/jasper.png',
    status: 'Confirmed — shipping next',
    reviewId: null,
    order: 'Accepted',
    orderTone: 'green',
  },
  {
    name: 'Julian Long',
    sub: '@maya.skin',
    avatar: '/assets/avatars/julian.png',
    status: '📬 Delivered yesterday',
    reviewId: null,
    order: 'Order shipped',
    orderTone: 'green',
  },
  {
    name: 'Keira Patterson',
    sub: '@maya.skin',
    avatar: '/assets/avatars/keira.png',
    status: 'Sketching content ideas',
    reviewId: null,
    order: 'Accepted',
    orderTone: 'green',
  },
  {
    name: 'Willow Foster',
    sub: '@maya.skin',
    avatar: '/assets/avatars/willow.png',
    status: 'Sourcing her replacement…',
    reviewId: null,
    order: 'Sourcing…',
    orderTone: 'gray',
  },
  {
    name: 'Sourcing',
    sub: 'New creators for your campaign',
    avatar: null,
    status: 'Sourcing her replacement…',
    reviewId: null,
    order: 'Sourcing…',
    orderTone: 'gray',
  },
]

const localRows: DashboardRow[] = [
  {
    name: 'Maya Bennett',
    sub: '@maya.skin',
    avatar: '/assets/avatars/emery-c.png',
    status: 'Waiting your review',
    reviewId: 'maya',
    order: null,
    orderTone: 'green',
  },
  {
    name: 'Jade Coleman',
    sub: '@maya.skin',
    avatar: '/assets/avatars/quinn.png',
    status: 'Waiting your review',
    reviewId: 'jade',
    order: null,
    orderTone: 'green',
  },
  {
    name: 'Jasper Bryant',
    sub: '@maya.skin',
    avatar: '/assets/avatars/jasper.png',
    status: 'She emailed you',
    reviewId: null,
    order: 'Accepted',
    orderTone: 'green',
  },
  {
    name: 'Julian Long',
    sub: '@maya.skin',
    avatar: '/assets/avatars/julian.png',
    status: '📅 Visiting tomorrow at 2pm',
    reviewId: null,
    order: 'Confirmed',
    orderTone: 'green',
  },
  {
    name: 'Keira Patterson',
    sub: '@maya.skin',
    avatar: '/assets/avatars/keira.png',
    status: '📅 Booked for Saturday morning',
    reviewId: null,
    order: 'Confirmed',
    orderTone: 'green',
  },
  {
    name: 'Sienna Park',
    sub: '@maya.skin',
    avatar: '/assets/avatars/willow.png',
    status: '✨ Visited — content in the works',
    reviewId: null,
    order: 'Visited',
    orderTone: 'green',
  },
  {
    name: 'Willow Foster',
    sub: '@maya.skin',
    avatar: '/assets/avatars/willow.png',
    status: 'Sourcing her replacement…',
    reviewId: null,
    order: 'Sourcing…',
    orderTone: 'gray',
  },
  {
    name: 'Sourcing',
    sub: 'New creators for your campaign',
    avatar: null,
    status: 'Sourcing her replacement…',
    reviewId: null,
    order: 'Sourcing…',
    orderTone: 'gray',
  },
]

/** Funnel: local swaps the two order stages for Confirmed → Visited (§5). */
const productFunnel: FunnelStageData[] = [
  { label: 'Sourcing', sub: 'All 6 moved ahead', check: true },
  { label: 'Invited', sub: 'All 6 moved ahead', check: true, fixed: true },
  { label: 'Accepted', sub: 'All 6 moved ahead', check: true },
  { label: 'Order shipped', sub: 'All 6 moved ahead', check: true },
  { label: 'Order delivered', sub: 'All 6 moved ahead', check: true },
  { label: 'Review drafts', sub: '5 videos need your review', count: 5, active: true, review: true, badge: 3 },
  { label: 'Content published', sub: 'Once quality checks pass', count: 0 },
  { label: 'Content published', sub: 'Once quality checks pass', count: 0 },
  { label: 'Thanked', sub: 'After posts go live', count: 0 },
]

const localFunnel: FunnelStageData[] = [
  { label: 'Sourcing', sub: 'All 6 moved ahead', check: true },
  { label: 'Invited', sub: 'All 6 moved ahead', check: true, fixed: true },
  { label: 'Accepted', sub: 'All 6 moved ahead', check: true },
  { label: 'Confirmed', sub: 'All 6 moved ahead', check: true },
  { label: 'Visited', sub: 'All 6 moved ahead', check: true },
  { label: 'Review drafts', sub: '3 videos need your review', count: 3, active: true, review: true, badge: 2 },
  { label: 'Content published', sub: 'Once quality checks pass', count: 0 },
  { label: 'Content published', sub: 'Once quality checks pass', count: 0 },
  { label: 'Thanked', sub: 'After posts go live', count: 0 },
]

export const dashboardData: Record<CollabMode, DashboardData> = {
  product: {
    workspace: 'Pikora',
    campaignTitle: 'Pikora Instant Bone Broth Collection',
    funnelStages: productFunnel,
    reviewSubline: '5 drafts need your review',
    rows: productRows,
    away: [
      {
        emoji: '✅',
        away1: true,
        parts: [
          { text: '5 of 6 creators confirmed and', tone: 'strong' },
          { text: ' ' },
          { text: 'ready to go', tone: 'muted' },
        ],
      },
      {
        emoji: '📦',
        parts: [
          { text: '4 packages shipped ', tone: 'strong' },
          { text: '— ', tone: 'muted-normal' },
          { text: 'first one already delivered', tone: 'muted-medium' },
        ],
      },
      {
        emoji: '🔁',
        parts: [
          { text: '3 stand-ins vetted ', tone: 'strong' },
          { text: 'for Lena’s replacement', tone: 'muted-medium' },
        ],
      },
      {
        emoji: '👋',
        parts: [
          { text: '2 delivery nudges sent ', tone: 'strong' },
          { text: '— nothing needed your input', tone: 'muted-medium' },
        ],
      },
    ],
    next: [
      {
        emoji: '📦',
        parts: [
          { text: '3 packages in transit ', tone: 'strong' },
          { text: '— ', tone: 'muted-normal' },
          { text: 'First delivery Thursday', tone: 'muted-medium' },
        ],
      },
      {
        emoji: '🔁',
        parts: [
          { text: 'Replacement picks ', tone: 'strong' },
          { text: '— ', tone: 'muted-normal' },
          { text: 'within 48h — we’ll ping you', tone: 'muted-medium' },
        ],
      },
      {
        emoji: '🎬',
        parts: [
          { text: 'First creators start filming ', tone: 'strong' },
          { text: '— This weekend', tone: 'muted-normal' },
        ],
      },
    ],
  },
  local: {
    workspace: 'Trilogy Spas',
    campaignTitle: 'Trilogy Spas Signature Facial Experience',
    funnelStages: localFunnel,
    reviewSubline: '3 drafts need your review',
    rows: localRows,
    away: [
      {
        emoji: '✅',
        away1: true,
        parts: [
          { text: '5 of 6 creators confirmed and', tone: 'strong' },
          { text: ' ' },
          { text: 'ready to go', tone: 'muted' },
        ],
      },
      {
        emoji: '📅',
        parts: [
          { text: '3 visits booked ', tone: 'strong' },
          { text: '— ', tone: 'muted-normal' },
          { text: 'first one tomorrow at 2pm', tone: 'muted-medium' },
        ],
      },
      {
        emoji: '🔁',
        parts: [
          { text: '3 stand-ins vetted ', tone: 'strong' },
          { text: 'for Lena’s replacement', tone: 'muted-medium' },
        ],
      },
      {
        emoji: '👋',
        parts: [
          { text: '2 booking nudges sent ', tone: 'strong' },
          { text: '— nothing needed your input', tone: 'muted-medium' },
        ],
      },
    ],
    next: [
      {
        emoji: '📅',
        parts: [
          { text: '2 visits this week ', tone: 'strong' },
          { text: '— ', tone: 'muted-normal' },
          { text: 'Tuesday 2pm and Saturday morning', tone: 'muted-medium' },
        ],
      },
      {
        emoji: '🔁',
        parts: [
          { text: 'Replacement picks ', tone: 'strong' },
          { text: '— ', tone: 'muted-normal' },
          { text: 'within 48h — we’ll ping you', tone: 'muted-medium' },
        ],
      },
      {
        emoji: '🎬',
        parts: [
          { text: 'First drafts land ', tone: 'strong' },
          { text: '— 7–10 days after each visit', tone: 'muted-normal' },
        ],
      },
    ],
  },
}
