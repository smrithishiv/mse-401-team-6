import { Link } from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import DocumentationSection from '../components/DocumentationSection';
import { HELP_SECTIONS } from '../data/helpContent';
import styles from './HelpPage.module.css';

export default function HelpPage() {
  return (
    <PageContainer title="How to read this dashboard">
      <p className={styles.projectionsLink}>
        <Link to="/help/projections">How Projections Work →</Link>
      </p>
      <p className={styles.projectionsLink}>
        <Link to="/help/risk-index">How the Risk Index Works →</Link>
      </p>
      <div className={styles.layout}>
        <nav className={styles.toc} aria-label="Table of contents">
          <p className={styles.tocTitle}>On this page</p>
          <ul>
            {HELP_SECTIONS.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`}>{section.title}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={`card ${styles.content}`}>
          {HELP_SECTIONS.map((section) => (
            <DocumentationSection key={section.id} id={section.id} title={section.title}>
              {section.paragraphs?.map((p) => <p key={p}>{p}</p>)}
              {section.faqs?.map((faq) => (
                <div key={faq.q} className={styles.faq}>
                  <p className={styles.faqQuestion}>{faq.q}</p>
                  <p>{faq.a}</p>
                </div>
              ))}
            </DocumentationSection>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
