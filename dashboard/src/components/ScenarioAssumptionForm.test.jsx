import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ScenarioAssumptionForm from './ScenarioAssumptionForm';

const inputs = {
  baselineOptions: [{ id: 'strategic-baseline-2026-q2', label: 'Strategic forecast — official baseline' }],
  horizonOptions: [2, 3, 5, 10],
  assumptions: [
    {
      id: 'newcomerGrowthAdjustmentPercent',
      label: 'Newcomer / immigrant growth',
      unit: '%',
      min: -20,
      max: 50,
      step: 5,
      defaultValue: 0,
      description: 'Increase or decrease the assumed rate of newcomer arrivals.',
    },
  ],
};

function renderForm(props = {}) {
  const onRun = vi.fn();
  const onChangeAssumption = vi.fn();
  render(
    <ScenarioAssumptionForm
      inputs={inputs}
      name="My scenario"
      onNameChange={() => {}}
      baselineId="strategic-baseline-2026-q2"
      onBaselineChange={() => {}}
      horizonYears={5}
      onHorizonChange={() => {}}
      assumptionValues={{ newcomerGrowthAdjustmentPercent: 0 }}
      onChangeAssumption={onChangeAssumption}
      onRun={onRun}
      onReset={() => {}}
      {...props}
    />
  );
  return { onRun, onChangeAssumption };
}

describe('ScenarioAssumptionForm', () => {
  it('does not run the scenario when an assumption field changes', () => {
    const { onRun, onChangeAssumption } = renderForm();

    fireEvent.change(screen.getByLabelText('Newcomer / immigrant growth'), { target: { value: '15' } });

    expect(onChangeAssumption).toHaveBeenCalledWith('newcomerGrowthAdjustmentPercent', 15);
    expect(onRun).not.toHaveBeenCalled();
  });

  it('runs the scenario only when the Run scenario button is clicked', () => {
    const { onRun } = renderForm();

    fireEvent.click(screen.getByRole('button', { name: 'Run scenario' }));

    expect(onRun).toHaveBeenCalledTimes(1);
  });

  it('disables the Run scenario button while a run is in progress', () => {
    renderForm({ runDisabled: true });
    expect(screen.getByRole('button', { name: 'Run scenario' })).toBeDisabled();
  });
});
