import { useId, useState } from 'react';
import { Info } from 'lucide-react';
import styles from './InfoTooltip.module.css';

/**
 * Accessible, reusable tooltip trigger for explaining dashboard terms
 * (confidence, trends, statuses, etc). Opens on hover AND keyboard focus,
 * stays visible while hovered/focused (no auto-hide timer), and is
 * dismissible via Escape. Content is exposed to assistive tech through
 * `aria-describedby` + `role="tooltip"`, not colour alone.
 *
 * @param {{ label?: string, content: import('react').ReactNode, placement?: 'top' | 'bottom', wide?: boolean }} props
 */
export default function InfoTooltip({ label = 'More information', content, placement = 'top', wide = false }) {
  const [open, setOpen] = useState(false);
  const tooltipId = useId();

  const show = () => setOpen(true);
  const hide = () => setOpen(false);

  return (
    <span className={styles.wrap}>
      <button
        type="button"
        className={styles.trigger}
        aria-describedby={open ? tooltipId : undefined}
        aria-label={label}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        onKeyDown={(e) => {
          if (e.key === 'Escape') hide();
        }}
      >
        <Info size={13} aria-hidden="true" />
      </button>
      {open && (
        <span role="tooltip" id={tooltipId} className={`${styles.tooltip} ${styles[placement]} ${wide ? styles.wide : ''}`}>
          {content}
        </span>
      )}
    </span>
  );
}
