'use client';

import { useEffect, useRef } from 'react';
import styles from './CaseCards.module.css';

const VIDEOS = [
  {
    src: '/videos/summ-clickthrough.mp4',
    poster: '/images/summ-clickthrough-poster.jpg',
    width: 1280,
    height: 866,
    label: 'Summ product clickthrough',
  },
  {
    src: '/videos/summ-stocks-announcement.mp4',
    poster: '/images/summ-stocks-announcement-poster.jpg',
    width: 1280,
    height: 804,
    label: 'Summ stocks announcement',
  },
] as const;

/**
 * Two looping product recordings under the SUMM device hero.
 * Play only while in view so the homepage does not download both files
 * on first paint; pause for prefers-reduced-motion.
 */
export default function SummVideos() {
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rowRef.current;
    if (!root) return;

    const videos = Array.from(root.querySelectorAll('video'));
    if (!videos.length) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting && !reduceMotion) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        }
      },
      { threshold: 0.25 },
    );

    videos.forEach((video) => observer.observe(video));
    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.videoRow} ref={rowRef} aria-label="SUMM product recordings">
      {VIDEOS.map((video) => (
        <figure key={video.src} className={styles.videoFrame}>
          <video
            className={styles.video}
            src={video.src}
            poster={video.poster}
            width={video.width}
            height={video.height}
            muted
            loop
            playsInline
            preload="metadata"
            aria-label={video.label}
          />
        </figure>
      ))}
    </div>
  );
}
