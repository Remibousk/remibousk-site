'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import { readTheme, subscribeTheme } from '@/lib/theme';
import { ParticleField, type ParticleScene } from './particles';
import styles from './HeroParticles.module.css';

type Props = {
  /** Picture to show; `null` sends the current one back out. */
  scene: ParticleScene | null;
};

/**
 * Fills its positioned parent with a canvas and drives a ParticleField in it.
 * Owns the wiring the engine needs from the DOM: element size, theme,
 * reduced-motion preference, pointer position, and in-view / tab visibility.
 */
export default function HeroParticles({ scene }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fieldRef = useRef<ParticleField | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const field = new ParticleField(canvas);
    fieldRef.current = field;

    field.setTheme(readTheme());
    const unsubscribeTheme = subscribeTheme(() => field.setTheme(readTheme()));

    field.resize(root.clientWidth, root.clientHeight);
    const resizeObserver = new ResizeObserver((entries) => {
      const box = entries[0]?.contentRect;
      if (box) field.resize(box.width, box.height);
    });
    resizeObserver.observe(root);

    const viewObserver = new IntersectionObserver(
      (entries) => field.setInView(entries[0]?.isIntersecting ?? true),
      { threshold: 0 },
    );
    viewObserver.observe(root);

    const onPointerMove = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      field.setPointer(e.clientX - r.left, e.clientY - r.top);
    };
    const onPointerEnd = (e: PointerEvent) => {
      // Touch has no hover: release when the finger lifts.
      if (e.pointerType !== 'mouse') field.setPointer(null);
    };
    const onPointerLeave = () => field.setPointer(null);
    root.addEventListener('pointermove', onPointerMove);
    root.addEventListener('pointerleave', onPointerLeave);
    root.addEventListener('pointercancel', onPointerLeave);
    root.addEventListener('pointerup', onPointerEnd);

    return () => {
      root.removeEventListener('pointermove', onPointerMove);
      root.removeEventListener('pointerleave', onPointerLeave);
      root.removeEventListener('pointercancel', onPointerLeave);
      root.removeEventListener('pointerup', onPointerEnd);
      viewObserver.disconnect();
      resizeObserver.disconnect();
      unsubscribeTheme();
      field.destroy();
      fieldRef.current = null;
    };
  }, []);

  useEffect(() => {
    fieldRef.current?.setReducedMotion(Boolean(reduceMotion));
  }, [reduceMotion]);

  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return;
    if (scene) field.show(scene);
    else field.hide();
  }, [scene]);

  return (
    <div ref={rootRef} className={styles.root} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
