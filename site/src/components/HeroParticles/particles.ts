/**
 * Particle field that "smokes" greyscale pictures — stills or short clips —
 * into place, and morphs between them.
 *
 * One fixed-size pool of particles lives for as long as something is shown.
 * A scene is turned into a *target set* of exactly pool-size entries: a
 * resting spot in picture space, a grey, an ink weight, and (for clips) the
 * frame pixel to follow. On the first `show()` particles are born off-canvas
 * on the left or right edge (whichever is closer to their resting spot) with
 * a staggered delay, so two waves sweep in from the sides and meet in the
 * middle. While travelling they are pushed around by a divergence-free
 * "curl" flow field (smoke), and a damped spring towards the resting spot
 * ramps up as they age, so the cloud condenses into the image.
 *
 * Showing another scene while one is up *morphs*: every particle is matched
 * to a target of the new set by rank along a Hilbert curve (so neighbours
 * keep travelling together and paths rarely cross), then launched in a quick
 * left-to-right wave — each particle holds its old spot until its launch,
 * gets a kick towards the new one, and re-condenses under the same
 * ramping spring. Greys ease over, so the picture melts from one into the
 * other instead of dispersing and re-emerging.
 *
 * For a clip the particles then play it: each particle's grey follows its
 * pixel through the frames (smoothed so 25fps steps do not pop), the mist is
 * thinner where the frame is dark and denser where it is bright, and where
 * the picture changes between frames the local flow field is briefly
 * strengthened, so motion in the clip stirs the smoke around it.
 *
 * A rig is a still whose parts move. Each particle belongs to the body or to
 * one part; a part's particles are aimed at their resting spot swung back
 * about the part's hinge by however much of its fold remains, so the smoke
 * of a blade physically swings out of the body as it opens. Only the closed
 * picture's silhouette is used: it says which spots exist before anything
 * moves, and it is an occluder — a part's particles deposit nothing while
 * they are over it, so a blade only shows the length that has cleared the
 * casing. Greys always come from the finished picture, so nothing changes
 * texture when the last part lands; the occluder lifts at the authored
 * reveal time. Moving parts stir the smoke in proportion to how fast their
 * spots travel.
 *
 * The pointer repels nearby particles (with a little swirl and a push in the
 * direction the pointer is moving). Once the pointer leaves, the same spring
 * draws them back. `hide()` releases the spring and lets the flow field carry
 * the particles back out to the sides while they fade.
 *
 * Rendering is a pixel buffer rather than per-particle shapes: each particle
 * is a sub-pixel point splatted bilinearly into two accumulators (alpha, and
 * alpha-weighted grey). The accumulators keep a fraction of last frame's ink,
 * so anything moving leaves a short fading trail and dense streams saturate
 * into opaque cores with gauzy edges. The buffer is composed once per frame
 * into an ImageData and put on the canvas; the canvas is upsampled by the
 * browser on high-DPI screens, which keeps the mist soft.
 *
 * Everything runs in one requestAnimationFrame loop, paused while the canvas
 * is out of view or the tab is hidden.
 */

type SceneBase = {
  id: string;
  /** Intrinsic aspect ratio of the picture (used for contain-fit). */
  width: number;
  height: number;
  /** Fraction of the stage the picture may occupy (contain-fit). Default 0.86. */
  fit?: number;
  /** Vertical anchor inside the stage: 0 top, 0.5 centre, 1 bottom. Default 0.56. */
  anchorY?: number;
};

export type ImageScene = SceneBase & {
  kind: 'image';
  /** Same-origin image with real alpha; drawn greyscale regardless of colour. */
  src: string;
};

export type SheetScene = SceneBase & {
  kind: 'sheet';
  /** Same-origin sprite sheet: `count` greyscale frames tiled row-major. */
  src: string;
  cols: number;
  rows: number;
  frameWidth: number;
  frameHeight: number;
  count: number;
  /** Per-frame display time, ms. */
  durations: number[];
  /** Frames carry alpha: only opaque pixels get particles and edges are not feathered. */
  transparent?: boolean;
  /** Play frames 0..count once, then loop from this frame (default 0 = loop everything). */
  loopFrom?: number;
};

/** One moving part of a rig: a polygon of the finished picture that swings about a hinge. */
export type RigPart = {
  name: string;
  /** Flat polygon [x0, y0, x1, y1, …] in picture px of the pixels that move with this part. */
  poly: number[];
  /** Hinge, picture px. */
  pivot: number[];
  /** Degrees the part is folded back by before it opens (positive = clockwise, y down). */
  angle: number;
  /** Seconds into the rig when it starts to open, and how long the swing takes. */
  start: number;
  duration: number;
};

export type RigScene = SceneBase & {
  kind: 'rig';
  /** The finished (open) picture, greyscale with alpha. */
  src: string;
  /**
   * The picture before anything moves (closed): same size, aligned to `src`.
   * Only its alpha is used — which spots exist at the start, and the
   * occluder — so its colours need not match `src`.
   */
  closedSrc: string;
  /** Flat polygon (picture px) drawn over the parts: pixels inside never move. */
  body: number[];
  /** Drawn in order, later parts over earlier ones where polygons overlap. */
  parts: RigPart[];
  /** Seconds into the rig when the occluder lifts (and any spot the closed silhouette misses fades in), and over how long. */
  reveal: number;
  revealDuration: number;
  /** Parts start at this scale about their hinge and grow to 1 as they open. Default 1. */
  scaleFrom?: number;
};

export type ParticleScene = ImageScene | SheetScene | RigScene;

export type ParticleTheme = 'dark' | 'light';

/* ---- fixed constants --------------------------------------------------- */

const PHONE_MAX_WIDTH = 809;
/** Sampling grids never go finer than this, CSS px; the pool is topped up with jittered duplicates instead. */
const MIN_STEP = 1.2;
/** Sample a little more than the pool needs, then thin to exactly pool size. */
const OVERSAMPLE = 1.2;
/** Rough share of a still's box that is opaque; only used to pick the first grid step. */
const COVERAGE_GUESS = 0.75;
const ALPHA_THRESHOLD = 140;
const SAMPLE_MAX_WIDTH = 1024;
/** Buffer pixels per CSS pixel. 1 lets the browser upsample → soft mist. */
const RENDER_SCALE = 1;
const MIN_VISIBLE_ALPHA = 0.004;
const REDUCED_PLAY_DELAY = 0.8;
const REDUCED_FADE_IN = 0.5;
const REDUCED_FADE_OUT = 0.4;
const POINTER_MAX_SPEED = 2500;
const MAX_DT = 1 / 30;

/* ---- tuning ------------------------------------------------------------ */

/**
 * Every feel-related number, live-tunable. The engine reads `TUNING` on every
 * frame, so changes apply immediately (except where a def says otherwise).
 * `DEFAULT_TUNING` is the shipped feel; the dev-only HeroTuner panel edits
 * `TUNING` through `setTuning` and can copy the changed values back out.
 */
export const DEFAULT_TUNING = {
  // Pointer
  /** Reach of the pointer, CSS px (scaled ±30% per particle so the hole has no hard rim). */
  pointerRadius: 170,
  /** Steady outward push at the pointer, px/s² (falls off as (1 - d/R)^1.5). */
  repel: 16000,
  /** Tangential push, px/s²: makes the hole swirl. */
  swirl: 4500,
  /** How much of the pointer's own velocity is passed to particles it sweeps through. */
  dragPush: 5,
  /** Velocity impulse, px/s, when the pointer newly reaches a particle — the throw. */
  throwImpulse: 900,
  /** Seconds a struck particle stays "excited". */
  exciteTau: 0.55,
  /** How much excitement loosens the spring (0 none, 0.95 nearly free). */
  exciteLoosen: 0.75,
  /** How much excitement reduces damping. */
  exciteUndamp: 0.4,
  /** How fast the remembered pointer velocity fades once it stops, 1/s. */
  pointerDecay: 6,

  // Spring & flow
  /** Spring stiffness while travelling (birth / morph) and once settled. */
  kTravel: 6,
  kHold: 140,
  /** Damping while travelling (absolute) and settled (ratio of critical). */
  cTravel: 2.4,
  dampHold: 0.72,
  /** Curl-field strength while travelling and once settled, px/s². */
  flowTravel: 1100,
  flowHold: 40,
  /** Multipliers on the curl field's feature size and drift speed. */
  flowScale: 1,
  flowSpeed: 1,

  // Sweep-in (first appearance)
  /** Seconds from birth until the spring fully holds. */
  settleTime: 1.4,
  /** Seconds between the first and last birth on each side. */
  sweepTime: 0.9,
  birthJitter: 0.2,
  /** Nominal travel time used to aim the birth velocity, s. */
  travelTime: 0.9,
  /** Seconds a newborn takes to reach full ink. */
  growTime: 0.2,

  // Morph (scene to scene)
  /** Seconds the launch wave takes to cross the stage. */
  morphSweep: 0.35,
  morphJitter: 0.15,
  /** Seconds from launch until the spring fully holds again. */
  morphSettle: 1.1,
  /** Nominal travel time used to aim the launch kick, s. */
  morphTravel: 0.7,
  /** Share of the straight-line velocity applied as the kick. */
  morphKick: 0.7,
  /** Seconds after the morph settles before a clip starts moving. */
  morphPlayGap: 0.3,

  // Exit (dismiss)
  exitTime: 0.7,
  exitFlow: 1100,
  exitPush: 1000,
  exitLift: 260,
  exitDamping: 1.8,
  /** Seconds to fade back in when a dismissal is interrupted by another scene. */
  fadeRecover: 0.4,

  // Mist
  /** Share of last frame's ink kept each frame (at 60fps). Longer = smokier. */
  trailDecay: 0.78,
  /** Steady-state alpha a settled, fully bright region converges to. */
  targetDensity: 0.95,
  /** Ink multiplier while travelling (gauzier streams). */
  travelDensity: 0.7,
  /** How much the mist thins where the picture is dark (light theme: where it is light). */
  densityFromLuminance: 0.75,
  /** Fraction of a full-frame clip's width/height over which the mist thins to nothing at the edge. */
  edgeFeather: 0.08,
  /** Grey range per theme (0 black … 1 white) the picture's luminance maps into. */
  greyDarkLo: 0.26,
  greyDarkHi: 0.96,
  greyLightLo: 0.08,
  greyLightHi: 0.74,

  // Clips
  /** Seconds after a fresh appearance before a clip starts moving. */
  playDelay: 2.0,
  /** Time constant for a particle's grey to follow its new frame value, s. */
  shadeTau: 0.045,
  /** Extra curl strength per unit of brightness change between frames, and its decay. */
  stirGain: 1400,
  stirTau: 0.15,
  /** Seconds after a fresh appearance before a rig starts moving — about when the last particles land. */
  rigDelay: 1.6,
  /** Time multiplier for rig animations (1 = as authored). */
  rigSpeed: 3.6,
  /** Stage px/s of part motion that fully stirs the smoke around a moving part (0 = off). */
  rigStir: 350,

  // Pool
  /** Particle counts; must stay below 65536. */
  poolDesktop: 60000,
  poolPhone: 12000,
};

