import { useEffect, useState } from 'react';
import PageContainer from '../components/PageContainer';
import NoticeBanner from '../components/NoticeBanner';
import ScenarioBadge from '../components/ScenarioBadge';
import ScenarioAssumptionForm from '../components/ScenarioAssumptionForm';
import ScenarioComparisonChart from '../components/ScenarioComparisonChart';
import ScenarioDifferenceSummary from '../components/ScenarioDifferenceSummary';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import ExportReportButton from '../components/ExportReportButton';
import InfoTooltip from '../components/InfoTooltip';
import { useAsync } from '../hooks/useAsync';
import { getScenarioInputs, runScenario } from '../services/scenarioService';
import styles from './ScenarioAnalysisPage.module.css';

function defaultAssumptionValues(assumptions) {
  return Object.fromEntries(assumptions.map((field) => [field.id, field.defaultValue]));
}

export default function ScenarioAnalysisPage() {
  const { data: inputs, loading: inputsLoading, error: inputsError, retry: retryInputs } = useAsync(
    () => getScenarioInputs(),
    []
  );

  const [scenarioName, setScenarioName] = useState('');
  const [baselineId, setBaselineId] = useState('');
  const [horizonYears, setHorizonYears] = useState(null);
  const [assumptionValues, setAssumptionValues] = useState({});
  const [runState, setRunState] = useState('idle');
  const [result, setResult] = useState(null);
  const [runError, setRunError] = useState(null);

  useEffect(() => {
    if (!inputs) return;
    setBaselineId((current) => current || inputs.baselineOptions[0]?.id || '');
    setHorizonYears((current) => current ?? inputs.horizonOptions[Math.floor(inputs.horizonOptions.length / 2)]);
    setAssumptionValues((current) =>
      Object.keys(current).length ? current : defaultAssumptionValues(inputs.assumptions)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputs]);

  const handleChangeAssumption = (id, value) => {
    setAssumptionValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleReset = () => {
    if (!inputs) return;
    setAssumptionValues(defaultAssumptionValues(inputs.assumptions));
  };

  const handleRun = async () => {
    setRunState('loading');
    setRunError(null);
    try {
      const scenarioResult = await runScenario({
        name: scenarioName || 'Untitled scenario',
        baselineId,
        horizonYears,
        assumptions: assumptionValues,
      });
      setResult(scenarioResult);
      setRunState('success');
    } catch (err) {
      setRunError(err instanceof Error ? err.message : 'Something went wrong running this scenario.');
      setRunState('error');
    }
  };

  return (
    <PageContainer
      title="Scenario Analysis"
      actions={result && <ExportReportButton data={result} filename={`scenario-${result.scenarioId}-report`} />}
    >
      <div className={styles.headerRow}>
        <ScenarioBadge />
        <InfoTooltip
          label="What is Scenario Analysis?"
          content="A sandbox for exploring how changing assumptions may affect future demand. Results here are hypothetical and separate from the official Strategic forecast."
        />
      </div>

      <NoticeBanner
        tone="info"
        text="Use this page to explore how changing assumptions (like newcomer growth or food inflation) may affect projected demand. Nothing here changes the official baseline forecast."
      />

      {inputsError && <ErrorState message={inputsError} onRetry={retryInputs} />}
      {!inputsError && inputsLoading && <LoadingSkeleton variant="cards" count={3} />}

      {!inputsError && !inputsLoading && inputs && (
        <>
          <ScenarioAssumptionForm
            inputs={inputs}
            name={scenarioName}
            onNameChange={setScenarioName}
            baselineId={baselineId}
            onBaselineChange={setBaselineId}
            horizonYears={horizonYears}
            onHorizonChange={setHorizonYears}
            assumptionValues={assumptionValues}
            onChangeAssumption={handleChangeAssumption}
            onRun={handleRun}
            onReset={handleReset}
            runDisabled={runState === 'loading'}
          />

          {runState === 'loading' && <LoadingSkeleton variant="chart" height={320} />}
          {runState === 'error' && <ErrorState message={runError} onRetry={handleRun} />}

          {runState === 'success' && result && (
            <>
              <section className={`card ${styles.chartCard}`}>
                <div className={styles.chartHeader}>
                  <h2 className={styles.chartTitle}>Baseline vs. scenario forecast</h2>
                  <ScenarioBadge />
                </div>
                <ScenarioComparisonChart
                  baselineForecast={result.baselineForecast}
                  scenarioForecast={result.scenarioForecast}
                />
              </section>

              <ScenarioDifferenceSummary result={result} />

              <div className={styles.saveRow}>
                <button type="button" className={styles.saveButton} disabled>
                  Save scenario
                </button>
                <InfoTooltip label="About saving scenarios" content="Saving scenarios isn't available yet." />
              </div>
            </>
          )}
        </>
      )}
    </PageContainer>
  );
}
