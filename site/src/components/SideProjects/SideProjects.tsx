import styles from './SideProjects.module.css';

interface Project {
  name: string;
  description: string;
  href: string;
  published: boolean;
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
    href: 'https://remibousk.com',
    published: true,
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

export default function SideProjects() {
  return (
    <section
      id="side-projects"
      className={styles.section}
      aria-label="Side Projects"
    >
      <h2 className={styles.heading}>Side Projects</h2>

      <ul className={styles.rows}>
        {PROJECTS.map((project) => {
          const destination = project.published ? 'live site' : 'GitHub repository';
          return (
            <li key={project.name} className={styles.row}>
              <a
                href={project.href}
                className={styles.link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${project.name} — ${project.description} Opens ${destination}.`}
              >
                <div className={styles.copy}>
                  <h3 className={styles.name}>{project.name}</h3>
                  <p className={styles.description}>{project.description}</p>
                </div>
                <span className={styles.meta}>
                  {project.published ? 'Live' : 'GitHub'}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