export type Tuning = typeof DEFAULT_TUNING;
export type TuningKey = keyof Tuning;

export const TUNING: Tuning = { ...DEFAULT_TUNING };
const T = TUNING;

let tuningRevision = 1;
/** Bumps whenever a value changes; the engine rebuilds derived state when it sees a new revision. */
export function tuningVersion() {
  return tuningRevision;
}
export function setTuning(key: TuningKey, value: number) {
  TUNING[key] = value;
  tuningRevision++;
}
export function resetTuning() {
  Object.assign(TUNING, DEFAULT_TUNING);
  tuningRevision++;
}

export type TuningDef = {
  key: TuningKey;
  label: string;
  min: number;
  max: number;
  step: number;
  group: string;
  /** When the value does not apply immediately. */
  note?: string;
};

const NEXT_SHOW = 'applies the next time a scene appears';
const NEXT_SCENE = 'applies when a scene is (re)built';

export const TUNING_DEFS: TuningDef[] = [
  { group: 'Pointer', key: 'pointerRadius', label: 'radius', min: 40, max: 400, step: 5 },
  { group: 'Pointer', key: 'repel', label: 'repel', min: 0, max: 40000, step: 500 },
  { group: 'Pointer', key: 'swirl', label: 'swirl', min: 0, max: 12000, step: 250 },
  { group: 'Pointer', key: 'dragPush', label: 'drag push', min: 0, max: 15, step: 0.25 },
  { group: 'Pointer', key: 'throwImpulse', label: 'throw', min: 0, max: 2500, step: 25 },
  { group: 'Pointer', key: 'exciteTau', label: 'excite time', min: 0.05, max: 2, step: 0.05 },
  { group: 'Pointer', key: 'exciteLoosen', label: 'excite loosen', min: 0, max: 0.95, step: 0.05 },
  { group: 'Pointer', key: 'exciteUndamp', label: 'excite undamp', min: 0, max: 0.9, step: 0.05 },
  { group: 'Pointer', key: 'pointerDecay', label: 'velocity fade', min: 0, max: 20, step: 0.5 },

  { group: 'Spring & flow', key: 'kTravel', label: 'k travel', min: 0, max: 40, step: 0.5 },
  { group: 'Spring & flow', key: 'kHold', label: 'k hold', min: 20, max: 400, step: 5 },
  { group: 'Spring & flow', key: 'cTravel', label: 'damping travel', min: 0, max: 10, step: 0.1 },
  { group: 'Spring & flow', key: 'dampHold', label: 'damping hold', min: 0.2, max: 1.5, step: 0.02 },
  { group: 'Spring & flow', key: 'flowTravel', label: 'flow travel', min: 0, max: 3000, step: 50 },
  { group: 'Spring & flow', key: 'flowHold', label: 'flow hold', min: 0, max: 300, step: 5 },
  { group: 'Spring & flow', key: 'flowScale', label: 'flow scale', min: 0.3, max: 3, step: 0.05 },
  { group: 'Spring & flow', key: 'flowSpeed', label: 'flow speed', min: 0, max: 4, step: 0.05 },

  { group: 'Sweep-in', key: 'settleTime', label: 'settle time', min: 0.3, max: 4, step: 0.05 },
  { group: 'Sweep-in', key: 'sweepTime', label: 'sweep time', min: 0.1, max: 3, step: 0.05, note: NEXT_SHOW },
  { group: 'Sweep-in', key: 'birthJitter', label: 'birth jitter', min: 0, max: 1, step: 0.05, note: NEXT_SHOW },
  { group: 'Sweep-in', key: 'travelTime', label: 'travel time', min: 0.2, max: 3, step: 0.05, note: NEXT_SHOW },
  { group: 'Sweep-in', key: 'growTime', label: 'grow time', min: 0, max: 1, step: 0.05 },

  { group: 'Morph', key: 'morphSweep', label: 'wave time', min: 0, max: 1.5, step: 0.05 },
  { group: 'Morph', key: 'morphJitter', label: 'wave jitter', min: 0, max: 0.6, step: 0.05 },
  { group: 'Morph', key: 'morphSettle', label: 'settle time', min: 0.2, max: 3, step: 0.05 },
  { group: 'Morph', key: 'morphTravel', label: 'travel time', min: 0.2, max: 2, step: 0.05 },
  { group: 'Morph', key: 'morphKick', label: 'kick', min: 0, max: 2, step: 0.05 },
  { group: 'Morph', key: 'morphPlayGap', label: 'play gap', min: 0, max: 1.5, step: 0.05 },

  { group: 'Exit', key: 'exitTime', label: 'exit time', min: 0.2, max: 2.5, step: 0.05 },
  { group: 'Exit', key: 'exitFlow', label: 'flow', min: 0, max: 3000, step: 50 },
  { group: 'Exit', key: 'exitPush', label: 'push out', min: 0, max: 3000, step: 50 },
  { group: 'Exit', key: 'exitLift', label: 'lift', min: -1000, max: 1000, step: 20 },
  { group: 'Exit', key: 'exitDamping', label: 'damping', min: 0, max: 6, step: 0.1 },
  { group: 'Exit', key: 'fadeRecover', label: 'fade recover', min: 0.1, max: 1.5, step: 0.05 },

  { group: 'Mist', key: 'trailDecay', label: 'trail decay', min: 0.3, max: 0.97, step: 0.01 },
  { group: 'Mist', key: 'targetDensity', label: 'density', min: 0.2, max: 2, step: 0.05 },
  { group: 'Mist', key: 'travelDensity', label: 'travel density', min: 0.1, max: 1.5, step: 0.05 },
  { group: 'Mist', key: 'densityFromLuminance', label: 'density ← luma', min: 0, max: 1, step: 0.05 },
  { group: 'Mist', key: 'edgeFeather', label: 'edge feather', min: 0, max: 0.3, step: 0.01, note: NEXT_SCENE },
  { group: 'Mist', key: 'greyDarkLo', label: 'grey lo (dark)', min: 0, max: 0.6, step: 0.01 },
  { group: 'Mist', key: 'greyDarkHi', label: 'grey hi (dark)', min: 0.4, max: 1, step: 0.01 },
  { group: 'Mist', key: 'greyLightLo', label: 'grey lo (light)', min: 0, max: 0.6, step: 0.01 },
  { group: 'Mist', key: 'greyLightHi', label: 'grey hi (light)', min: 0.4, max: 1, step: 0.01 },

  { group: 'Clips', key: 'playDelay', label: 'play delay', min: 0, max: 5, step: 0.1 },
  { group: 'Clips', key: 'shadeTau', label: 'shade ease', min: 0.01, max: 0.5, step: 0.005 },
  { group: 'Clips', key: 'stirGain', label: 'stir gain', min: 0, max: 5000, step: 50 },
  { group: 'Clips', key: 'stirTau', label: 'stir time', min: 0.02, max: 1, step: 0.01 },
  { group: 'Clips', key: 'rigDelay', label: 'rig delay', min: 0, max: 4, step: 0.1, note: NEXT_SHOW },
  { group: 'Clips', key: 'rigSpeed', label: 'rig speed', min: 0.25, max: 5, step: 0.05 },
  { group: 'Clips', key: 'rigStir', label: 'rig stir', min: 0, max: 2000, step: 25 },

  { group: 'Pool', key: 'poolDesktop', label: 'particles (desktop)', min: 5000, max: 65000, step: 1000, note: NEXT_SHOW },
  { group: 'Pool', key: 'poolPhone', label: 'particles (phone)', min: 2000, max: 30000, step: 500, note: NEXT_SHOW },
];

/* ---- helpers ----------------------------------------------------------- */

