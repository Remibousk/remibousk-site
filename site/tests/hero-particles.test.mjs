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
