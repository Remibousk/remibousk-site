import LogoHoverHero from '@/components/LogoHoverHero/LogoHoverHero';
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
 * Homepage. Intro headline is a full-viewport band (PR 2); nav overlays it.
 * Remaining sections keep the prior structure: work, cases, side projects,
 * experience. LogoRow carries id="work", SideProjects id="side-projects",
 * ExperienceTimeline id="experience".
 */
export default function HomePage() {
  return (
    <>
      <SidebarNav />
      <LogoHoverHero />
      <div className={styles.content}>
        {/* Matches the fixed nav rail width so work sections keep their offset. */}
        <div className={styles.navRail} aria-hidden="true" />
        <main className={styles.column}>
          <LogoRow />
          <CaseCards />
          <SiteMinderTile />
          <IbmSection />
          <SideProjects />
          <ExperienceTimeline />
        </main>
      </div>
      <ContactSection />
    </>
  );
}