const smoothstep = (x: number) => {
  const t = x <= 0 ? 0 : x >= 1 ? 1 : x;
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Quintic ease ("smootherstep"): the curve the rigs were authored with. */
const ease5 = (x: number) => {
  const t = x <= 0 ? 0 : x >= 1 ? 1 : x;
  return t * t * t * (t * (t * 6 - 15) + 10);
};
const DEG = Math.PI / 180;

/** Even-odd test of (x, y) against a flat polygon [x0, y0, x1, y1, …]. */
function pointInPolygon(poly: number[], x: number, y: number): boolean {
  let inside = false;
  const n = poly.length;
  for (let i = 0, j = n - 2; i < n; j = i, i += 2) {
    const xi = poly[i];
    const yi = poly[i + 1];
    const xj = poly[j];
    const yj = poly[j + 1];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** Distance from (x, y) to the nearest edge of a flat polygon. */
function polygonDistance(poly: number[], x: number, y: number): number {
  let best = Infinity;
  const n = poly.length;
  for (let i = 0, j = n - 2; i < n; j = i, i += 2) {
    const ax = poly[j];
    const ay = poly[j + 1];
    const dx = poly[i] - ax;
    const dy = poly[i + 1] - ay;
    const len2 = dx * dx + dy * dy;
    let t = len2 > 0 ? ((x - ax) * dx + (y - ay) * dy) / len2 : 0;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    const ex = ax + t * dx - x;
    const ey = ay + t * dy - y;
    const d = ex * ex + ey * ey;
    if (d < best) best = d;
  }
  return Math.sqrt(best);
}

/** Cosine lookup: three evaluations per particle per frame add up. */
const COS_N = 2048;
const COS_MASK = COS_N - 1;
const COS_SCALE = COS_N / (2 * Math.PI);
const COS_LUT = new Float32Array(COS_N);
for (let i = 0; i < COS_N; i++) COS_LUT[i] = Math.cos((i / COS_N) * 2 * Math.PI);
/** `& MASK` on the truncated int wraps negatives correctly in two's complement. */
const fastCos = (x: number) => COS_LUT[((x * COS_SCALE) | 0) & COS_MASK];

/**
 * Smooth, position-derived "noise" in -1..1 so neighbouring particles share
 * their offsets, timing and kicks: they move as folding ribbons rather than
 * a diffuse cloud.
 */
const ribbon = (u: number, v: number) =>
  0.6 * Math.sin(u * 9.3 + v * 5.1) + 0.4 * Math.sin(u * 23 - v * 17);
const ribbon2 = (u: number, v: number) => Math.sin(u * 13 + v * 7 + 1.3);

/** Hilbert-curve index of (x, y) on an n×n grid (n a power of two). */
const HILBERT_N = 1024;
function hilbertIndex(x: number, y: number): number {
  let d = 0;
  for (let s = HILBERT_N >> 1; s > 0; s >>= 1) {
    const rx = (x & s) > 0 ? 1 : 0;
    const ry = (y & s) > 0 ? 1 : 0;
    d += s * s * ((3 * rx) ^ ry);
    if (ry === 0) {
      if (rx === 1) {
        x = HILBERT_N - 1 - x;
        y = HILBERT_N - 1 - y;
      }
      const t = x;
      x = y;
      y = t;
    }
  }
  return d;
}

type FlowTerm = { kx: number; ky: number; w: number; ph: number; ax: number; ay: number };

/**
 * Three sinusoidal potential terms; the velocity is the 2D curl of their sum,
 * so the field is divergence-free (particles swirl rather than pile up).
 */
function buildFlowField(width: number, height: number): FlowTerm[] {
  const base = Math.max(240, Math.min(width, height));
  const specs = [
    { lambda: 0.62, angle: 0.35, w: 0.55 },
    { lambda: 0.33, angle: 1.9, w: 0.9 },
    { lambda: 1.05, angle: 1.05, w: 0.32 },
  ];
  return specs.map((s, i) => {
    const k = (2 * Math.PI) / (base * s.lambda * T.flowScale);
    const kx = Math.cos(s.angle) * k;
    const ky = Math.sin(s.angle) * k;
    return { kx, ky, w: s.w * T.flowSpeed, ph: i * 2.1, ax: ky / k, ay: -kx / k };
  });
}

/* ---- asset loading ----------------------------------------------------- */

const imageCache = new Map<string, Promise<HTMLImageElement>>();

function loadImage(src: string): Promise<HTMLImageElement> {
  let p = imageCache.get(src);
  if (!p) {
    p = new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        const done = () => resolve(img);
        if (typeof img.decode === 'function') img.decode().then(done, done);
        else done();
      };
      img.onerror = () => reject(new Error(`Failed to load ${src}`));
      img.src = src;
    });
    imageCache.set(src, p);
  }
  return p;
}

/** A decoded sprite sheet: frame-major luminance bytes plus a time index. */
type FrameSet = {
  fw: number;
  fh: number;
  count: number;
  data: Uint8Array;
  /** Start time of each frame, seconds. */
  starts: Float32Array;
  /** Length of all frames, seconds. */
  total: number;
  /** Frame 0 alpha (the silhouette is assumed static), or null for opaque sheets. */
  alpha: Uint8Array | null;
  /** First frame of the loop section. */
  loopFrom: number;
};

const frameCache = new Map<string, Promise<FrameSet>>();

function loadFrames(scene: SheetScene): Promise<FrameSet> {
  let p = frameCache.get(scene.id);
  if (!p) {
    p = loadImage(scene.src).then((img) => {
      const off = document.createElement('canvas');
      off.width = img.naturalWidth;
      off.height = img.naturalHeight;
      const ctx = off.getContext('2d', { willReadFrequently: true });
      if (!ctx) throw new Error('2D canvas unavailable');
      ctx.drawImage(img, 0, 0);
      const { frameWidth: fw, frameHeight: fh, count, cols } = scene;
      const size = fw * fh;
      const data = new Uint8Array(size * count);
      const alpha = scene.transparent ? new Uint8Array(size) : null;
      for (let f = 0; f < count; f++) {
        const sx = (f % cols) * fw;
        const sy = Math.floor(f / cols) * fh;
        const px = ctx.getImageData(sx, sy, fw, fh).data;
        const base = f * size;
        for (let i = 0; i < size; i++) data[base + i] = px[i * 4];
        if (alpha && f === 0) for (let i = 0; i < size; i++) alpha[i] = px[i * 4 + 3];
      }
      const starts = new Float32Array(count);
      let t = 0;
      for (let f = 0; f < count; f++) {
        starts[f] = t;
        t += (scene.durations[f] ?? 40) / 1000;
      }
      const loopFrom = Math.min(Math.max(0, scene.loopFrom ?? 0), count - 1);
      return { fw, fh, count, data, starts, total: t, alpha, loopFrom };
    });
    frameCache.set(scene.id, p);
  }
  return p;
}

type RigImages = { open: HTMLImageElement; closed: HTMLImageElement };

function loadRig(scene: RigScene): Promise<RigImages> {
  return Promise.all([loadImage(scene.src), loadImage(scene.closedSrc)]).then(([open, closed]) => ({
    open,
    closed,
  }));
}

/** Warm the caches so the first click does not wait on the network. */
export function preloadScenes(scenes: ParticleScene[]) {
  for (const s of scenes) {
    const p: Promise<unknown> =
      s.kind === 'sheet' ? loadFrames(s) : s.kind === 'rig' ? loadRig(s) : loadImage(s.src);
    p.catch(() => undefined);
  }
}

/* ---- state ------------------------------------------------------------- */

type Rect = { x: number; y: number; w: number; h: number };

/** Per-target rig data: which part a spot belongs to and how it looks before the reveal. */
type RigTargets = {
  /** 0 = never moves (body); k = rig part k − 1. */
  part: Uint8Array;
  /** Grey in the finished picture and in the closed one. */
  shadeA: Float32Array;
  shadeB: Float32Array;
  /** Presence (ink multiplier) in the closed picture, 0..1. */
  presB: Float32Array;
  /** Occluder for part particles. */
  mask: RigMask | null;
};

/** Visibility of a part particle by picture position: 0 behind the closed picture, 1 in the clear. */
type RigMask = { w: number; h: number; vis: Float32Array };

/** A scene resolved for the current stage: exactly `count` resting spots. */
type TargetSet = {
  count: number;
  /** Resting spot in picture space, 0..1. */
  u: Float32Array;
  v: Float32Array;
  /** Luminance 0..1 when the spot first shows. */
  shade: Float32Array;
  /** Ink per frame when settled and fully bright (includes edge feather). */
  deposit: Float32Array;
  /** Index of the frame pixel to follow (clips), or -1. */
  pix: Int32Array;
  /** Where the spot first appears when that differs from (u, v): a rig part starts folded. Used for matching and aiming. */
  mu: Float32Array | null;
  mv: Float32Array | null;
  rig: RigTargets | null;
};

/** Sampled candidates before thinning / topping up to pool size. */
type Candidates = {
  us: number[];
  vs: number[];
  shades: number[];
  pix?: number[];
  part?: number[];
  shadeA?: number[];
  shadeB?: number[];
  presB?: number[];
  /** Share of grid cells that yielded a candidate (calibrates the ink). */
  coverage: number;
};

type Pool = {
  count: number;
  x: Float32Array;
  y: Float32Array;
  vx: Float32Array;
  vy: Float32Array;
  /** Current resting spot (stage px) and its picture-space coordinates. */
  tx: Float32Array;
  ty: Float32Array;
  u: Float32Array;
  v: Float32Array;
  /** Previous resting spot, held until this particle's launch during a morph. */
  ptx: Float32Array;
  pty: Float32Array;
  pu: Float32Array;
  pv: Float32Array;
  /** Launch time (seconds of field time) for the current target. */
  delay: Float32Array;
  /** 1 once the particle has appeared; morphing particles skip the grow-in. */
  born: Uint8Array;
  deposit: Float32Array;
  pdeposit: Float32Array;
  /** Current luminance 0..1 (eases towards `targetShade`). */
  shade: Float32Array;
  targetShade: Float32Array;
  /** Recent brightness change, decays; drives the local swirl. */
  stir: Float32Array;
  /** How hard the pointer has recently struck this particle, 0..1, decays. */
  excite: Float32Array;
  pix: Int32Array;
  /** Rig: part index (0 = body), greys in the finished / closed picture, presence in the closed one. */
  part: Uint8Array;
  shadeA: Float32Array;
  shadeB: Float32Array;
  presB: Float32Array;
  /** Current presence (ink multiplier) and the one held from before a morph launch. */
  pres: Float32Array;
  ppres: Float32Array;
  /** Per-particle scale on the pointer radius so the hover hole has no hard rim. */
  reach: Float32Array;
  side: Int8Array;
};

