import { NavLink } from 'react-router-dom';
import { ChevronDown, Filter, Wheat } from 'lucide-react';
import { useState } from 'react';
import { useFilterUI } from '../context/FilterUIContext';
import styles from './AppHeader.module.css';

const NAV_LINKS = [
  { to: '/overview', label: 'Overview' },
  { to: '/forecast', label: 'Forecast' },
  { to: '/at-risk-groups', label: 'At-risk Groups' },
];

export default function AppHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pageFilterUI } = useFilterUI();

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.logoMark} aria-hidden="true">
            <Wheat size={18} />
          </span>
          <span className={styles.brandName}>
            Breaking
            <br />
            Bread
          </span>
        </div>

        <nav className={styles.nav} aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.actions}>
          <div className={styles.menuWrap}>
            <button
              type="button"
              className={styles.iconButton}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="More options"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <ChevronDown size={18} />
            </button>
            {menuOpen && (
              <div className={styles.dropdown} role="menu">
                <a role="menuitem" href="#help">
                  Help &amp; documentation
                </a>
                <a role="menuitem" href="#settings">
                  Settings
                </a>
                <a role="menuitem" href="#support">
                  Contact support
                </a>
              </div>
            )}
          </div>
          {pageFilterUI.hasFilters && (
            <button
              type="button"
              className={styles.filterButton}
              aria-label="Open filters"
              onClick={pageFilterUI.openDrawer}
            >
              <Filter size={18} />
              {pageFilterUI.activeCount > 0 && (
                <span className={styles.filterBadge}>{pageFilterUI.activeCount}</span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
