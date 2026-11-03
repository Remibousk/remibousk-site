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
 * Homepage. First screen is the logo-hover hero (PR 2). Remaining sections
 * keep the prior structure: work, cases, side projects, experience.
 * LogoRow carries id="work", SideProjects id="side-projects",
 * ExperienceTimeline id="experience".
 */
export default function HomePage() {
  return (
    <>
      <div className={styles.content}>
        <SidebarNav />
        <main className={styles.column}>
          <LogoHoverHero />
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
