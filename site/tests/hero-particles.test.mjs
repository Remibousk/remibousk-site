import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

// Exercise the real engine with a deterministic canvas/clock, without a browser
// or extra dependencies. Tiny synthetic images isolate lifecycle regressions.
const source = readFileSync(new URL('../src/components/HeroParticles/particles.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } });
const { ParticleField, setTuning } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
setTuning('poolPhone', 1000);
let clock = 0, nextId = 0;
const callbacks = new Map();
const pendingImages = new Map();
globalThis.requestAnimationFrame = (fn) => { callbacks.set(++nextId, fn); return nextId; };
globalThis.cancelAnimationFrame = (id) => callbacks.delete(id);
class FakeImage {
  naturalWidth = 8; naturalHeight = 8;
  decode() { return Promise.resolve(); }
  set src(src) {
    this.url = src;
    if (src.includes('pending')) pendingImages.set(src, this);
    else queueMicrotask(() => this.onload());
  }
}
globalThis.Image = FakeImage;
function canvas() {
  const ctx = {
    image: null, draws: 0,
    drawImage(image) { this.image = image; },
    getImageData(x, y, w, h) {
      const data = new Uint8ClampedArray(w * h * 4);
      for (let i = 0; i < data.length; i += 4) {
        const shade = x >= 8 ? 230 : 20;
        data[i] = this.image?.url?.includes('color') ? 255 : shade;
        data[i + 1] = data[i + 2] = this.image?.url?.includes('color') ? 0 : shade;
        data[i + 3] = 255;
      }
      return { data };
    },
    createImageData(w, h) { return { data: new Uint8ClampedArray(w * h * 4) }; },
    putImageData() { this.draws++; }, clearRect() {},
  };
  return { getContext: () => ctx, width: 0, height: 0, ctx };
}
globalThis.document = { hidden: false, visibilityState: 'visible', addEventListener() {}, removeEventListener() {}, createElement: canvas };
const flush = () => new Promise(resolve => setImmediate(resolve));
function advance(seconds) {
  for (let i = 0; i < Math.ceil(seconds * 60); i++) {
    clock += 1000 / 60;
    const batch = [...callbacks.values()]; callbacks.clear();
    batch.forEach(fn => fn(clock));
  }
}
const image = (id) => ({ id, kind: 'image', src: `/${id}.webp`, width: 8, height: 8 });
function field() { const f = new ParticleField(canvas()); f.resize(200, 160); return f; }

test('a dismissed pending scene cannot resurrect the previous effect', async () => {
  const f = field(); f.show(image('first')); await flush();
  f.show(image('pending-dismiss')); f.hide();
  pendingImages.get('/pending-dismiss.webp').onload(); await flush(); advance(1);
  assert.equal(f.phase, 'idle'); assert.equal(f.scene, null); f.destroy();
});
test('reselecting the visible scene supersedes a pending morph', async () => {
  const f = field(); f.show(image('first')); await flush();
  f.show(image('pending-switch')); f.show(image('first'));
  pendingImages.get('/pending-switch.webp').onload(); await flush();
  assert.equal(f.scene.id, 'first'); f.destroy();
});
test('failed images retry on the next request', async () => {
  const f = field(); f.show(image('pending-retry'));
  const failed = pendingImages.get('/pending-retry.webp'); failed.onerror(); await flush();
  f.show(image('pending-retry'));
  assert.notEqual(pendingImages.get('/pending-retry.webp'), failed);
  pendingImages.get('/pending-retry.webp').onload(); await flush();
  assert.equal(f.phase, 'shown'); f.destroy();
});
test('reduced motion sleeps and redraws correctly on theme, resize and dismiss', async () => {
  const f = field(); f.setReducedMotion(true); f.show(image('still')); await flush(); advance(1);
  assert.equal(f.frame, 0);
  const before = f.pool.x.slice(); f.setPointer(100, 80); advance(1);
  assert.deepEqual(f.pool.x, before);
  f.setTheme('light'); assert.ok(f.frame); advance(1); assert.equal(f.frame, 0);
  f.resize(300, 200); advance(1); assert.equal(f.frame, 0);
  assert.equal(f.pool.x[0], f.pool.tx[0]);
  f.hide(); advance(1); assert.equal(f.phase, 'idle'); f.destroy();
});
test('reduced sheets use the selected poster and never advance frames', async () => {
  const f = field(); f.setReducedMotion(true);
  f.show({id:'sheet',kind:'sheet',src:'/sheet.webp',width:8,height:8,cols:2,rows:1,frameWidth:8,frameHeight:8,count:2,durations:[40,40],reducedFrame:1});
  await flush(); advance(2);
  assert.equal(f.frameIndex, 1); assert.equal(f.frame, 0);
  assert.ok(Math.abs(f.pool.shade[0] - 230/255) < 0.001); f.destroy();
});
test('reduced rig immediately forms its complete open silhouette', async () => {
  const f = field(); f.setReducedMotion(true);
  f.show({id:'rig',kind:'rig',src:'/open.webp',closedSrc:'/closed.webp',width:8,height:8,body:[0,0,4,0,4,8,0,8],parts:[{name:'blade',poly:[4,0,8,0,8,8,4,8],pivot:[4,4],angle:90,start:0,duration:1}],reveal:1,revealDuration:0.5});
  await flush(); advance(1);
  assert.equal(f.rigDone, true); assert.equal(f.rigXf, 1); assert.equal(f.frame, 0);
  for(let i=0;i<f.pool.count;i++) { assert.equal(f.pool.x[i], f.pool.tx[i]); assert.equal(f.pool.pres[i],1); }
  f.destroy();
});
test('colour stills use luminance, while sheets retain their greyscale byte', async () => {
  const f=field(); f.show(image('color')); await flush();
  assert.ok(Math.abs(f.pool.targetShade[0] - 0.2126)<0.001); f.destroy();
  const g=field(); g.show({id:'grey',kind:'sheet',src:'/grey.webp',width:8,height:8,cols:1,rows:1,frameWidth:8,frameHeight:8,count:1,durations:[100]}); await flush();
  assert.ok(Math.abs(g.pool.targetShade[0] - 20/255)<0.001); g.destroy();
});
test('hidden and offscreen fields pause; destruction cancels scheduled work', async () => {
  const f=field(); f.show(image('visibility')); await flush();
  f.setInView(false); assert.equal(f.frame,0);
  f.setInView(true); assert.ok(f.frame);
  document.visibilityState='hidden'; f.onVisibility(); assert.equal(f.frame,0);
  document.visibilityState='visible'; f.onVisibility(); assert.ok(f.frame);
  f.destroy(); assert.equal(f.frame,0); assert.equal(callbacks.size,0);
});
test('tablet budgets scale with image area instead of using the phone floor', () => {
  const f=field(); f.resize(390,700); const phone=f.poolSize();
  f.resize(680,900); const tablet=f.poolSize();
  assert.ok(tablet>phone*2); assert.ok(tablet<=36000); f.destroy();
});
test('empty silhouettes produce finite, invisible targets', () => {
  const f=field();
  const targets=f.finishTargets({us:[],vs:[],shades:[],coverage:0},1000,2,false);
  assert.ok(targets.u.every(Number.isFinite)); assert.ok(targets.deposit.every(v=>v===0)); f.destroy();
});

test('morph drifts toward a shared wind region before returning to the next shape', async () => {
  const originalRandom = Math.random;
  Math.random = () => 0.125;
  const f = field();
  try {
    f.show(image('wind-start')); await flush(); advance(4);
    const initialX = f.pool.x.slice(), initialY = f.pool.y.slice();
    f.show(image('wind-end')); await flush();
    const p = f.pool;
    assert.deepEqual(p.x, initialX, 'assigning a gust must not teleport the cloud');
    let wx = 0, wy = 0;
    for (let i = 0; i < p.count; i++) {
      wx += p.windU[i] * f.width - initialX[i];
      wy += p.windV[i] * f.height - initialY[i];
    }
    const length = Math.hypot(wx, wy); wx /= length; wy /= length;
    assert.ok(length / p.count > 15, 'the gust must have a readable shared direction');
    assert.ok(new Set(p.windTime).size > 10, 'ribbons should turn at different times');
    advance(0.55);
    let drift = 0;
    for (let i = 0; i < p.count; i++) drift += (p.x[i] - initialX[i]) * wx + (p.y[i] - initialY[i]) * wy;
    assert.ok(drift / p.count > 10, 'the cloud should visibly leave the old silhouette');
    advance(4);
    const averageError = p.x.reduce((sum, x, i) => sum + Math.hypot(x-p.tx[i],p.y[i]-p.ty[i]), 0) / p.count;
    assert.ok(averageError < 1.5, `cloud should reconvene, error=${averageError}`);
    assert.equal(f.trailKeep(1/60), 0.7, 'long wind trails must settle back to the original material');
  } finally { f.destroy(); Math.random = originalRandom; }
});

test('interrupting a gust preserves positions and selects a fresh direction', async () => {
  const f=field();
  try {
    f.show(image('interrupt-a')); await flush(); advance(3);
    f.show(image('interrupt-b')); await flush(); advance(0.3);
    const before=f.pool.x.slice(), angle=f.windAngle;
    f.show(image('interrupt-c')); await flush();
    assert.deepEqual(f.pool.x,before);
    assert.deepEqual(f.pool.ptx,before,'the launch wave must hold actual positions');
    assert.ok(f.windAngle-angle>Math.PI/2);
    advance(5);
    assert.ok(f.pool.x.every(Number.isFinite));
    assert.equal(f.scene.id,'interrupt-c');
  } finally { f.destroy(); }
});

test('morphing clips wait for the wind and return before playing', async () => {
  const f=field();
  try {
    f.show(image('clip-wind-start')); await flush(); advance(3);
    f.show({id:'wind-sheet',kind:'sheet',src:'/wind-sheet.webp',width:8,height:8,cols:2,rows:1,frameWidth:8,frameHeight:8,count:2,durations:[100,100]}); await flush();
    assert.ok(f.playAt>f.windEnds+1);
    advance(0.8); assert.equal(f.frameIndex,0);
  } finally { f.destroy(); }
});

test('reduced-motion morphs bypass the wind and sleep on their next shape', async () => {
  const f=field();
  try {
    f.setReducedMotion(true); f.show(image('reduced-wind-a')); await flush(); advance(1);
    f.show(image('reduced-wind-b')); await flush(); advance(1);
    assert.ok(f.pool.windLaunch.every(v=>v===0));
    assert.ok(f.pool.windTime.every(v=>v===0));
    assert.deepEqual(f.pool.x,f.pool.tx); assert.equal(f.frame,0);
  } finally { f.destroy(); }
});

test('enabling reduced motion during a gust stops travel at the destination', async () => {
  const f=field();
  try {
    f.show(image('live-reduced-a')); await flush(); advance(3);
    f.show(image('live-reduced-b')); await flush(); advance(0.35);
    f.setReducedMotion(true); advance(1);
    assert.deepEqual(f.pool.x,f.pool.tx); assert.deepEqual(f.pool.y,f.pool.ty);
    assert.equal(f.frame,0);
  } finally { f.destroy(); }
});

test('a transition interrupted before initial birth still reaches its new shape', async () => {
  const f=field();
  try {
    f.show(image('before-birth-a')); await flush();
    f.show(image('before-birth-b')); await flush(); advance(5);
    assert.ok(f.pool.x.every(Number.isFinite));
    const error=f.pool.x.reduce((sum,x,i)=>sum+Math.hypot(x-f.pool.tx[i],f.pool.y[i]-f.pool.ty[i]),0)/f.pool.count;
    assert.ok(error<1.5);
  } finally { f.destroy(); }
});

test('settled particles stay alive within a small, bounded region', async () => {
  const f=field();
  const originalRandom=Math.random; Math.random=()=>0.125;
  try {
    f.show(image('living-still')); await flush(); advance(5);
    const beforeX=f.pool.x.slice(), beforeY=f.pool.y.slice();
    advance(2);
    const movement=f.pool.x.reduce((sum,x,i)=>sum+Math.hypot(x-beforeX[i],f.pool.y[i]-beforeY[i]),0)/f.pool.count;
    assert.ok(movement>0.2,`idle particles should visibly move, movement=${movement}`);
    advance(15);
    const maxError=Math.max(...f.pool.x.map((x,i)=>Math.hypot(x-f.pool.tx[i],f.pool.y[i]-f.pool.ty[i])));
    assert.ok(maxError<2,`idle motion must not erode the silhouette, error=${maxError}`);
  } finally { f.destroy(); Math.random=originalRandom; }
});
