/**
 * Clickable/keyboard-selectable card wrapper. Deliberately a `role="button"`
 * div rather than a real `<button>`: MonthCard/WeekCard nest genuine
 * interactive controls (InfoTooltip triggers inside their status/confidence
 * badges), and a `<button>` cannot legally contain another `<button>` — the
 * browser would silently break the DOM. `role="button"` + Enter/Space
 * handling keeps the card itself keyboard-activatable while nested
 * tooltips remain reachable and valid.
 *
 * @param {{ selected: boolean, onSelect: () => void, className: string, children: import('react').ReactNode }} props
 */
export default function SelectableCard({ selected, onSelect, className, children }) {
  return (
    <div
      role="button"
      tabIndex={0}
      className={className}
      aria-pressed={selected}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      {children}
    </div>
  );
}
