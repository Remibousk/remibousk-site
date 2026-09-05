import Hero from '@/components/Hero/Hero';
import LogoRow from '@/components/LogoRow/LogoRow';
import CaseCards from '@/components/CaseCards/CaseCards';
import SiteMinderTile from '@/components/SiteMinderTile/SiteMinderTile';
import IbmSection from '@/components/IbmSection/IbmSection';
import ExperienceTimeline from '@/components/ExperienceTimeline/ExperienceTimeline';
import SideProjects from '@/components/SideProjects/SideProjects';
import ContactSection from '@/components/ContactSection/ContactSection';
import SidebarNav from '@/components/SidebarNav/SidebarNav';
import styles from './page.module.css';

/**
 * Homepage — mirrors the original's structure exactly
 * (reference/mirror/home.html):
 *
 *   .framer-1lxwdiy "Content"  -> .content  (row, centered, items at top)
 *     .framer-4cct6m-container -> SidebarNav (sticky flex item, ~164px)
 *     .framer-1uexi1g "Section"-> <main .column> (flex 1, max-width 1200px,
 *                                  gap 200px / 120px mobile, padding 4/16px)
 *   .framer-1ug5js3 (footer)   -> ContactSection (full-bleed, outside the row)
 *
 * Section order: work, cases, experience, side projects. LogoRow carries
 * id="work", ExperienceTimeline carries id="experience", SideProjects
 * carries id="side-projects".
 */
export default function HomePage() {
  return (
    <>
      <div className={styles.content}>
        <SidebarNav />
        <main className={styles.column}>
          <Hero />
          <LogoRow />
          <CaseCards />
          <SiteMinderTile />
          <IbmSection />
          <ExperienceTimeline />
          <SideProjects />
        </main>
      </div>
      <ContactSection />
    </>
  );
}
