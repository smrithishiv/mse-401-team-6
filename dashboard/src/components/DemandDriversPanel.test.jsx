import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DemandDriversPanel from './DemandDriversPanel';
import { strategicForecastByHorizon } from '../data/mockForecastData';

function renderPanel() {
  return render(<DemandDriversPanel data={strategicForecastByHorizon.horizons[5].demandDrivers} />);
}

describe('DemandDriversPanel', () => {
  it('defaults to the Age Group tab, labelled as a model forecast (not a planning assumption)', () => {
    renderPanel();

    expect(screen.getByText('Model forecast')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /65\+/ })).toBeInTheDocument();
    expect(screen.getByText('2031 forecast composition')).toBeInTheDocument();
  });

  it('switching to the Income tab shows the planning-scenario label, not a model-forecast label', () => {
    renderPanel();

    fireEvent.click(screen.getByRole('radio', { name: 'Income' }));

    expect(screen.getByText('Planning scenario')).toBeInTheDocument();
    expect(screen.queryByText('Model forecast')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '$60k+' })).toBeInTheDocument();
  });

  it('switching to the Gender tab shows current-proportions data held flat, with no projected shift', () => {
    renderPanel();

    fireEvent.click(screen.getByRole('radio', { name: 'Gender' }));

    expect(screen.getByText('Current proportions (held constant)')).toBeInTheDocument();
    // All three gender segments are flat (2026 == 2031), so every shift row reads 0pp.
    expect(screen.getAllByText('0pp')).toHaveLength(3);
  });

  it('the display-mode toggle switches shift values from percentage points to population counts', () => {
    renderPanel();

    expect(screen.getByText('34% → 29%')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('radio', { name: 'Forecasted people' }));

    expect(screen.getByText('159,120 → 179,220')).toBeInTheDocument();
    expect(screen.queryByText('34% → 29%')).not.toBeInTheDocument();
  });

  it('legend buttons toggle series visibility and report state via aria-pressed', () => {
    renderPanel();

    const legendButton = screen.getByRole('button', { name: /65\+/ });
    expect(legendButton).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(legendButton);
    expect(legendButton).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(legendButton);
    expect(legendButton).toHaveAttribute('aria-pressed', 'true');
  });
});
