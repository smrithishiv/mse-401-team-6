import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { FilterUIProvider } from '../context/FilterUIContext';
import ForecastPage from './ForecastPage';
import HelpProjectionsPage from './HelpProjectionsPage';

function renderForecastPage() {
  return render(
    <MemoryRouter>
      <FilterUIProvider>
        <ForecastPage />
      </FilterUIProvider>
    </MemoryRouter>
  );
}

function renderForecastPageWithRouting() {
  return render(
    <MemoryRouter initialEntries={['/forecast']}>
      <FilterUIProvider>
        <Routes>
          <Route path="/forecast" element={<ForecastPage />} />
          <Route path="/help/projections" element={<HelpProjectionsPage />} />
        </Routes>
      </FilterUIProvider>
    </MemoryRouter>
  );
}

describe('ForecastPage', () => {
  it('shows loading skeletons before the service data resolves', () => {
    renderForecastPage();
    expect(screen.getAllByRole('status').length).toBeGreaterThan(0);
  });

  it('renders operational forecast values sourced from the service layer', async () => {
    renderForecastPage();

    expect(await screen.findByText('54,200', {}, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.getByText('Allocation on track')).toBeInTheDocument();
    expect(screen.getByText('Manual confirmation recommended')).toBeInTheDocument();
  });

  it('switches to the strategic forecast view when the mode toggle is used', async () => {
    renderForecastPage();
    await screen.findByText('54,200', {}, { timeout: 3000 });

    fireEvent.click(screen.getByRole('radio', { name: 'Strategic' }));

    expect(await screen.findByText('2.75 M', {}, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.getByText('5-Year Forecast')).toBeInTheDocument();
  });

  it('updates the demand-driver explanation panel when a different month is selected', async () => {
    renderForecastPage();
    await screen.findByText('54,200', {}, { timeout: 3000 });

    expect(await screen.findByText(/Who.s driving the August 2026 number/, {}, { timeout: 3000 })).toBeInTheDocument();

    const septCard = screen.getByText(/Sept 2026/).closest('[role="button"]');
    fireEvent.click(septCard);

    expect(
      await screen.findByText(/Who.s driving the September 2026 number/, {}, { timeout: 3000 })
    ).toBeInTheDocument();
  });

  it('switches to the weekly view when the granularity toggle is used', async () => {
    renderForecastPage();
    await screen.findByText('54,200', {}, { timeout: 3000 });

    fireEvent.click(screen.getByRole('radio', { name: 'Weekly' }));

    expect(await screen.findByText('Weekly forecast detail', {}, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.queryByText('Demand forecast — July to September 2026')).not.toBeInTheDocument();
  });

  it('selecting a week highlights it and updates the table and recommended action', async () => {
    renderForecastPage();
    await screen.findByText('54,200', {}, { timeout: 3000 });
    fireEvent.click(screen.getByRole('radio', { name: 'Weekly' }));
    await screen.findByText('Weekly forecast detail', {}, { timeout: 3000 });

    expect(screen.getByText('Recommended allocation action — Jul 28 – Aug 3')).toBeInTheDocument();

    const weekCardLabel = screen.getAllByText(/Aug 4 – 10/)[0];
    fireEvent.click(weekCardLabel.closest('[role="button"]'));

    expect(
      await screen.findByText('Recommended allocation action — Aug 4 – 10', {}, { timeout: 3000 })
    ).toBeInTheDocument();

    const rows = screen.getAllByRole('row');
    const selectedRow = rows.find((r) => r.getAttribute('aria-selected') === 'true');
    expect(selectedRow).toHaveTextContent('Aug 4 – 10');
  });

  it('changing the strategic horizon reloads the correct data and shows the long-range notice beyond five years', async () => {
    renderForecastPage();
    await screen.findByText('54,200', {}, { timeout: 3000 });

    fireEvent.click(screen.getByRole('radio', { name: 'Strategic' }));
    await screen.findByText('2.75 M', {}, { timeout: 3000 });
    expect(
      screen.queryByText(
        'Uncertainty increases substantially beyond five years. Use this view for strategic and scenario planning rather than operational allocation decisions.'
      )
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('radio', { name: '10y' }));

    expect(await screen.findByText('10-Year Forecast', {}, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.queryByText('2.75 M')).not.toBeInTheDocument();
    expect(
      screen.getByText(
        'Uncertainty increases substantially beyond five years. Use this view for strategic and scenario planning rather than operational allocation decisions.'
      )
    ).toBeInTheDocument();
  });

  it('navigates to the projections documentation page via the "Learn how projections work" link', async () => {
    renderForecastPageWithRouting();
    await screen.findByText('54,200', {}, { timeout: 3000 });

    fireEvent.click(screen.getByText('Learn how projections work'));

    expect(
      await screen.findByRole('heading', { name: 'How Projections Work', level: 1 })
    ).toBeInTheDocument();
  });
});
