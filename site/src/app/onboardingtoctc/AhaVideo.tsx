'use client';

import { useEffect, useRef } from 'react';
import p from '@/components/CaseStudy/OnboardingPage.module.css';

/**
 * Gated-platform recording after "The Aha moment". Poster is required:
 * the clip is below the fold, so autoplay is skipped and Safari will not
 * paint a frame from preload=metadata. Plays while in view.
 */
export default function AhaVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !reduceMotion) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <figure className={p.ahaVideo}>
      <video
        ref={ref}
        src="/videos/NSLY0rYWQDcSL4ZL9R5htfctNs.mp4"
        poster="/images/onboarding-aha-poster.jpg"
        width={2562}
        height={1540}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label="Screen recording of the gated onboarding flow connecting a first exchange"
      />
    </figure>
  );
}
