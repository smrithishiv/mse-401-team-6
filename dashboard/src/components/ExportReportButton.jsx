import { useState } from 'react';
import { Download } from 'lucide-react';
import { exportAsJson, exportAsCsv } from '../utils/export';
import styles from './ExportReportButton.module.css';

/**
 * Downloads whatever data object is currently displayed on the page as
 * JSON or CSV. Intended to stand in for a future server-generated report.
 * @param {{ data: object, filename?: string }} props
 */
export default function ExportReportButton({ data, filename = 'breaking-bread-report' }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.button}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={!data}
      >
        <Download size={16} aria-hidden="true" />
        Export report
      </button>
      {open && (
        <div className={styles.menu} role="menu">
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              exportAsJson(data, `${filename}.json`);
              setOpen(false);
            }}
          >
            Download JSON
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              exportAsCsv(data, `${filename}.csv`);
              setOpen(false);
            }}
          >
            Download CSV
          </button>
        </div>
      )}
    </div>
  );
}
