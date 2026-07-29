import Sparkline from './Sparkline';
import InfoTooltip from './InfoTooltip';
import styles from './FourWeekTrend.module.css';

const TONE_BY_TREND = { rising: 'red', falling: 'blue', stable: 'blue' };
const TREND_LABEL = { rising: 'Rising', falling: 'Falling', stable: 'Stable' };

/** @param {{ values: number[], trend?: 'rising' | 'falling' | 'stable', withTooltip?: boolean }} props */
export default function FourWeekTrend({ values, trend, withTooltip = true }) {
  return (
    <span className={styles.wrap}>
      <Sparkline values={values} tone={TONE_BY_TREND[trend] || 'blue'} />
      {trend && <span className={styles.label}>{TREND_LABEL[trend]}</span>}
      {withTooltip && (
        <InfoTooltip
          label="What does four-week trend mean?"
          content="Shows the agency's recorded hamper demand over the previous four reporting weeks. Rising bars indicate increasing demand."
        />
      )}
    </span>
  );
}
