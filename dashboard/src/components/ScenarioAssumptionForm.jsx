import InfoTooltip from './InfoTooltip';
import HorizonSelector from './HorizonSelector';
import styles from './ScenarioAssumptionForm.module.css';

/**
 * Business-language scenario controls: name, baseline, horizon, and one
 * range input per assumption. Field changes only update local draft state
 * via `onChangeAssumption` — running the scenario happens exclusively when
 * the user clicks "Run scenario", never on a field's onChange, so a slider
 * drag never fires a request.
 *
 * @param {{
 *   inputs: import('../utils/types').ScenarioInputsResponse,
 *   name: string, onNameChange: (v: string) => void,
 *   baselineId: string, onBaselineChange: (v: string) => void,
 *   horizonYears: number, onHorizonChange: (v: number) => void,
 *   assumptionValues: Record<string, number>, onChangeAssumption: (id: string, v: number) => void,
 *   onRun: () => void, onReset: () => void, runDisabled?: boolean,
 * }} props
 */
export default function ScenarioAssumptionForm({
  inputs,
  name,
  onNameChange,
  baselineId,
  onBaselineChange,
  horizonYears,
  onHorizonChange,
  assumptionValues,
  onChangeAssumption,
  onRun,
  onReset,
  runDisabled = false,
}) {
  return (
    <section className={`card ${styles.form}`}>
      <div className={styles.field}>
        <label htmlFor="scenario-name">Scenario name</label>
        <input
          id="scenario-name"
          type="text"
          value={name}
          placeholder="e.g. Higher newcomer growth"
          onChange={(e) => onNameChange(e.target.value)}
        />
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="scenario-baseline">Baseline</label>
          <select id="scenario-baseline" value={baselineId} onChange={(e) => onBaselineChange(e.target.value)}>
            {inputs.baselineOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>Forecast horizon</span>
          <HorizonSelector options={inputs.horizonOptions} value={horizonYears} onChange={onHorizonChange} />
        </div>
      </div>

      <h3 className={styles.assumptionsTitle}>Assumptions</h3>
      <div className={styles.assumptionsGrid}>
        {inputs.assumptions.map((field) => (
          <div className={styles.field} key={field.id}>
            <span className={styles.label}>
              {field.label}
              <InfoTooltip label={`What does "${field.label}" change?`} content={field.description} />
            </span>
            <div className={styles.rangeRow}>
              <input
                type="range"
                id={`scenario-assumption-${field.id}`}
                min={field.min}
                max={field.max}
                step={field.step}
                value={assumptionValues[field.id] ?? field.defaultValue}
                onChange={(e) => onChangeAssumption(field.id, Number(e.target.value))}
                aria-label={field.label}
              />
              <span className={styles.rangeValue}>
                {assumptionValues[field.id] ?? field.defaultValue}
                {field.unit}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.resetButton} onClick={onReset}>
          Reset
        </button>
        <button type="button" className={styles.runButton} onClick={onRun} disabled={runDisabled}>
          Run scenario
        </button>
      </div>
    </section>
  );
}
