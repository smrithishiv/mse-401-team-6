import { useState } from 'react';
import styles from './RiskMap.module.css';

const RISK_LABELS = { low: 'Low', medium: 'Medium', 'med-high': 'Med-High', high: 'High' };

/**
 * Simplified (non-geographically-precise) polygon map of Waterloo Region.
 * Every region is selectable via click or keyboard (Enter/Space); the
 * selected region is highlighted and drives the rest of the At-risk Groups
 * page (title, risk index, signal cards, etc) — selection is independent
 * from the Geography filter, which narrows which regions render at all.
 *
 * @param {{ regions: Array, legend: Array, selectedId?: string|null, onSelectRegion?: (id: string) => void }} props
 */
export default function RiskMap({ regions, legend, selectedId = null, onSelectRegion }) {
  const [hoveredId, setHoveredId] = useState(null);
  const hovered = regions.find((r) => r.id === hoveredId);

  const handleSelect = (id) => {
    onSelectRegion?.(selectedId === id ? null : id);
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.mapArea}>
        <svg viewBox="0 0 480 420" className={styles.svg} role="img" aria-label="Food insecurity risk map of Waterloo Region">
          {regions.map((region) => {
            const isSelected = selectedId === region.id;
            return (
              <g key={region.id}>
                <polygon
                  points={region.points}
                  className={`${styles.region} ${styles[`risk-${region.riskLevel}`]} ${
                    hoveredId === region.id ? styles.regionHovered : ''
                  } ${isSelected ? styles.regionSelected : ''}`}
                  tabIndex={0}
                  role="button"
                  aria-label={`${region.name}${region.type ? ` ${region.type}` : ''}: ${RISK_LABELS[region.riskLevel]} risk${
                    isSelected ? ', selected' : ''
                  }`}
                  aria-pressed={isSelected}
                  onMouseEnter={() => setHoveredId(region.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onFocus={() => setHoveredId(region.id)}
                  onBlur={() => setHoveredId(null)}
                  onClick={() => handleSelect(region.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelect(region.id);
                    }
                  }}
                />
                <text
                  x={region.labelPos.x}
                  y={region.labelPos.y}
                  className={styles.regionLabel}
                  transform={region.vertical ? `rotate(-90 ${region.labelPos.x} ${region.labelPos.y})` : undefined}
                  pointerEvents="none"
                >
                  {region.name}
                </text>
                {region.type && (
                  <text
                    x={region.labelPos.x}
                    y={region.labelPos.y + 14}
                    className={styles.regionSubLabel}
                    transform={region.vertical ? `rotate(-90 ${region.labelPos.x} ${region.labelPos.y + 14})` : undefined}
                    pointerEvents="none"
                  >
                    {region.type}
                  </text>
                )}
              </g>
            );
          })}
          <text x={452} y={38} className={styles.compassLabel}>
            N
          </text>
          <path d="M452 44 L452 28 M446 34 L452 26 L458 34" className={styles.compassArrow} />
        </svg>

        {hovered && (
          <div className={styles.tooltipCard}>
            <strong>{hovered.name}</strong> {hovered.type}
            <br />
            Risk level: {RISK_LABELS[hovered.riskLevel]}
            {selectedId === hovered.id && <br />}
            {selectedId === hovered.id && 'Selected'}
          </div>
        )}
      </div>

      <div className={styles.legend} aria-label="Risk level legend">
        {legend.map((item) => (
          <div key={item.level} className={styles.legendItem}>
            <span className={`${styles.legendSwatch} ${styles[`risk-${item.level}`]}`} aria-hidden="true" />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
