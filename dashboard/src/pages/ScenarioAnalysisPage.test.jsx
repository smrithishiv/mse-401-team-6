import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ScenarioAnalysisPage from './ScenarioAnalysisPage';

function renderPage() {
  return render(
    <MemoryRouter>
      <ScenarioAnalysisPage />
    </MemoryRouter>
  );
}

describe('ScenarioAnalysisPage', () => {
  it('labels the page as a planning scenario, not the official forecast, before any run', async () => {
    renderPage();
    await screen.findByLabelText('Newcomer / immigrant growth', {}, { timeout: 3000 });
    expect(screen.getAllByText('Planning scenario — not the official forecast').length).toBeGreaterThan(0);
  });

  it('runs a scenario after clicking "Run scenario" and shows labelled results', async () => {
    renderPage();
    const growthInput = await screen.findByLabelText('Newcomer / immigrant growth', {}, { timeout: 3000 });

    fireEvent.change(growthInput, { target: { value: '25' } });
    fireEvent.click(screen.getByRole('button', { name: 'Run scenario' }));

    expect(
      await screen.findByText('Baseline vs. scenario comparison', {}, { timeout: 3000 })
    ).toBeInTheDocument();
    expect(screen.getByText(/projected demand in \d{4} is/)).toBeInTheDocument();
    expect(screen.getAllByText('Planning scenario — not the official forecast').length).toBeGreaterThan(1);
  });

  it('resetting restores assumption controls to their baseline (default) values', async () => {
    renderPage();
    const growthInput = await screen.findByLabelText('Newcomer / immigrant growth', {}, { timeout: 3000 });

    fireEvent.change(growthInput, { target: { value: '25' } });
    expect(growthInput.value).toBe('25');

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(growthInput.value).toBe('0');
  });
});
