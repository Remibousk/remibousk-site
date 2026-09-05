'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import styles from './ImageLightbox.module.css';

/**
 * Click-to-expand lightbox for case-study screenshots. Mounted once from
 * CaseLayout; it tags images inside `main` (except `[data-no-lightbox]`)
 * and FLIP-animates a portalled clone from the thumbnail's on-screen box
 * to a viewport-centered frame. Portal is required because several shots
 * sit under `overflow: hidden` (and some under Reveal's transform), which
 * would clip a non-portalled overlay.
 */

const MARK = 'data-case-lightbox';
const PAD = 32;
const SPRING = { type: 'spring' as const, bounce: 0.1, duration: 0.12 };

type Rect = { top: number; left: number; width: number; height: number };

type Origin = Rect & { clipPath: string; borderRadius: string };

type Active = {
  el: HTMLImageElement;
  src: string;
  alt: string;
  origin: Origin;
  dest: Rect;
};

function clipsAxis(value: string) {
  return value !== 'visible';
}

function measureOrigin(img: HTMLImageElement): Origin {
  const r = img.getBoundingClientRect();
  let visTop = r.top;
  let visLeft = r.left;
  let visRight = r.right;
  let visBottom = r.bottom;

  let parent: HTMLElement | null = img.parentElement;
  while (parent && parent !== document.documentElement) {
    const style = getComputedStyle(parent);
    if (clipsAxis(style.overflowX) || clipsAxis(style.overflowY)) {
      const p = parent.getBoundingClientRect();
      if (clipsAxis(style.overflowY)) {
        visTop = Math.max(visTop, p.top);
        visBottom = Math.min(visBottom, p.bottom);
      }
      if (clipsAxis(style.overflowX)) {
        visLeft = Math.max(visLeft, p.left);
        visRight = Math.min(visRight, p.right);
      }
    }
    parent = parent.parentElement;
  }

  const view = viewportSize();
  visTop = Math.max(visTop, view.offsetTop);
  visLeft = Math.max(visLeft, view.offsetLeft);
  visRight = Math.min(visRight, view.offsetLeft + view.width);
  visBottom = Math.min(visBottom, view.offsetTop + view.height);

  const clipTop = Math.max(0, visTop - r.top);
  const clipRight = Math.max(0, r.right - visRight);
  const clipBottom = Math.max(0, r.bottom - visBottom);
  const clipLeft = Math.max(0, visLeft - r.left);

  let borderRadius = getComputedStyle(img).borderRadius;
  if ((borderRadius === '0px' || borderRadius === '0') && img.parentElement) {
    const parentStyle = getComputedStyle(img.parentElement);
    if (clipsAxis(parentStyle.overflow) || clipsAxis(parentStyle.overflowX) || clipsAxis(parentStyle.overflowY)) {
      borderRadius = parentStyle.borderRadius;
    }
  }

  return {
    top: r.top,
    left: r.left,
    width: r.width,
    height: r.height,
    borderRadius: borderRadius || '0px',
    clipPath: `inset(${clipTop}px ${clipRight}px ${clipBottom}px ${clipLeft}px)`,
  };
}

function viewportSize() {
  const vp = window.visualViewport;
  return {
    width: vp?.width ?? window.innerWidth,
    height: vp?.height ?? window.innerHeight,
    offsetTop: vp?.offsetTop ?? 0,
    offsetLeft: vp?.offsetLeft ?? 0,
  };
}

function measureDest(naturalW: number, naturalH: number): Rect {
  const { width: vw, height: vh, offsetTop, offsetLeft } = viewportSize();
  const maxW = Math.max(1, vw - PAD * 2);
  const maxH = Math.max(1, vh - PAD * 2);
  const aspect = naturalW > 0 && naturalH > 0 ? naturalW / naturalH : 1;
  let width = maxW;
  let height = width / aspect;
  if (height > maxH) {
    height = maxH;
    width = height * aspect;
  }
  return {
    top: offsetTop + (vh - height) / 2,
    left: offsetLeft + (vw - width) / 2,
    width,
    height,
  };
}

function naturalSize(img: HTMLImageElement, fallback: Rect) {
  const width =
    img.naturalWidth || Number(img.getAttribute('width')) || fallback.width;
  const height =
    img.naturalHeight || Number(img.getAttribute('height')) || fallback.height;
  return { width, height };
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        fill="currentColor"
        d="M6.22 6.22a.75.75 0 0 1 1.06 0L12 10.94l4.72-4.72a.75.75 0 1 1 1.06 1.06L13.06 12l4.72 4.72a.75.75 0 1 1-1.06 1.06L12 13.06l-4.72 4.72a.75.75 0 1 1-1.06-1.06L10.94 12 6.22 7.28a.75.75 0 0 1 0-1.06"
      />
    </svg>
  );
}

