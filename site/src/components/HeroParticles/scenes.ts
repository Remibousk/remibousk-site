import type { ParticleScene } from './particles';
import discoveryFrames from './discovery.frames.json';
import buildFrames from './build.frames.json';
import strategyFrames from './strategy.frames.json';
import productRig from './product.rig.json';

/**
 * Pictures the hero chips can summon above the headline. Two kinds:
 *
 * - `image`: a greyscale-with-alpha WebP in public/images; the particles form
 *   its opaque pixels and hold still.
 * - `sheet`: a sprite sheet of greyscale frames (plus per-frame durations)
 *   cut from a clip. The particles form frame 0, then play the clip once the
 *   sweep has settled. Sheets are built offline (PIL) from the source GIF /
 *   video: frames downscaled to about the particle grid's resolution and
 *   tiled row-major into one WebP. `transparent` sheets carry alpha and only
 *   their silhouette gets particles; `loopFrom` plays the intro once and
 *   then cycles the tail.
 * - `rig`: a still whose parts move. Two aligned greyscale-with-alpha
 *   pictures (closed and finished) plus polygons of the finished picture that
 *   swing about hinges, with a timeline. The particles form the closed
 *   picture, then each part's particles swing out of the body into place.
 *
 * Add an entry here and reference its key from the chip's `scene` in
 * Hero.tsx to wire another chip.
 */
export const HERO_SCENES = {
  // The clip that was the Discovery chip's hover easter egg on the original
  // site (wlDO7zczytEqqYcuQ3Sd77YDY.gif, 589x436, 184 frames / 7.44s; the GIF
  // itself is no longer shipped — see git history), as 256x190 greyscale
  // frames, 14 per row, with the source's watermark inpainted out.
  discovery: {
    id: 'discovery',
    kind: 'sheet',
    src: '/images/hero-discovery-sheet.webp',
    width: 589,
    height: 436,
    cols: discoveryFrames.cols,
    rows: discoveryFrames.rows,
    frameWidth: discoveryFrames.frameWidth,
    frameHeight: discoveryFrames.frameHeight,
    count: discoveryFrames.count,
    durations: discoveryFrames.durations,
  },
  // Swiss army knife: the open render (assets/generated/
  // product-swiss-army-knife.png, 1254x1254 with alpha) and a matching closed
  // render, aligned to it, both cropped to the open knife's content and
  // exported greyscale-with-alpha (the closed one only lends its silhouette).
  // The unfolding — five tool polygons, their hinges, fold angles and timing —
  // is the SVG animation authored in Codex (swiss-army-knife-animation.html),
  // carried over into product.rig.json in picture px.
  product: {
    id: 'product',
    kind: 'rig',
    src: '/images/hero-product-open.webp',
    closedSrc: '/images/hero-product-closed.webp',
    width: productRig.width,
    height: productRig.height,
    body: productRig.body,
    parts: productRig.parts,
    reveal: productRig.reveal,
    revealDuration: productRig.revealDuration,
    scaleFrom: productRig.scaleFrom,
  },
  // Compass render (codex image_gen, 1254x1254 with alpha). The needle was
  // lifted off the face, the face inpainted beneath it, and 80 frames
  // rendered of the needle swinging about the pivot in the dial's
  // foreshortened plane (a seamless 6.4s loop).
  strategy: {
    id: 'strategy',
    kind: 'sheet',
    src: '/images/hero-strategy-sheet.webp',
    width: strategyFrames.frameWidth,
    height: strategyFrames.frameHeight,
    cols: strategyFrames.cols,
    rows: strategyFrames.rows,
    frameWidth: strategyFrames.frameWidth,
    frameHeight: strategyFrames.frameHeight,
    count: strategyFrames.count,
    durations: strategyFrames.durations,
    transparent: strategyFrames.transparent,
    loopFrom: strategyFrames.loopFrom,
  },
  // Macintosh illustration (codex image_gen, 1254x1254 on cream), keyed out
  // and cut to 320px frames with alpha. The screen's code is revealed one
  // character at a time with a cursor, then the cursor blinks (the loop).
  build: {
    id: 'build',
    kind: 'sheet',
    src: '/images/hero-build-sheet.webp',
    width: buildFrames.frameWidth,
    height: buildFrames.frameHeight,
    cols: buildFrames.cols,
    rows: buildFrames.rows,
    frameWidth: buildFrames.frameWidth,
    frameHeight: buildFrames.frameHeight,
    count: buildFrames.count,
    durations: buildFrames.durations,
    transparent: buildFrames.transparent,
    loopFrom: buildFrames.loopFrom,
    // Tall object on a wide stage: let it use more of the height so the
    // screen text stays legible in the mist.
    fit: 0.94,
  },
} satisfies Record<string, ParticleScene>;

export type HeroSceneId = keyof typeof HERO_SCENES;
