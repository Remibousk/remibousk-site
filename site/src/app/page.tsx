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
 * Homepage. Intro headline is a full-viewport band (PR 2); sticky nav lives
 * inside `.aboveFooter` so it leaves before Contact (footer containment).
 * LogoRow carries id="work", SideProjects id="side-projects",
 * ExperienceTimeline id="experience".
 */
export default function HomePage() {
  return (
    <>
      {/*
        Sticky nav is contained by this shell — Contact is a sibling below,
        so the sidebar exits before the footer at any viewport / contact height.
      */}
      <div className={styles.aboveFooter}>
        <div className={styles.shell}>
          <SidebarNav />
          <div className={styles.heroBand}>
            <LogoHoverHero />
          </div>
          <main className={styles.column}>
            <LogoRow />
            <CaseCards />
            <SiteMinderTile />
            <IbmSection />
            <SideProjects />
            <ExperienceTimeline />
          </main>
        </div>
      </div>
      <ContactSection />
    </>
  );
}
