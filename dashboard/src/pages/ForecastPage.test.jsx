import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { FilterUIProvider } from '../context/FilterUIContext';
import ForecastPage from './ForecastPage';

function renderForecastPage() {
  return render(
    <MemoryRouter>
      <FilterUIProvider>
        <ForecastPage />
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
    expect(screen.getByText(/Proceed with current allocation/)).toBeInTheDocument();
    expect(screen.getByText(/Confirm allocation manually/)).toBeInTheDocument();
  });

  it('switches to the strategic forecast view when the mode toggle is used', async () => {
    renderForecastPage();
    await screen.findByText('54,200', {}, { timeout: 3000 });

    fireEvent.click(screen.getByRole('radio', { name: 'Strategic' }));

    expect(await screen.findByText('2.75 M', {}, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.getByText('5-Year Forecast')).toBeInTheDocument();
  });
});
