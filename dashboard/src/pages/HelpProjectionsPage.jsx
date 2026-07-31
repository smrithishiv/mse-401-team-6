import { Link } from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import DocumentationSection from '../components/DocumentationSection';
import NoticeBanner from '../components/NoticeBanner';
import { PROJECTIONS_SECTIONS, PROJECTIONS_NOTICE } from '../data/helpProjectionsContent';
import styles from './HelpProjectionsPage.module.css';

export default function HelpProjectionsPage() {
  return (
    <PageContainer title="How Projections Work">
      <p className={styles.backLink}>
        <Link to="/help">← Back to Help &amp; documentation</Link>
      </p>

      <NoticeBanner tone="info" text={PROJECTIONS_NOTICE} />

      <div className={styles.layout}>
        <nav className={styles.toc} aria-label="Table of contents">
          <p className={styles.tocTitle}>On this page</p>
          <ul>
            {PROJECTIONS_SECTIONS.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`}>{section.title}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={`card ${styles.content}`}>
          {PROJECTIONS_SECTIONS.map((section) => (
            <DocumentationSection key={section.id} id={section.id} title={section.title}>
              {section.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </DocumentationSection>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
