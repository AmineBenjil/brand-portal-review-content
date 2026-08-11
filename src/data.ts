export type CaptionSegment = {
  text: string
  tone?: 'mention' | 'hashtag'
}

export type Clip = {
  id: string
  badge: 'IG Reel' | 'IG Story'
  src: string
  poster: string
  /** seconds — used for layout before metadata loads */
  duration: number
  caption: CaptionSegment[][]
}

export type Creator = {
  id: string
  name: string
  firstName: string
  handle: string
  avatar: string
  clips: Clip[]
}

/** Creators with submitted content, in review order (Creator 1/4 … 4/4). */
export const reviewQueue: Creator[] = [
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
      },
      {
        id: 'emery-2',
        badge: 'IG Reel',
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
      },
      {
        id: 'emery-3',
        badge: 'IG Reel',
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
        badge: 'IG Story',
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
      },
      {
        id: 'quinn-3',
        badge: 'IG Story',
        src: '/videos/quinn-3.mp4',
        poster: '/assets/video/ugc/quinn-3.jpg',
        duration: 8,
        caption: [
          [
            { text: 'Last slide 👀 Use my code QUINN10 at ' },
            { text: '@holapikora', tone: 'mention' },
          ],
          [{ text: '#pikora', tone: 'hashtag' }],
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
      },
      {
        id: 'jasper-2',
        badge: 'IG Reel',
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
      },
    ],
  },
]

export type FeedbackMessage = {
  id: number
  text: string
  /** seconds into the clip, or null when sent without a timestamp */
  timestamp: number | null
}

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

export const dashboardCreators: DashboardRow[] = [
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
    status: 'Delivered yesterday',
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
