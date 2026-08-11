// Generates the demo review clips as real MP4 videos (Ken Burns motion over
// the campaign photos pulled from the Figma file) so playback, seeking and
// the feedback timestamp sync all behave like production footage.
import { execFileSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import ffmpeg from 'ffmpeg-static'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const srcDir = path.join(root, 'scripts', 'src-photos')
const outDir = path.join(root, 'public', 'videos')
mkdirSync(outDir, { recursive: true })

const W = 632 // 2x of the 316x569 frame
const H = 1138
const FPS = 30

// motion: zoom-in | zoom-out | pan-up | pan-down
const clips = [
  { out: 'emery-1.mp4', src: 'emery-ringlight.png', dur: 18, motion: 'zoom-in' },
  { out: 'emery-2.mp4', src: 'emery-unboxing.png', dur: 12, motion: 'zoom-out' },
  { out: 'emery-3.mp4', src: 'emery-beauty.jpeg', dur: 9, motion: 'pan-up' },
  { out: 'quinn-1.mp4', src: 'quinn.jpeg', dur: 15, motion: 'zoom-in' },
  { out: 'quinn-2.mp4', src: 'quinn.jpeg', dur: 10, motion: 'pan-down' },
  { out: 'quinn-3.mp4', src: 'quinn.jpeg', dur: 8, motion: 'zoom-out' },
  { out: 'jasper-1.mp4', src: 'jasper.jpeg', dur: 14, motion: 'zoom-in' },
  { out: 'jasper-2.mp4', src: 'jasper.jpeg', dur: 11, motion: 'pan-up' },
  { out: 'julian-1.mp4', src: 'julian.jpeg', dur: 16, motion: 'zoom-out' },
]

function motionExpr(motion, frames) {
  const center = { x: '(iw-iw/zoom)/2', y: '(ih-ih/zoom)/2' }
  switch (motion) {
    case 'zoom-in':
      return { z: `1+0.14*on/${frames}`, ...center }
    case 'zoom-out':
      return { z: `1.14-0.14*on/${frames}`, ...center }
    case 'pan-up':
      return { z: '1.12', x: center.x, y: `(ih-ih/zoom)*(1-on/${frames})` }
    case 'pan-down':
      return { z: '1.12', x: center.x, y: `(ih-ih/zoom)*on/${frames}` }
  }
}

for (const clip of clips) {
  const frames = clip.dur * FPS
  const { z, x, y } = motionExpr(clip.motion, frames)
  // Upscale before zoompan to avoid sub-pixel jitter, then crop to 9:16.
  const filter =
    `[0:v]scale=${W * 4}:${H * 4}:force_original_aspect_ratio=increase,` +
    `crop=${W * 4}:${H * 4},` +
    `zoompan=z='${z}':x='${x}':y='${y}':d=${frames}:s=${W}x${H}:fps=${FPS},format=yuv420p[v]`

  const args = [
    '-y',
    '-loop', '1',
    '-i', path.join(srcDir, clip.src),
    '-f', 'lavfi',
    '-i', 'anullsrc=r=44100:cl=stereo',
    '-t', String(clip.dur),
    '-filter_complex', filter,
    '-map', '[v]',
    '-map', '1:a',
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '25',
    '-c:a', 'aac',
    '-shortest',
    '-movflags', '+faststart',
    path.join(outDir, clip.out),
  ]
  process.stdout.write(`Rendering ${clip.out} (${clip.dur}s, ${clip.motion})… `)
  execFileSync(ffmpeg, args, { stdio: ['ignore', 'ignore', 'pipe'] })
  console.log('done')
}
console.log('All clips rendered to public/videos')
