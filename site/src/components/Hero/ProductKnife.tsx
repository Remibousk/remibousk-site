'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import styles from './Hero.module.css';

type Props = { active: boolean; reducedMotion: boolean };

/** Lazily loaded on first interaction. The renderer sleeps while hidden. */
export default function ProductKnife({ active, reducedMotion }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const controller = useRef<{ update: (active: boolean, reduced: boolean) => void } | null>(null);
  const state = useRef({ active, reducedMotion });
  const [ready, setReady] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    state.current = { active, reducedMotion };
    controller.current?.update(active, reducedMotion);
  }, [active, reducedMotion]);

  useEffect(() => {
    const container = host.current;
    if (!container) return;
    let disposed = false;
    let raf = 0;
    let elapsed = 0;
    let lastTime = 0;
    let inView = true;
    let hasRendered = false;
    let contextLost = false;
    let fallbackShown = false;
    let model: THREE.Group | undefined;
    let mixer: THREE.AnimationMixer | undefined;
    const actions: THREE.AnimationAction[] = [];
    let renderer: THREE.WebGLRenderer;

    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    } catch {
      setShowFallback(true);
      return; // Keep the Blender-rendered poster if WebGL is unavailable.
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = .85;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-5, 5, 3.34, -3.34, .1, 60);
    camera.position.set(0, 18, 7.5);
    camera.lookAt(-.35, 0, -.65);
    let fitWidth = 9.2;
    let fitHeight = 6.14;
    const pmrem = new THREE.PMREMGenerator(renderer);
    // Dark studio with distinct softboxes: metal needs shaped reflections.
    const studio = new THREE.Scene();
    studio.background = new THREE.Color(.012, .015, .02);
    const panels: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>[] = [];
    const softbox = (width: number, height: number, position: [number, number, number], intensity: number) => {
      const panel = new THREE.Mesh(
        new THREE.PlaneGeometry(width, height),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(intensity, intensity, intensity), side: THREE.DoubleSide }),
      );
      panel.position.set(...position);
      panel.lookAt(0, 0, 0);
      studio.add(panel);
      panels.push(panel);
    };
    softbox(6, 4, [-3, 7, -4], 1.6);
    softbox(14, 10, [0, 9, -6], .3);
    softbox(2, 7, [4, 3, 1], 2.2);
    softbox(3, 3, [-6, 1, 4], 1.2);
    const environment = pmrem.fromScene(studio, .035);
    scene.environment = environment.texture;
    scene.environmentIntensity = 1;
    panels.forEach((panel) => { panel.geometry.dispose(); panel.material.dispose(); });
    pmrem.dispose();
    scene.add(new THREE.HemisphereLight(0xe9f3ff, 0x171d2b, .08));
    const key = new THREE.DirectionalLight(0xffffff, 1.25);
    key.position.set(-3, 7, 2);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    Object.assign(key.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: .1, far: 25 });
    key.shadow.normalBias = .025;
    key.shadow.bias = -.0002;
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xe8f0ff, .45);
    rim.position.set(3, 4, -4);
    scene.add(rim);

    function disposeModel(object: THREE.Object3D) {
      const textures = new Set<THREE.Texture>();
      const materials = new Set<THREE.Material>();
      object.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        child.geometry.dispose();
        const list = Array.isArray(child.material) ? child.material : [child.material];
        list.forEach((material: THREE.Material) => materials.add(material));
      });
      materials.forEach((material) => {
        Object.values(material).forEach((value) => {
          if (value instanceof THREE.Texture) textures.add(value);
        });
        material.dispose();
      });
      textures.forEach((texture) => {
        if (typeof ImageBitmap !== 'undefined' && texture.source.data instanceof ImageBitmap) {
          texture.source.data.close();
        }
        texture.dispose();
      });
    }

    const canRender = () => !disposed && !contextLost && state.current.active && inView && !document.hidden;
    const draw = (time: number) => {
      raf = 0;
      if (!canRender() || !model) return;
      const dt = lastTime ? Math.min((time - lastTime) / 1000, .05) : 0;
      lastTime = time;
      elapsed += dt;
      const reduced = state.current.reducedMotion;
      mixer?.setTime(reduced ? 1.1 : Math.min(elapsed, 1.1));
      // A small reveal turn settles with the tools; no perpetual bobbing.
      const reveal = reduced ? 1 : 1 - Math.pow(1 - Math.min(elapsed / 1.1, 1), 3);
      model.rotation.y = -.13 * (1 - reveal);
      renderer.render(scene, camera);
      if (!hasRendered) { hasRendered = true; setReady(true); }
      if (!reduced && elapsed < 1.15) raf = requestAnimationFrame(draw);
    };
    const resume = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      lastTime = 0;
      if (canRender() && model) raf = requestAnimationFrame(draw);
    };
    controller.current = {
      update: (visible, reduced) => {
        state.current = { active: visible, reducedMotion: reduced };
        if (!visible) {
          elapsed = 0;
          actions.forEach((action) => action.reset().play());
        }
        resume();
      },
    };

    const fitCamera = () => {
      const { width, height } = container.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height);
      const aspect = width / height;
      const viewHeight = Math.max(fitHeight, fitWidth / aspect);
      camera.left = -viewHeight * aspect / 2;
      camera.right = viewHeight * aspect / 2;
      camera.top = viewHeight / 2;
      camera.bottom = -viewHeight / 2;
      camera.updateProjectionMatrix();
      resume();
    };
    const resize = new ResizeObserver(fitCamera);
    resize.observe(container);
    const intersection = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      resume();
    });
    intersection.observe(container);
    document.addEventListener('visibilitychange', resume);
    const lost = (event: Event) => {
      event.preventDefault();
      contextLost = true;
      cancelAnimationFrame(raf);
      hasRendered = false;
      setShowFallback(true);
      setReady(false);
    };
    const restored = () => { contextLost = false; resume(); };
    renderer.domElement.addEventListener('webglcontextlost', lost);
    renderer.domElement.addEventListener('webglcontextrestored', restored);

    // Avoid flashing a fully open poster before the folding animation starts.
    const fallbackTimer = window.setTimeout(() => {
      if (!disposed && !model) { fallbackShown = true; setShowFallback(true); }
    }, 800);
    new GLTFLoader().load('/models/product-swiss-army-knife.glb?v=2', (gltf) => {
      window.clearTimeout(fallbackTimer);
      if (disposed) {
        disposeModel(gltf.scene);
        return;
      }
      model = gltf.scene;
      model.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        child.castShadow = true;
        child.receiveShadow = true;
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((material) => {
          if (material instanceof THREE.MeshStandardMaterial && material.name.includes('Product blue')) {
            material.envMapIntensity = .15;
          }
        });
      });
      scene.add(model);
      mixer = new THREE.AnimationMixer(model);
      gltf.animations.forEach((clip) => {
        const action = mixer!.clipAction(clip);
        action.setLoop(THREE.LoopOnce, 1);
        action.clampWhenFinished = true;
        action.play();
        actions.push(action);
      });
      // Fit the complete unfolded silhouette in camera space, including depth.
      mixer.setTime(1.1);
      model.updateMatrixWorld(true);
      camera.updateMatrixWorld(true);
      const bounds = new THREE.Box3().setFromObject(model);
      const projected = new THREE.Box3();
      for (const x of [bounds.min.x, bounds.max.x]) {
        for (const y of [bounds.min.y, bounds.max.y]) {
          for (const z of [bounds.min.z, bounds.max.z]) {
            projected.expandByPoint(new THREE.Vector3(x, y, z).applyMatrix4(camera.matrixWorldInverse));
          }
        }
      }
      const center = projected.getCenter(new THREE.Vector3());
      const offset = new THREE.Vector3(center.x, center.y, 0).applyQuaternion(camera.quaternion);
      camera.position.add(offset);
      fitWidth = (projected.max.x - projected.min.x) * 1.06;
      fitHeight = (projected.max.y - projected.min.y) * 1.06;
      actions.forEach((action) => action.reset().play());
      mixer.setTime(0);
      if (fallbackShown) elapsed = 1.1;
      fitCamera();
    }, undefined, () => {
      window.clearTimeout(fallbackTimer);
      if (!disposed) setShowFallback(true);
    });

    return () => {
      disposed = true;
      window.clearTimeout(fallbackTimer);
      controller.current = null;
      cancelAnimationFrame(raf);
      resize.disconnect();
      intersection.disconnect();
      document.removeEventListener('visibilitychange', resume);
      renderer.domElement.removeEventListener('webglcontextlost', lost);
      renderer.domElement.removeEventListener('webglcontextrestored', restored);
      mixer?.stopAllAction();
      if (model) {
        mixer?.uncacheRoot(model);
        disposeModel(model);
      }
      environment.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={styles.knifePoster} src="/images/product-knife-poster.png?v=2" alt="" style={{ opacity: showFallback && !ready ? 1 : 0 }} />
      <div ref={host} className={styles.knifeCanvas} style={{ opacity: ready ? 1 : 0 }} />
    </>
  );
}