export default function ImageLightbox() {
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState<Active | null>(null);
  const reduceMotion = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastElRef = useRef<HTMLImageElement | null>(null);
  const busyRef = useRef(false);
  const scrollRef = useRef<{ html: string; body: string; pad: string } | null>(
    null,
  );

  const lockScroll = useCallback(() => {
    if (scrollRef.current) return;
    const html = document.documentElement;
    const body = document.body;
    const gap = window.innerWidth - html.clientWidth;
    scrollRef.current = {
      html: html.style.overflow,
      body: body.style.overflow,
      pad: body.style.paddingRight,
    };
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    if (gap > 0) body.style.paddingRight = `${gap}px`;
  }, []);

  const unlockScroll = useCallback(() => {
    const prev = scrollRef.current;
    if (!prev) return;
    document.documentElement.style.overflow = prev.html;
    document.body.style.overflow = prev.body;
    document.body.style.paddingRight = prev.pad;
    scrollRef.current = null;
  }, []);

  const restoreThumb = useCallback(() => {
    const el = lastElRef.current;
    if (el) {
      el.style.visibility = '';
      el.setAttribute('aria-expanded', 'false');
      if (document.body.contains(el)) el.focus({ preventScroll: true });
    }
    lastElRef.current = null;
    busyRef.current = false;
    unlockScroll();
  }, [unlockScroll]);

  const close = useCallback(() => {
    if (!busyRef.current) return;
    setActive(null);
  }, []);

  const open = useCallback(
    (img: HTMLImageElement) => {
      if (busyRef.current) return;
      busyRef.current = true;
      const origin = measureOrigin(img);
      lockScroll();
      const natural = naturalSize(img, origin);
      lastElRef.current = img;
      img.setAttribute('aria-expanded', 'true');
      setActive({
        el: img,
        src: img.currentSrc || img.src,
        alt: img.alt,
        origin,
        dest: measureDest(natural.width, natural.height),
      });
    },
    [lockScroll],
  );

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const root = document.getElementById('case-top');
    if (!root) return;
    const main = root.querySelector('main');
    if (!main) return;

    const tagged: HTMLImageElement[] = [];
    for (const node of main.querySelectorAll('img')) {
      if (!(node instanceof HTMLImageElement)) continue;
      if (node.closest('[data-no-lightbox]')) continue;
      node.setAttribute(MARK, '');
      node.setAttribute('role', 'button');
      node.setAttribute('tabindex', '0');
      node.setAttribute('aria-haspopup', 'dialog');
      node.setAttribute('aria-expanded', 'false');
      if (node.alt) node.setAttribute('aria-label', `View larger: ${node.alt}`);
      node.classList.add(styles.zoomable);
      tagged.push(node);
    }

    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const img = target.closest(`img[${MARK}]`);
      if (!(img instanceof HTMLImageElement)) return;
      event.preventDefault();
      open(img);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const img = event.target;
      if (!(img instanceof HTMLImageElement) || !img.hasAttribute(MARK)) return;
      event.preventDefault();
      open(img);
    };

    root.addEventListener('click', onClick);
    root.addEventListener('keydown', onKeyDown);
    return () => {
      root.removeEventListener('click', onClick);
      root.removeEventListener('keydown', onKeyDown);
      for (const img of tagged) {
        img.removeAttribute(MARK);
        img.removeAttribute('role');
        img.removeAttribute('tabindex');
        img.removeAttribute('aria-haspopup');
        img.removeAttribute('aria-expanded');
        if (img.alt) img.removeAttribute('aria-label');
        img.classList.remove(styles.zoomable);
      }
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!active) return;
    active.el.style.visibility = 'hidden';
  }, [active]);

  useEffect(() => {
    if (!active) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
      if (event.key === 'Tab') {
        event.preventDefault();
        closeRef.current?.focus();
      }
    };
    const onResize = () => {
      const natural = naturalSize(active.el, active.origin);
      setActive((current) =>
        current
          ? { ...current, dest: measureDest(natural.width, natural.height) }
          : current,
      );
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [active, close]);

  useEffect(() => () => restoreThumb(), [restoreThumb]);

  const openClip = 'inset(0px 0px 0px 0px)';
  const imageTransition = reduceMotion ? { duration: 0.15 } : SPRING;

  return mounted
    ? createPortal(
        <AnimatePresence onExitComplete={restoreThumb}>
          {active && (
            <motion.div
              key="case-lightbox"
              className={styles.overlay}
              role="dialog"
              aria-modal="true"
              aria-label={active.alt || 'Expanded image'}
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 1 }}
              transition={{ duration: reduceMotion ? 0.12 : 0.15 }}
            >
              <motion.div
                className={styles.scrim}
                onClick={close}
                aria-hidden="true"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.12 }}
              />
              <motion.img
                className={styles.image}
                src={active.src}
                alt={active.alt}
                draggable={false}
                initial={
                  reduceMotion
                    ? {
                        ...active.dest,
                        opacity: 0,
                        clipPath: openClip,
                        borderRadius: 8,
                      }
                    : {
                        top: active.origin.top,
                        left: active.origin.left,
                        width: active.origin.width,
                        height: active.origin.height,
                        clipPath: active.origin.clipPath,
                        borderRadius: active.origin.borderRadius,
                      }
                }
                animate={{
                  top: active.dest.top,
                  left: active.dest.left,
                  width: active.dest.width,
                  height: active.dest.height,
                  clipPath: openClip,
                  borderRadius: 8,
                  opacity: 1,
                }}
                exit={
                  reduceMotion
                    ? {
                        ...active.dest,
                        opacity: 0,
                        clipPath: openClip,
                        borderRadius: 8,
                      }
                    : {
                        top: active.origin.top,
                        left: active.origin.left,
                        width: active.origin.width,
                        height: active.origin.height,
                        clipPath: active.origin.clipPath,
                        borderRadius: active.origin.borderRadius,
                      }
                }
                transition={imageTransition}
                onClick={(event) => event.stopPropagation()}
              />
              <motion.button
                ref={closeRef}
                type="button"
                className={styles.close}
                aria-label="Close"
                onClick={close}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.12 }}
              >
                <CloseIcon />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )
    : null;
}
