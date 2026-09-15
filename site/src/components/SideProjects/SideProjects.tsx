'use client';

import { useEffect, useRef } from 'react';
import styles from './SideProjects.module.css';

interface Project {
  name: string;
  description: string;
  href: string;
  published: boolean;
  video?: {
    src: string;
    poster: string;
    width: number;
    height: number;
  };
}

/**
 * Curated personal projects from github.com/Remibousk.
 * Published projects link to the live site; the rest open the GitHub repo.
 * Work-only / this-portfolio repos are omitted.
 */
const PROJECTS: Project[] = [
  {
    name: 'RemOS',
    description: 'A personal OS.',
    href: 'https://os.remibousk.com',
    published: true,
    video: {
      src: '/videos/remos.mp4',
      poster: '/images/remos-poster.jpg',
      width: 1280,
      height: 774,
    },
  },
  {
    name: 'Symbol Morph',
    description:
      'A playground for shape and motion. Morph symbols into looping animations.',
    href: 'https://symbol-morph.vercel.app/',
    published: true,
    video: {
      src: '/videos/symbol-morph.mp4',
      poster: '/images/symbol-morph-poster.jpg',
      width: 1280,
      height: 852,
    },
  },
  {
    name: 'RemOS UI',
    description:
      'Portable design system: two-tier tokens, an OKLCH theme engine, and Radix primitives.',
    href: 'https://github.com/Remibousk/remos-ui',
    published: false,
  },
  {
    name: 'World Clock',
    description:
      'Compare time zones at a glance: live clocks, work-hours overlap, weather, and AI city skies.',
    href: 'https://worldtime.me',
    published: true,
  },
  {
    name: 'Life Timeline',
    description:
      'Plan your life on a visual timeline of events, milestones, and dependencies.',
    href: 'https://github.com/Remibousk/Life-timeline',
    published: false,
  },
];

function ProjectItem({ project }: { project: Project }) {
  const destination = project.published ? 'live site' : 'GitHub repository';
  return (
    <li className={project.video ? styles.tile : styles.row}>
      <a
        href={project.href}
        className={project.video ? `${styles.link} ${styles.featured}` : styles.link}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${project.name} — ${project.description} Opens ${destination}.`}
      >
        {project.video ? (
          <span className={styles.videoFrame}>
            <video
              className={styles.video}
              src={project.video.src}
              poster={project.video.poster}
              width={project.video.width}
              height={project.video.height}
              muted
              loop
              playsInline
              preload="none"
              aria-hidden="true"
            />
          </span>
        ) : null}
        <div className={styles.copy}>
          <h3 className={styles.name}>{project.name}</h3>
          <p className={styles.description}>{project.description}</p>
        </div>
      </a>
    </li>
  );
}

export default function SideProjects() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = sectionRef.current;
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

  const featured = PROJECTS.filter((project) => project.video);
  const rest = PROJECTS.filter((project) => !project.video);

  return (
    <section
      id="side-projects"
      ref={sectionRef}
      className={styles.section}
      aria-label="Side Projects"
    >
      <h2 className={styles.heading}>Side Projects</h2>

      <ul className={styles.grid}>
        {featured.map((project) => (
          <ProjectItem key={project.name} project={project} />
        ))}
      </ul>

      <ul className={styles.rows}>
        {rest.map((project) => (
          <ProjectItem key={project.name} project={project} />
        ))}
      </ul>
    </section>
  );
}
