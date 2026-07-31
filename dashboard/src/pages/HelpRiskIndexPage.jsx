import { Link } from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import DocumentationSection from '../components/DocumentationSection';
import NoticeBanner from '../components/NoticeBanner';
import { RISK_INDEX_SECTIONS, RISK_INDEX_NOTICE } from '../data/helpRiskIndexContent';
import styles from './HelpProjectionsPage.module.css';

export default function HelpRiskIndexPage() {
  return (
    <PageContainer title="How the Risk Index Works">
      <p className={styles.backLink}>
        <Link to="/help">← Back to Help &amp; documentation</Link>
      </p>

      <NoticeBanner tone="info" text={RISK_INDEX_NOTICE} />

      <div className={styles.layout}>
        <nav className={styles.toc} aria-label="Table of contents">
          <p className={styles.tocTitle}>On this page</p>
          <ul>
            {RISK_INDEX_SECTIONS.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`}>{section.title}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={`card ${styles.content}`}>
          {RISK_INDEX_SECTIONS.map((section) => (
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