function makePool(n: number): Pool {
  const pool: Pool = {
    count: n,
    x: new Float32Array(n),
    y: new Float32Array(n),
    vx: new Float32Array(n),
    vy: new Float32Array(n),
    tx: new Float32Array(n),
    ty: new Float32Array(n),
    u: new Float32Array(n),
    v: new Float32Array(n),
    ptx: new Float32Array(n),
    pty: new Float32Array(n),
    pu: new Float32Array(n),
    pv: new Float32Array(n),
    delay: new Float32Array(n),
    born: new Uint8Array(n),
    deposit: new Float32Array(n),
    pdeposit: new Float32Array(n),
    shade: new Float32Array(n),
    targetShade: new Float32Array(n),
    stir: new Float32Array(n),
    excite: new Float32Array(n),
    pix: new Int32Array(n),
    part: new Uint8Array(n),
    shadeA: new Float32Array(n),
    shadeB: new Float32Array(n),
    presB: new Float32Array(n),
    pres: new Float32Array(n),
    ppres: new Float32Array(n),
    reach: new Float32Array(n),
    side: new Int8Array(n),
  };
  for (let i = 0; i < n; i++) {
    pool.reach[i] = 0.7 + Math.random() * 0.6;
    pool.pres[i] = pool.ppres[i] = 1;
  }
  return pool;
}

type Phase = 'idle' | 'shown' | 'exit';

export class ParticleField {
  private ctx: CanvasRenderingContext2D | null;
  private width = 0;
  private height = 0;
  private theme: ParticleTheme = 'dark';
  private reducedMotion = false;

  /** Pixel buffer: dimensions, accumulators and the ImageData they compose into. */
  private bw = 0;
  private bh = 0;
  private accA = new Float32Array(0);
  private accL = new Float32Array(0);
  private image: ImageData | null = null;
  private pixels = new Uint32Array(0);

  private phase: Phase = 'idle';
  private scene: ParticleScene | null = null;
  private showToken = 0;
  private pool: Pool | null = null;
  private frames: FrameSet | null = null;
  private frameIndex = -1;
  /** The rig being animated, whether it has finished, and the last reveal progress applied. */
  private rig: RigScene | null = null;
  private rigDone = true;
  private rigXf = -1;
  private rigMask: RigMask | null = null;
  private rect: Rect = { x: 0, y: 0, w: 0, h: 0 };
  private flow: FlowTerm[] = [];

  private time = 0;
  /** Which settle time applies to the current launch (birth vs morph). */
  private settleMode: 'birth' | 'morph' = 'birth';
  private tuningSeen = 0;
  /** Field time at which the current clip starts moving. */
  private playAt = T.playDelay;
  private exitStart = 0;
  /** Fade level and time at which a dismissal was interrupted (1 / 0 otherwise). */
  private fadeFloor = 1;
  private fadeFloorAt = 0;
  private lastFrame = 0;
  private frame = 0;
  private inView = true;
  private pageVisible = true;

