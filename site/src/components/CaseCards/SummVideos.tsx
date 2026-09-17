'use client';

import { useEffect, useRef } from 'react';
import styles from './CaseCards.module.css';

interface Recording {
  src: string;
  poster: string;
  width: number;
  height: number;
  label: string;
}

const HERO: Recording = {
  src: '/videos/summ-clickthrough.mp4',
  poster: '/images/summ-clickthrough-poster.jpg',
  width: 1280,
  height: 866,
  label: 'Summ product clickthrough',
};

const TILES: Recording[] = [
  {
    src: '/videos/summ-stocks-announcement.mp4',
    poster: '/images/summ-stocks-announcement-poster.jpg',
    width: 1280,
    height: 804,
    label: 'Summ stocks announcement',
  },
  {
    src: '/videos/summ-add-transaction.mp4',
    poster: '/images/summ-add-transaction-poster.jpg',
    width: 1280,
    height: 828,
    label: 'Summ add transaction walkthrough',
  },
  {
    src: '/videos/summ-stocks-animation-bg.mp4',
    poster: '/images/summ-stocks-animation-bg-poster.jpg',
    width: 1280,
    height: 858,
    label: 'Summ stocks dashboard animation',
  },
  {
    src: '/videos/summ-mobile-app.mp4',
    poster: '/images/summ-mobile-app-poster.jpg',
    width: 1280,
    height: 960,
    label: 'Summ mobile app recording',
  },
];

function RecordingVideo({
  recording,
  preload = 'none',
}: {
  recording: Recording;
  preload?: 'none' | 'metadata';
}) {
  return (
    <video
      className={styles.video}
      src={recording.src}
      poster={recording.poster}
      width={recording.width}
      height={recording.height}
      muted
      loop
      playsInline
      preload={preload}
      aria-label={recording.label}
    />
  );
}

/**
 * SUMM product recordings: the clickthrough as the section hero, then a
 * 2-up grid of remaining loops (including the mobile app). Play only while
 * in view so the homepage does not download the files on first paint;
 * pause for prefers-reduced-motion.
 */
export default function SummVideos() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
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
    <div className={styles.showcase} ref={rootRef} aria-label="SUMM product recordings">
      <figure className={`${styles.videoFrame} ${styles.heroFrame}`}>
        <RecordingVideo recording={HERO} preload="metadata" />
      </figure>
      <div className={styles.videoRow}>
        {TILES.map((recording) => (
          <figure key={recording.src} className={styles.videoFrame}>
            <RecordingVideo recording={recording} />
          </figure>
        ))}
      </div>
    </div>
  );
}
