import { useMemo, useState } from 'react';
import SegmentedToggle from './SegmentedToggle';
import StatusBadge from './StatusBadge';
import DemandDriversChart from './DemandDriversChart';
import ShiftsPanel from './ShiftsPanel';
import StackedBreakdownBar from './StackedBreakdownBar';
import { getDemandDataTypeInfo } from '../utils/demandDataType';
import styles from './DemandDriversPanel.module.css';

const DIMENSION_OPTIONS = [
  { value: 'ageGroup', label: 'Age Group' },
  { value: 'income', label: 'Income' },
  { value: 'gender', label: 'Gender' },
];

const DISPLAY_MODE_OPTIONS = [
  { value: 'percentage', label: '% of total demand' },
  { value: 'population', label: 'Forecasted people' },
];

/**
 * Interactive replacement for the old static demand-breakdown bars: shows
 * how each demographic dimension's mix is expected to change over the
 * 5-year forecast window, not just a single snapshot.
 *
 * @param {{ data: import('../utils/types').DemandDriversResponse }} props
 */
export default function DemandDriversPanel({ data }) {
  const [activeDimensionId, setActiveDimensionId] = useState('ageGroup');
  const [displayMode, setDisplayMode] = useState('percentage');
  const [hiddenByDimension, setHiddenByDimension] = useState({});

  const dimension = data.dimensions[activeDimensionId];
  const hiddenSeries = hiddenByDimension[activeDimensionId] ?? new Set();
  const dataTypeInfo = getDemandDataTypeInfo(dimension.dataType);
  const finalYear = data.years[data.years.length - 1];

  const toggleSeries = (segmentId) => {
    setHiddenByDimension((prev) => {
      const current = new Set(prev[activeDimensionId] ?? []);
      if (current.has(segmentId)) {
        current.delete(segmentId);
      } else {
        current.add(segmentId);
      }
      return { ...prev, [activeDimensionId]: current };
    });
  };

  const composition = useMemo(
    () =>
      dimension.segments.map((seg) => ({
        label: seg.label,
        pct: seg.points.find((p) => p.year === finalYear)?.pct ?? 0,
        color: seg.color,
      })),
    [dimension, finalYear]
  );

  return (
    <section className={`card ${styles.panel}`}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2 className={styles.title}>Demand drivers — 5-year outlook</h2>
          <div className={styles.dataTypeRow}>
            <StatusBadge status={dataTypeInfo.label} tone={dataTypeInfo.tone} />
            <span className={styles.dataTypeDescription}>{dataTypeInfo.description}</span>
          </div>
        </div>
        <div className={styles.controls}>
          <SegmentedToggle
            options={DIMENSION_OPTIONS}
            value={activeDimensionId}
            onChange={setActiveDimensionId}
            ariaLabel="Demographic dimension"
          />
          <SegmentedToggle
            options={DISPLAY_MODE_OPTIONS}
            value={displayMode}
            onChange={setDisplayMode}
            ariaLabel="Display mode"
          />
        </div>
      </div>

      <div className={styles.body}>
        <DemandDriversChart
          dimension={dimension}
          displayMode={displayMode}
          hiddenSeries={hiddenSeries}
          onToggleSeries={toggleSeries}
        />
        <ShiftsPanel dimension={dimension} displayMode={displayMode} />
      </div>

      <div className={styles.composition}>
        <h3 className={styles.compositionTitle}>{finalYear} forecast composition</h3>
        <StackedBreakdownBar
          label={DIMENSION_OPTIONS.find((o) => o.value === activeDimensionId).label}
          segments={composition}
        />
      </div>
    </section>
  );
}