  private pointerActive = false;
  private px = 0;
  private py = 0;
  private pvx = 0;
  private pvy = 0;
  private pointerStamp = 0;

  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d', { alpha: true });
    document.addEventListener('visibilitychange', this.onVisibility);
  }

  /* ---- public API ------------------------------------------------------ */

  setTheme(theme: ParticleTheme) {
    this.theme = theme;
  }

  setReducedMotion(on: boolean) {
    this.reducedMotion = on;
  }

  setInView(on: boolean) {
    this.inView = on;
    this.syncLoop();
  }

  resize(width: number, height: number) {
    if (width <= 0 || height <= 0) return;
    this.width = width;
    this.height = height;
    const bw = Math.max(1, Math.round(width * RENDER_SCALE));
    const bh = Math.max(1, Math.round(height * RENDER_SCALE));
    if (bw !== this.bw || bh !== this.bh) {
      this.bw = bw;
      this.bh = bh;
      this.canvas.width = bw;
      this.canvas.height = bh;
      this.accA = new Float32Array(bw * bh);
      this.accL = new Float32Array(bw * bh);
      this.image = this.ctx ? this.ctx.createImageData(bw, bh) : null;
      this.pixels = this.image ? new Uint32Array(this.image.data.buffer) : new Uint32Array(0);
    }
    this.flow = buildFlowField(width, height);
    if (this.scene && this.pool) {
      this.rect = this.fitRect(this.scene);
      this.retarget();
    }
    if (this.phase === 'idle') this.clear();
  }

  setPointer(x: number | null, y?: number) {
    if (x === null || y === undefined) {
      this.pointerActive = false;
      this.pvx = 0;
      this.pvy = 0;
      return;
    }
    const now = performance.now();
    if (this.pointerActive) {
      const dt = Math.max(0.004, (now - this.pointerStamp) / 1000);
      let vx = (x - this.px) / dt;
      let vy = (y - this.py) / dt;
      const speed = Math.hypot(vx, vy);
      if (speed > POINTER_MAX_SPEED) {
        vx *= POINTER_MAX_SPEED / speed;
        vy *= POINTER_MAX_SPEED / speed;
      }
      this.pvx = lerp(this.pvx, vx, 0.5);
      this.pvy = lerp(this.pvy, vy, 0.5);
    }
    this.pointerActive = true;
    this.px = x;
    this.py = y;
    this.pointerStamp = now;
  }

  /**
   * Show a scene. From idle the particles sweep in; while another scene is
   * up (or on its way out) they morph into the new one instead.
   */
  show(scene: ParticleScene) {
    if (this.scene?.id === scene.id && this.phase !== 'idle' && this.pool) {
      if (this.phase === 'exit') this.cancelExit();
      return;
    }
    const token = ++this.showToken;
    type Loaded = { frames: FrameSet | null; img: HTMLImageElement | null; rig: RigImages | null };
    const rigScene = scene.kind === 'rig' ? scene : null;
    const load: Promise<Loaded> =
      scene.kind === 'sheet'
        ? loadFrames(scene).then((frames) => ({ frames, img: null, rig: null }))
        : rigScene
          ? loadRig(rigScene).then((rig) => ({ frames: null, img: null, rig }))
          : loadImage(scene.src).then((img) => ({ frames: null, img, rig: null }));
    load.then(
      ({ frames, img, rig }) => {
        if (token !== this.showToken) return;
        if (this.width <= 0 || this.height <= 0) return;
        this.scene = scene;
        this.rect = this.fitRect(scene);
        const fresh = !this.pool || this.phase === 'idle';
        const n = fresh ? this.poolSize() : this.pool!.count;
        const targets = frames
          ? this.targetsFromSheet(frames, n)
          : rig && rigScene
            ? this.targetsFromRig(rigScene, rig, n)
            : this.targetsFromImage(img!, n);
        this.frames = frames;
        this.frameIndex = 0;
        this.rig = rigScene;
        this.rigDone = !rigScene;
        this.rigXf = -1;
        this.rigMask = targets.rig?.mask ?? null;
        if (fresh) {
          this.pool = makePool(n);
          this.time = 0;
          this.exitStart = 0;
          this.fadeFloor = 1;
          this.fadeFloorAt = 0;
          this.settleMode = 'birth';
          this.playAt = this.reducedMotion ? REDUCED_PLAY_DELAY : rigScene ? T.rigDelay : T.playDelay;
          this.launchFresh(targets);
          this.phase = 'shown';
        } else {
          if (this.phase === 'exit') this.cancelExit();
          this.morphTo(targets);
        }
        this.syncLoop();
      },
      () => {
        if (token === this.showToken && this.phase === 'idle') this.scene = null;
      },
    );
  }

  hide() {
    if (this.phase === 'shown') this.beginExit();
    else if (this.phase === 'idle') {
      // Cancel a show() that is still waiting on its assets.
      this.showToken++;
      this.scene = null;
    }
  }

  destroy() {
    this.showToken++;
    document.removeEventListener('visibilitychange', this.onVisibility);
    this.stopLoop();
    this.pool = null;
    this.frames = null;
    this.rig = null;
    this.rigMask = null;
    this.scene = null;
    this.phase = 'idle';
  }

  /* ---- internals ------------------------------------------------------- */

  private onVisibility = () => {
    this.pageVisible = document.visibilityState !== 'hidden';
    this.syncLoop();
  };

  private poolSize() {
    const n = this.width <= PHONE_MAX_WIDTH ? T.poolPhone : T.poolDesktop;
    return Math.min(65535, Math.max(1000, Math.round(n)));
  }

  private beginExit() {
    this.phase = 'exit';
    this.exitStart = this.time;
    this.syncLoop();
  }

  /** A new scene arrived mid-dismissal: keep the particles and fade back in. */
  private cancelExit() {
    this.fadeFloor = this.fadeAt(this.time);
    this.fadeFloorAt = this.time;
    this.phase = 'shown';
  }

  private finishExit() {
    this.phase = 'idle';
    this.pool = null;
    this.frames = null;
    this.frameIndex = -1;
    this.rig = null;
    this.rigMask = null;
    this.scene = null;
    this.clear();
    this.stopLoop();
  }

  private clear() {
    this.accA.fill(0);
    this.accL.fill(0);
    this.ctx?.clearRect(0, 0, this.bw, this.bh);
  }

  private fitRect(scene: ParticleScene): Rect {
    const fit = scene.fit ?? 0.86;
    const anchorY = scene.anchorY ?? 0.56;
    const boxW = this.width * fit;
    const boxH = this.height * fit;
    const scale = Math.min(boxW / scene.width, boxH / scene.height);
    const w = scene.width * scale;
    const h = scene.height * scale;
    return {
      x: (this.width - w) / 2,
      y: (this.height - h) * anchorY,
      w,
      h,
    };
  }

  /** Re-derive stage-space resting spots after a resize. */
  private retarget() {
    const p = this.pool;
    if (!p) return;
    const { x, y, w, h } = this.rect;
    for (let i = 0; i < p.count; i++) {
      p.tx[i] = x + p.u[i] * w;
      p.ty[i] = y + p.v[i] * h;
      p.ptx[i] = x + p.pu[i] * w;
      p.pty[i] = y + p.pv[i] * h;
    }
  }

  /* ---- target sets ----------------------------------------------------- */

  private baseDeposit(stepCss: number) {
    // Geometric ink weight: one particle per stepCss² CSS px. Per frame it is
    // multiplied by targetDensity × (1 − trail keep), so a settled, fully
    // bright region converges to targetDensity alpha per buffer pixel
    // regardless of frame rate or the current trail setting.
    const stepBuf = stepCss * RENDER_SCALE;
    return stepBuf * stepBuf;
  }

  /**
   * Thin or top up sampled candidates to exactly `n` entries. Surplus is
   * dropped at random; shortfall is filled with jittered duplicates.
   */
  private finishTargets(c: Candidates, n: number, stepCss: number, feather: boolean): TargetSet {
    const { us, vs, shades, pix, part, shadeA, shadeB, presB } = c;
    const m = us.length;
    const rig: RigTargets | null =
      part && shadeA && shadeB && presB
        ? {
            part: new Uint8Array(n),
            shadeA: new Float32Array(n),
            shadeB: new Float32Array(n),
            presB: new Float32Array(n),
            mask: null,
          }
        : null;
    const set: TargetSet = {
      count: n,
      u: new Float32Array(n),
      v: new Float32Array(n),
      shade: new Float32Array(n),
      deposit: new Float32Array(n),
      pix: new Int32Array(n),
      mu: null,
      mv: null,
      rig,
    };
    const base = this.baseDeposit(stepCss);
    const { w: rw, h: rh } = this.rect;
    const ju = (stepCss * 0.5) / Math.max(1, rw);
    const jv = (stepCss * 0.5) / Math.max(1, rh);

    // Random permutation prefix of the candidates (partial Fisher–Yates).
    const order = new Int32Array(m);
    for (let i = 0; i < m; i++) order[i] = i;
    const take = Math.min(m, n);
    for (let i = 0; i < take; i++) {
      const j = i + Math.floor(Math.random() * (m - i));
      const t = order[i];
      order[i] = order[j];
      order[j] = t;
    }

    for (let k = 0; k < n; k++) {
      let src: number;
      let u: number;
      let v: number;
      if (k < take) {
        src = order[k];
        u = us[src];
        v = vs[src];
      } else {
        src = order[Math.floor(Math.random() * take)];
        u = Math.min(1, Math.max(0, us[src] + (Math.random() - 0.5) * 2 * ju));
        v = Math.min(1, Math.max(0, vs[src] + (Math.random() - 0.5) * 2 * jv));
      }
      set.u[k] = u;
      set.v[k] = v;
      set.shade[k] = shades[src];
      set.pix[k] = pix ? pix[src] : -1;
      if (rig && part && shadeA && shadeB && presB) {
        rig.part[k] = part[src];
        rig.shadeA[k] = shadeA[src];
        rig.shadeB[k] = shadeB[src];
        rig.presB[k] = presB[src];
      }
      let d = base * (0.8 + Math.random() * 0.4);
      if (feather) {
        // Full-frame clips would otherwise end in a hard rectangle.
        d *= smoothstep(Math.min(u, 1 - u) / T.edgeFeather) * smoothstep(Math.min(v, 1 - v) / T.edgeFeather);
      }
      set.deposit[k] = d;
    }
    return set;
  }

  /** A still: resting spots on its opaque pixels. */
  private targetsFromImage(img: HTMLImageElement, n: number): TargetSet {
    const { w: rw, h: rh } = this.rect;
    const sw = Math.max(1, Math.min(SAMPLE_MAX_WIDTH, Math.round(rw)));
    const sh = Math.max(1, Math.round((sw * img.naturalHeight) / img.naturalWidth));
    const off = document.createElement('canvas');
    off.width = sw;
    off.height = sh;
    const octx = off.getContext('2d', { willReadFrequently: true });
    if (!octx) return this.finishTargets({ us: [], vs: [], shades: [], coverage: 0 }, n, 2, false);
    octx.drawImage(img, 0, 0, sw, sh);
    const data = octx.getImageData(0, 0, sw, sh).data;

    const sample = (stepCss: number) => {
      const step = stepCss * (sw / rw);
      const jitter = step * 0.35;
      const us: number[] = [];
      const vs: number[] = [];
      const shades: number[] = [];
      let total = 0;
      for (let sy = step / 2; sy < sh; sy += step) {
        for (let sx = step / 2; sx < sw; sx += step) {
          total++;
          const jx = sx + (Math.random() - 0.5) * 2 * jitter;
          const jy = sy + (Math.random() - 0.5) * 2 * jitter;
          const ix = Math.min(sw - 1, Math.max(0, Math.round(jx)));
          const iy = Math.min(sh - 1, Math.max(0, Math.round(jy)));
          const o = (iy * sw + ix) * 4;
          if (data[o + 3] < ALPHA_THRESHOLD) continue;
          us.push(jx / sw);
          vs.push(jy / sh);
          shades.push(data[o] / 255);
        }
      }
      return { us, vs, shades, coverage: total ? us.length / total : 0 };
    };

    let stepCss = Math.max(MIN_STEP, Math.sqrt((rw * rh * COVERAGE_GUESS) / (n * OVERSAMPLE)));
    let res = sample(stepCss);
    if (res.us.length < n && stepCss > MIN_STEP) {
      // The picture is sparser than guessed; sample finer once.
      stepCss = Math.max(MIN_STEP, stepCss * Math.sqrt(res.us.length / (n * OVERSAMPLE)));
      res = sample(stepCss);
    }
    // Ink is calibrated for the density the pool actually ends up with.
    const stepEff = Math.sqrt((rw * rh * Math.max(0.05, res.coverage)) / n);
    return this.finishTargets(res, n, stepEff, false);
  }

  /**
   * A clip: each spot pinned to a frame pixel. Opaque sheets fill the whole
   * frame rectangle (feathered at the edges); transparent ones only where
   * frame 0 is opaque.
   */
  private targetsFromSheet(frames: FrameSet, n: number): TargetSet {
    const { w: rw, h: rh } = this.rect;
    const { fw, fh, data, alpha } = frames;

    const sample = (stepCss: number) => {
      const us: number[] = [];
      const vs: number[] = [];
      const shades: number[] = [];
      const pix: number[] = [];
      const jitter = stepCss * 0.35;
      let total = 0;
      for (let sy = stepCss / 2; sy < rh; sy += stepCss) {
        for (let sx = stepCss / 2; sx < rw; sx += stepCss) {
          total++;
          const u = (sx + (Math.random() - 0.5) * 2 * jitter) / rw;
          const v = (sy + (Math.random() - 0.5) * 2 * jitter) / rh;
          const ix = Math.min(fw - 1, Math.max(0, Math.floor(u * fw)));
          const iy = Math.min(fh - 1, Math.max(0, Math.floor(v * fh)));
          const o = iy * fw + ix;
          if (alpha && alpha[o] < ALPHA_THRESHOLD) continue;
          us.push(u);
          vs.push(v);
          shades.push(data[o] / 255);
          pix.push(o);
        }
      }
      return { us, vs, shades, pix, coverage: total ? us.length / total : 0 };
    };

    let stepCss = Math.max(MIN_STEP, Math.sqrt((rw * rh) / (n * OVERSAMPLE)));
    let res = sample(stepCss);
    if (res.us.length < n && stepCss > MIN_STEP) {
      // A cut-out silhouette is sparser than the full frame; sample finer once.
      stepCss = Math.max(MIN_STEP, stepCss * Math.sqrt(res.us.length / (n * OVERSAMPLE)));
      res = sample(stepCss);
    }
    const stepEff = Math.sqrt((rw * rh * Math.max(0.05, res.coverage)) / n);
    return this.finishTargets(res, n, stepEff, !alpha);
  }

  /**
   * A rig: resting spots on the finished picture's opaque pixels, each tagged
   * with what it belongs to. Anything inside the closed silhouette is body.
   * Casing pixels the closed silhouette misses (inside the body polygon, or
   * hugging the silhouette) are body too. Everything else is a part:
   * the polygon that contains it (later ones over earlier, as drawn), or the
   * nearest polygon for edge pixels the polygons stop short of — so no pixel
   * of the finished picture is left waiting for the reveal. Spots are matched
   * and aimed at where they are with every part folded.
   */
  private targetsFromRig(scene: RigScene, imgs: RigImages, n: number): TargetSet {
    const { w: rw, h: rh } = this.rect;
    const sw = Math.max(1, Math.min(SAMPLE_MAX_WIDTH, Math.round(rw)));
    const sh = Math.max(1, Math.round((sw * scene.height) / scene.width));
    const read = (img: HTMLImageElement) => {
      const off = document.createElement('canvas');
      off.width = sw;
      off.height = sh;
      const octx = off.getContext('2d', { willReadFrequently: true });
      if (!octx) return null;
      octx.drawImage(img, 0, 0, sw, sh);
      return octx.getImageData(0, 0, sw, sh).data;
    };
    const open = read(imgs.open);
    const closed = read(imgs.closed);
    if (!open || !closed) return this.finishTargets({ us: [], vs: [], shades: [], coverage: 0 }, n, 2, false);

    const parts = scene.parts;
    const partOf = (x: number, y: number) => {
      for (let k = parts.length - 1; k >= 0; k--) if (pointInPolygon(parts[k].poly, x, y)) return k + 1;
      return 0;
    };
    const nearestPart = (x: number, y: number) => {
      let best = 0;
      let bestD = Infinity;
      for (let k = 0; k < parts.length; k++) {
        const d = polygonDistance(parts[k].poly, x, y);
        if (d < bestD) {
          bestD = d;
          best = k + 1;
        }
      }
      return best;
    };
    // Within a few sample px of the closed silhouette (its edge slivers and the casing's underside).
    const RIM = 4;
    const nearClosed = (ix: number, iy: number) => {
      const x0 = Math.max(0, ix - RIM);
      const x1 = Math.min(sw - 1, ix + RIM);
      const y0 = Math.max(0, iy - RIM);
      const y1 = Math.min(sh - 1, iy + RIM);
      for (let yy = y0; yy <= y1; yy++) {
        for (let xx = x0; xx <= x1; xx++) if (closed[(yy * sw + xx) * 4 + 3] >= 128) return true;
      }
      return false;
    };
    // Sample px → picture px.
    const kx = scene.width / sw;
    const ky = scene.height / sh;

    const sample = (stepCss: number): Candidates => {
      const step = stepCss * (sw / rw);
      const jitter = step * 0.35;
      const us: number[] = [];
      const vs: number[] = [];
      const shades: number[] = [];
      const part: number[] = [];
      const shadeA: number[] = [];
      const shadeB: number[] = [];
      const presB: number[] = [];
      let total = 0;
      for (let sy = step / 2; sy < sh; sy += step) {
        for (let sx = step / 2; sx < sw; sx += step) {
          total++;
          const jx = sx + (Math.random() - 0.5) * 2 * jitter;
          const jy = sy + (Math.random() - 0.5) * 2 * jitter;
          const ix = Math.min(sw - 1, Math.max(0, Math.round(jx)));
          const iy = Math.min(sh - 1, Math.max(0, Math.round(jy)));
          const o = (iy * sw + ix) * 4;
          if (open[o + 3] < ALPHA_THRESHOLD) continue;
          const a = open[o] / 255;
          const ca = closed[o + 3] / 255;
          let k = 0;
          let pb = 1;
          if (ca >= 0.5) {
            // Inside the closed silhouette: body. Greys come from the finished
            // picture even here, so the casing never changes texture later.
            pb = smoothstep((ca - 0.25) / 0.5);
          } else {
            const X = jx * kx;
            const Y = jy * ky;
            if (!pointInPolygon(scene.body, X, Y)) {
              k = partOf(X, Y);
              if (k === 0 && !nearClosed(ix, iy)) k = nearestPart(X, Y);
            }
            // Otherwise casing the closed picture misses: shown as it is from the start.
          }
          us.push(jx / sw);
          vs.push(jy / sh);
          shades.push(a);
          part.push(k);
          shadeA.push(a);
          shadeB.push(a);
          presB.push(pb);
        }
      }
      return { us, vs, shades, part, shadeA, shadeB, presB, coverage: total ? us.length / total : 0 };
    };

    let stepCss = Math.max(MIN_STEP, Math.sqrt((rw * rh * COVERAGE_GUESS) / (n * OVERSAMPLE)));
    let res = sample(stepCss);
    if (res.us.length < n && stepCss > MIN_STEP) {
      stepCss = Math.max(MIN_STEP, stepCss * Math.sqrt(res.us.length / (n * OVERSAMPLE)));
      res = sample(stepCss);
    }
    const stepEff = Math.sqrt((rw * rh * Math.max(0.05, res.coverage)) / n);
    const set = this.finishTargets(res, n, stepEff, false);

    if (set.rig) {
      // Occluder: where the closed picture is opaque, part particles are hidden until the reveal.
      const vis = new Float32Array(sw * sh);
      for (let i = 0; i < vis.length; i++) vis[i] = 1 - smoothstep((closed[i * 4 + 3] / 255 - 0.2) / 0.6);
      set.rig.mask = { w: sw, h: sh, vis };

      const mu = new Float32Array(n);
      const mv = new Float32Array(n);
      const s0 = scene.scaleFrom ?? 1;
      for (let i = 0; i < n; i++) {
        const k = set.rig.part[i];
        if (k === 0) {
          mu[i] = set.u[i];
          mv[i] = set.v[i];
          continue;
        }
        const P = parts[k - 1];
        const a = P.angle * DEG;
        const cs = Math.cos(a) * s0;
        const sn = Math.sin(a) * s0;
        const relx = set.u[i] * scene.width - P.pivot[0];
        const rely = set.v[i] * scene.height - P.pivot[1];
        mu[i] = (P.pivot[0] + relx * cs - rely * sn) / scene.width;
        mv[i] = (P.pivot[1] + relx * sn + rely * cs) / scene.height;
      }
      set.mu = mu;
      set.mv = mv;
    }
    return set;
  }

  /** Give particle `i` target `j`'s rig data, or clear it for a plain scene. Call after `targetShade` is set. */
  private assignRig(p: Pool, rig: RigTargets | null, i: number, j: number) {
    if (rig) {
      const k = rig.part[j];
      p.part[i] = k;
      p.shadeA[i] = rig.shadeA[j];
      p.shadeB[i] = rig.shadeB[j];
      p.presB[i] = rig.presB[j];
      p.pres[i] = k === 0 ? rig.presB[j] : 0;
    } else {
      p.part[i] = 0;
      p.shadeA[i] = p.shadeB[i] = p.targetShade[i];
      p.presB[i] = 1;
      p.pres[i] = 1;
    }
  }

  /* ---- launching ------------------------------------------------------- */

  /** First appearance: assign targets in order and sweep in from the sides. */
  private launchFresh(set: TargetSet) {
    const p = this.pool;
    if (!p) return;
    const { x: rx, y: ry, w: rw, h: rh } = this.rect;
    const W = this.width;
    const H = this.height;
    const reduced = this.reducedMotion;

    const mu = set.mu ?? set.u;
    const mv = set.mv ?? set.v;
    const rig = set.rig;

    for (let i = 0; i < p.count; i++) {
      // Where the particle first appears (a rig part starts folded); (u, v) is its resting spot.
      const u = mu[i];
      const v = mv[i];
      const tx = rx + u * rw;
      const ty = ry + v * rh;
      p.u[i] = p.pu[i] = set.u[i];
      p.v[i] = p.pv[i] = set.v[i];
      p.tx[i] = p.ptx[i] = tx;
      p.ty[i] = p.pty[i] = ty;
      p.shade[i] = p.targetShade[i] = set.shade[i];
      p.deposit[i] = p.pdeposit[i] = set.deposit[i];
      p.pix[i] = set.pix[i];
      p.stir[i] = 0;
      p.excite[i] = 0;
      p.born[i] = 0;
      // Newborns carry full ink and fade to their presence as they settle, so a
      // still-folded part's particles arrive as smoke and dissolve into the body.
      this.assignRig(p, rig, i, i);
      p.ppres[i] = 1;

      // Mostly the nearer edge, with a little mixing so the waves interleave.
      let side: 1 | -1 = u < 0.5 ? -1 : 1;
      if (Math.random() < 0.15) side = side === 1 ? -1 : 1;
      p.side[i] = side;

      if (reduced) {
        p.x[i] = tx;
        p.y[i] = ty;
        p.vx[i] = p.vy[i] = 0;
        p.delay[i] = 0;
        continue;
      }

      const n1 = ribbon(u, v);
      const n2 = ribbon2(u, v);
      const edgeDist = side < 0 ? u : 1 - u;
      p.delay[i] = edgeDist * T.sweepTime * (0.75 + 0.25 * n2) + Math.random() * T.birthJitter;

      const margin = 60 + (0.5 + 0.5 * n2) * W * 0.15;
      const sx = side < 0 ? -margin : W + margin;
      const sy = ty + n1 * H * 0.28 + (Math.random() - 0.5) * H * 0.1 + H * 0.06;
      p.x[i] = sx;
      p.y[i] = sy;

      const dx = tx - sx;
      const dy = ty - sy;
      const travel = T.travelTime * (0.9 + 0.2 * n2) + Math.random() * 0.15;
      let vx = dx / travel;
      let vy = dy / travel;
      // Perpendicular kick so the ribbons curl instead of flying straight.
      const perp = n1 * 0.45 + (Math.random() - 0.5) * 0.15;
      vx += -vy * perp;
      vy += vx * perp;
      p.vx[i] = vx;
      p.vy[i] = vy;
    }
  }

  /**
   * Re-aim every particle at the new set. Particles and targets are each
   * sorted along a Hilbert curve over the stage and matched by rank, so
   * neighbours travel together. Each particle keeps its old spot until its
   * launch, staggered left to right, then gets a kick towards the new one.
   */
  private morphTo(set: TargetSet) {
    const p = this.pool;
    if (!p) return;
    const n = p.count;
    const { x: rx, y: ry, w: rw, h: rh } = this.rect;
    const W = this.width;
    const H = this.height;
    const t = this.time;
    const reduced = this.reducedMotion;
    const q = (HILBERT_N - 1) / Math.max(1, W);
    const qy = (HILBERT_N - 1) / Math.max(1, H);
    const clampX = (x: number) => (x < 0 ? 0 : x > W ? W : x);
    const clampY = (y: number) => (y < 0 ? 0 : y > H ? H : y);
    const mu = set.mu ?? set.u;
    const mv = set.mv ?? set.v;
    const rig = set.rig;

    // Sort keys pack (curve index << 16 | element index) into a double so a
    // plain numeric typed-array sort orders them.
    const keysP = new Float64Array(n);
    const keysT = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      const hx = (clampX(p.x[i]) * q) | 0;
      const hy = (clampY(p.y[i]) * qy) | 0;
      keysP[i] = hilbertIndex(hx, hy) * 65536 + i;
      const tx = rx + mu[i] * rw;
      const ty = ry + mv[i] * rh;
      keysT[i] = hilbertIndex((clampX(tx) * q) | 0, (clampY(ty) * qy) | 0) * 65536 + i;
    }
    keysP.sort();
    keysT.sort();

    for (let r = 0; r < n; r++) {
      const i = keysP[r] % 65536;
      const j = keysT[r] % 65536;
      const alive = t - p.delay[i] >= 0;

      p.ptx[i] = p.tx[i];
      p.pty[i] = p.ty[i];
      p.pu[i] = p.u[i];
      p.pv[i] = p.v[i];
      p.pdeposit[i] = p.deposit[i];

      const u = mu[j];
      const v = mv[j];
      p.u[i] = set.u[j];
      p.v[i] = set.v[j];
      p.tx[i] = rx + u * rw;
      p.ty[i] = ry + v * rh;
      p.deposit[i] = set.deposit[j];
      p.targetShade[i] = set.shade[j];
      p.pix[i] = set.pix[j];
      p.stir[i] = 0;
      p.excite[i] = 0;
      p.ppres[i] = p.pres[i];
      this.assignRig(p, rig, i, j);
      p.side[i] = u < 0.5 ? -1 : 1;
      if (alive) p.born[i] = 1;

      if (reduced) {
        p.x[i] = p.tx[i];
        p.y[i] = p.ty[i];
        p.vx[i] = p.vy[i] = 0;
        p.delay[i] = t;
        continue;
      }
      // Launch wave crosses the stage left to right from where particles are now.
      p.delay[i] = t + (clampX(p.x[i]) / Math.max(1, W)) * T.morphSweep + Math.random() * T.morphJitter;
    }

    this.settleMode = 'morph';
    // A clip waits for the morph to settle plus a gap; a rig starts as soon as
    // the last-launched particles have had their travel time to arrive.
    this.playAt = reduced
      ? t + REDUCED_PLAY_DELAY
      : rig
        ? t + T.morphSweep + T.morphJitter + T.morphTravel
        : t + T.morphSweep + T.morphJitter + T.morphSettle * 0.8 + T.morphPlayGap;
  }

  /* ---- playback -------------------------------------------------------- */

  /** Advance the clip to the frame due at `t`; re-pin every particle's grey. */
  private updateClip(t: number) {
    const frames = this.frames;
    const p = this.pool;
    if (!frames || !p) return;
    const playT = t - this.playAt;
    if (playT < 0) return;
    // Play everything once, then cycle the loop section.
    let tt: number;
    if (playT < frames.total) tt = playT;
    else {
      const loopStart = frames.starts[frames.loopFrom];
      const loopLen = frames.total - loopStart;
      tt = loopLen > 0 ? loopStart + ((playT - frames.total) % loopLen) : frames.total - 0.001;
    }
    let f = this.frameIndex < 0 ? 0 : this.frameIndex;
    if (tt < frames.starts[f]) f = 0;
    while (f + 1 < frames.count && tt >= frames.starts[f + 1]) f++;
    if (f === this.frameIndex) return;
    this.frameIndex = f;

    const base = f * frames.fw * frames.fh;
    const { data } = frames;
    const { pix, targetShade, stir } = p;
    for (let i = 0; i < p.count; i++) {
      const ns = data[base + pix[i]] / 255;
      const d = ns - targetShade[i];
      const s = stir[i] + (d < 0 ? -d : d);
      stir[i] = s > 1 ? 1 : s;
      targetShade[i] = ns;
    }
  }

  /**
   * Advance the rig to field time `t` (rig time = `rigSpeed` × time since
   * `playAt`, offset so the first part starts at once). Each part's fold
   * eases from its authored angle to zero over [start, start + duration]; a part's particles
   * are aimed at their resting spot swung about the hinge by the remaining
   * fold, invisible until the swing begins. Body particles keep the closed
   * picture's greys until the reveal crossfades them to the finished ones.
   */
  private updateRig(t: number, dt: number) {
    const rig = this.rig;
    const p = this.pool;
    if (!rig || !p || this.rigDone) return;
    const parts = rig.parts;
    // Rig time runs from the first part's authored start, so nothing idles
    // between the particles landing and the first swing.
    let lead = Infinity;
    for (const P of parts) if (P.start < lead) lead = P.start;
    if (lead === Infinity) lead = 0;
    const tau = Math.max(0, t - this.playAt) * T.rigSpeed + lead;
    const { x: rx, y: ry, w: rw, h: rh } = this.rect;
    const kx = rw / rig.width;
    const ky = rh / rig.height;
    const s0 = rig.scaleFrom ?? 1;
    let done = true;

    const cs: number[] = [];
    const sn: number[] = [];
    const pivX: number[] = [];
    const pivY: number[] = [];
    const pr: number[] = [];
    const moving: boolean[] = [];
    for (const P of parts) {
      const f = ease5((tau - P.start) / P.duration);
      if (f < 1) done = false;
      const a = P.angle * (1 - f) * DEG;
      const s = lerp(s0, 1, f);
      cs.push(Math.cos(a) * s);
      sn.push(Math.sin(a) * s);
      pivX.push(P.pivot[0]);
      pivY.push(P.pivot[1]);
      // Fades in over the first twelfth of its swing, while still folded inside the body.
      pr.push(Math.min(1, f * 12));
      moving.push(f > 0 && f < 1);
    }
    const xf = ease5((tau - rig.reveal) / rig.revealDuration);
    if (xf < 1) done = false;
    const revealChanged = xf !== this.rigXf;
    this.rigXf = xf;
    const stirNorm = dt > 0 && T.rigStir > 0 ? 1 / (dt * T.rigStir) : 0;
    const reduced = this.reducedMotion;

    const { part, u, v, tx, ty, x, y, pres, presB, shadeA, shadeB, targetShade, stir } = p;
    for (let i = 0; i < p.count; i++) {
      const k = part[i];
      if (k === 0) {
        if (revealChanged) {
          targetShade[i] = lerp(shadeB[i], shadeA[i], xf);
          pres[i] = lerp(presB[i], 1, xf);
        }
        continue;
      }
      const j = k - 1;
      const relx = u[i] * rig.width - pivX[j];
      const rely = v[i] * rig.height - pivY[j];
      const ntx = rx + (pivX[j] + relx * cs[j] - rely * sn[j]) * kx;
      const nty = ry + (pivY[j] + relx * sn[j] + rely * cs[j]) * ky;
      if (moving[j] && stirNorm > 0) {
        const dx = ntx - tx[i];
        const dy = nty - ty[i];
        const sp = Math.sqrt(dx * dx + dy * dy) * stirNorm;
        if (sp > stir[i]) stir[i] = sp > 1 ? 1 : sp;
      }
      tx[i] = ntx;
      ty[i] = nty;
      pres[i] = pr[j];
      if (reduced) {
        x[i] = ntx;
        y[i] = nty;
      }
    }
    if (done) this.rigDone = true;
  }

  /* ---- loop ------------------------------------------------------------ */

  private syncLoop() {
    const shouldRun = this.phase !== 'idle' && this.inView && this.pageVisible;
    if (shouldRun && !this.frame) {
      this.lastFrame = 0;
      this.frame = requestAnimationFrame(this.tick);
    } else if (!shouldRun && this.frame) {
      this.stopLoop();
    }
  }

  private stopLoop() {
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = 0;
  }

  private tick = (now: number) => {
    this.frame = 0;
    if (this.phase === 'idle') return;
    if (this.tuningSeen !== tuningVersion()) {
      this.tuningSeen = tuningVersion();
      this.flow = buildFlowField(this.width, this.height);
    }
    const dt = this.lastFrame ? Math.min(MAX_DT, (now - this.lastFrame) / 1000) : 1 / 60;
    this.lastFrame = now;
    if (!this.step(dt)) return;
    this.compose(dt);
    this.frame = requestAnimationFrame(this.tick);
  };

  /** Overall opacity at field time `t`. */
  private fadeAt(t: number) {
    const exiting = this.phase === 'exit';
    if (this.reducedMotion) {
      if (exiting) return 1 - smoothstep((t - this.exitStart) / REDUCED_FADE_OUT);
      const recover = Math.min(1, this.fadeFloor + (t - this.fadeFloorAt) / T.fadeRecover);
      return Math.min(smoothstep(t / REDUCED_FADE_IN), recover);
    }
    if (exiting) return 1 - smoothstep((t - this.exitStart) / T.exitTime);
    return Math.min(1, this.fadeFloor + (t - this.fadeFloorAt) / T.fadeRecover);
  }

  /**
   * Advance the simulation and splat every live particle into the ink
   * accumulators; returns false once the field has gone idle.
   */
  private step(dt: number): boolean {
    const p = this.pool;
    if (!p) {
      this.phase = 'idle';
      this.clear();
      return false;
    }
    this.time += dt;
    const t = this.time;
    const exiting = this.phase === 'exit';
    const reduced = this.reducedMotion;

    if (exiting && t - this.exitStart >= (reduced ? REDUCED_FADE_OUT : T.exitTime)) {
      this.finishExit();
      return false;
    }

    if (!exiting) {
      this.updateClip(t);
      this.updateRig(t, dt);
    }

    // Deposits are scaled so the steady state is frame-rate independent:
    // the accumulators keep pow(trailDecay, frames) between frames.
    const keep = Math.pow(T.trailDecay, dt * 60);
    const depositScale = T.targetDensity * (1 - keep);
    const shadeMix = 1 - Math.exp(-dt / T.shadeTau);
    const stirKeep = Math.exp(-dt / T.stirTau);
    const exciteKeep = Math.exp(-dt / T.exciteTau);
    const dark = this.theme === 'dark';
    const lumFloor = 1 - T.densityFromLuminance;

    const {
      x, y, vx, vy, tx, ty, ptx, pty, delay, born, side,
      deposit, pdeposit, shade, targetShade, stir, excite, reach, u, v, pres, ppres, part,
    } = p;
    const accA = this.accA;
    const accL = this.accL;
    const bw = this.bw;
    const bh = this.bh;

    // Rig occluder: maps a stage position to the closed picture's silhouette.
    // Lifts with the reveal, and is ignored once it has fully lifted.
    const xf = this.rig ? Math.max(0, this.rigXf) : 1;
    const mask = xf < 1 ? this.rigMask : null;
    const maskVis = mask ? mask.vis : null;
    const mw = mask ? mask.w : 0;
    const mh = mask ? mask.h : 0;
    const { x: rx, y: ry, w: rw, h: rh } = this.rect;
    const mkx = mask ? mw / Math.max(1, rw) : 0;
    const mky = mask ? mh / Math.max(1, rh) : 0;
    const visibility = (i: number, X: number, Y: number) => {
      if (!maskVis || part[i] === 0) return 1;
      const mx = (X - rx) * mkx;
      const my = (Y - ry) * mky;
      if (mx < 0 || my < 0 || mx >= mw || my >= mh) return 1;
      return lerp(maskVis[(my | 0) * mw + (mx | 0)], 1, xf);
    };

    if (reduced) {
      // Particles sit on their targets; greys still follow the clip, and
      // only the fade animates (in compose).
      for (let i = 0; i < p.count; i++) {
        const sh = shade[i] + (targetShade[i] - shade[i]) * shadeMix;
        shade[i] = sh;
        stir[i] = 0;
        const lum = dark ? sh : 1 - sh;
        const density = lumFloor + T.densityFromLuminance * lum;
        const ink = deposit[i] * pres[i] * visibility(i, x[i], y[i]) * depositScale * density;
        if (ink > 0) this.splat(x[i], y[i], ink, sh, accA, accL, bw, bh);
      }
      return true;
    }

    // Pointer velocity decays so a stopped pointer stops pushing.
    const decay = Math.max(0, 1 - T.pointerDecay * dt);
    this.pvx *= decay;
    this.pvy *= decay;

    const flow = this.flow;
    const f0 = flow[0];
    const f1 = flow[1];
    const f2 = flow[2];
    const pointer = this.pointerActive && !exiting;
    const px = this.px;
    const py = this.py;
    const pvx = this.pvx;
    const pvy = this.pvy;
    const settleTime = this.settleMode === 'morph' ? T.morphSettle : T.settleTime;
    const cHold = 2 * Math.sqrt(T.kHold) * T.dampHold;

    for (let i = 0; i < p.count; i++) {
      const age = t - delay[i];
      const holding = age < 0;
      if (holding && !born[i]) continue; // not yet appeared

      const X = x[i];
      const Y = y[i];
      // Behind the enclosure: a part particle over the closed picture deposits nothing.
      const vis = visibility(i, X, Y);

      // Ease the grey towards the current target — but not while holding the
      // previous picture ahead of a morph launch, so it stays intact until
      // the wave reaches it.
      let sh = shade[i];
      const ts = targetShade[i];
      if (!holding && sh !== ts) {
        sh += (ts - sh) * shadeMix;
        shade[i] = sh;
      }
      let st = stir[i];
      if (st > 0.001) stir[i] = st * stirKeep;
      else if (st !== 0) {
        stir[i] = 0;
        st = 0;
      }

      // Curl of three sinusoidal potentials — coherent, divergence-free swirl.
      const c0 = fastCos(f0.kx * X + f0.ky * Y + f0.w * t + f0.ph);
      const c1 = fastCos(f1.kx * X + f1.ky * Y + f1.w * t + f1.ph);
      const c2 = fastCos(f2.kx * X + f2.ky * Y + f2.w * t + f2.ph);
      const fx = f0.ax * c0 + f1.ax * c1 + f2.ax * c2;
      const fy = f0.ay * c0 + f1.ay * c1 + f2.ay * c2;

      let k: number;
      let c: number;
      let flowAmp: number;
      let ax = 0;
      let ay = 0;
      let density: number;
      let goalX: number;
      let goalY: number;
      let ink: number;
      let nvx = vx[i];
      let nvy = vy[i];

      if (exiting) {
        k = 0;
        c = T.exitDamping;
        flowAmp = T.exitFlow;
        ax += side[i] * T.exitPush;
        ay -= T.exitLift;
        density = T.travelDensity;
        goalX = tx[i];
        goalY = ty[i];
        ink = deposit[i] * pres[i] * vis;
      } else if (holding) {
        // Waiting for its launch: stay put on the previous picture.
        k = T.kHold;
        c = cHold;
        flowAmp = T.flowHold + T.stirGain * st;
        density = 1;
        goalX = ptx[i];
        goalY = pty[i];
        ink = pdeposit[i] * ppres[i];
      } else {
        if (born[i] && age < dt) {
          // First frame after a morph launch: aim at the new spot, curling.
          const dx = tx[i] - X;
          const dy = ty[i] - Y;
          const kx = (dx / T.morphTravel) * T.morphKick;
          const ky = (dy / T.morphTravel) * T.morphKick;
          const perp = ribbon(u[i], v[i]) * 0.5;
          nvx = kx - ky * perp;
          nvy = ky + kx * perp;
        }
        const settle = smoothstep(age / settleTime);
        k = lerp(T.kTravel, T.kHold, settle);
        c = lerp(T.cTravel, cHold, settle);
        // Motion in the clip stirs the smoke: recent brightness change
        // temporarily strengthens the flow field for this particle.
        flowAmp = lerp(T.flowTravel, T.flowHold, Math.sqrt(settle)) + T.stirGain * st;
        density = lerp(T.travelDensity, 1, settle);
        if (!born[i] && age < T.growTime) density *= age / T.growTime;
        goalX = tx[i];
        goalY = ty[i];
        // Presence eases from the held value to the current one as the particle settles.
        ink = deposit[i] * lerp(ppres[i], pres[i] * vis, settle);
      }
      const lum = dark ? sh : 1 - sh;
      density *= lumFloor + T.densityFromLuminance * lum;

      // A recently struck particle is held more loosely, so it carries
      // further and drifts back rather than snapping.
      let ex = excite[i];
      if (ex > 0.002) {
        k *= 1 - T.exciteLoosen * ex;
        c *= 1 - T.exciteUndamp * ex;
        ex *= exciteKeep;
      } else if (ex !== 0) ex = 0;

      ax += k * (goalX - X) - c * nvx + flowAmp * fx;
      ay += k * (goalY - Y) - c * nvy + flowAmp * fy;

      if (pointer) {
        const dx = X - px;
        const dy = Y - py;
        const d2 = dx * dx + dy * dy;
        const radius = T.pointerRadius * reach[i];
        if (d2 < radius * radius) {
          const d = Math.sqrt(d2) + 0.001;
          const f = 1 - d / radius;
          const g = f * Math.sqrt(f);
          const nx = dx / d;
          const ny = dy / d;
          ax += T.repel * g * nx - T.swirl * g * ny + T.dragPush * g * pvx;
          ay += T.repel * g * ny + T.swirl * g * nx + T.dragPush * g * pvy;
          if (g > ex) {
            // The pointer got closer than before: throw, by how much closer.
            const dg = g - ex;
            nvx += T.throwImpulse * dg * (nx - 0.35 * ny);
            nvy += T.throwImpulse * dg * (ny + 0.35 * nx);
            ex = g;
          }
        }
      }
      excite[i] = ex;

      nvx += ax * dt;
      nvy += ay * dt;
      vx[i] = nvx;
      vy[i] = nvy;
      const nx = X + nvx * dt;
      const ny = Y + nvy * dt;
      x[i] = nx;
      y[i] = ny;

      if (ink > 0) this.splat(nx, ny, ink * depositScale * density, sh, accA, accL, bw, bh);
    }
    return true;
  }

  /** Bilinear point splat into the ink accumulators. */
  private splat(
    cx: number,
    cy: number,
    ink: number,
    grey: number,
    accA: Float32Array,
    accL: Float32Array,
    bw: number,
    bh: number,
  ) {
    const fx = cx * RENDER_SCALE - 0.5;
    const fy = cy * RENDER_SCALE - 0.5;
    const ix = Math.floor(fx);
    const iy = Math.floor(fy);
    if (ix < 0 || iy < 0 || ix >= bw - 1 || iy >= bh - 1) return;
    const sx = fx - ix;
    const sy = fy - iy;
    const w00 = (1 - sx) * (1 - sy) * ink;
    const w10 = sx * (1 - sy) * ink;
    const w01 = (1 - sx) * sy * ink;
    const w11 = sx * sy * ink;
    let o = iy * bw + ix;
    accA[o] += w00;
    accL[o] += w00 * grey;
    accA[o + 1] += w10;
    accL[o + 1] += w10 * grey;
    o += bw;
    accA[o] += w01;
    accL[o] += w01 * grey;
    accA[o + 1] += w11;
    accL[o + 1] += w11 * grey;
  }

  /**
   * Turn the accumulators into pixels and put them on the canvas, then keep
   * `T.trailDecay`-worth of ink for the next frame (the trail).
   */
  private compose(dt: number) {
    const ctx = this.ctx;
    const image = this.image;
    if (!ctx || !image) return;

    const fade = this.fadeAt(this.time);
    const dark = this.theme === 'dark';
    const lo = dark ? T.greyDarkLo : T.greyLightLo;
    const hi = dark ? T.greyDarkHi : T.greyLightHi;
    const lo255 = lo * 255;
    const span255 = (hi - lo) * 255;
    const keep = Math.pow(T.trailDecay, dt * 60);
    const alphaScale = fade * 255;

    const accA = this.accA;
    const accL = this.accL;
    const pixels = this.pixels;
    const n = accA.length;
    for (let i = 0; i < n; i++) {
      const A = accA[i];
      if (A > MIN_VISIBLE_ALPHA) {
        const g = (lo255 + span255 * (accL[i] / A)) | 0;
        const a = ((A > 1 ? 1 : A) * alphaScale) | 0;
        pixels[i] = (a << 24) | (g << 16) | (g << 8) | g;
        accA[i] = A * keep;
        accL[i] *= keep;
      } else {
        pixels[i] = 0;
        if (A !== 0) {
          accA[i] = 0;
          accL[i] = 0;
        }
      }
    }
    ctx.putImageData(image, 0, 0);
  }
}
