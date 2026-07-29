import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { FilterUIProvider } from '../context/FilterUIContext';
import AppHeader from '../components/AppHeader';
import ForecastPage from './ForecastPage';

function renderApp() {
  return render(
    <MemoryRouter>
      <FilterUIProvider>
        <AppHeader />
        <ForecastPage />
      </FilterUIProvider>
    </MemoryRouter>
  );
}

describe('Filter application', () => {
  it('recomputes forecast values after applying a demographic filter', async () => {
    renderApp();
    await screen.findByText('54,200', {}, { timeout: 3000 });

    fireEvent.click(screen.getByRole('button', { name: 'Open filters' }));
    fireEvent.change(screen.getByLabelText('Gender'), { target: { value: 'male' } });
    fireEvent.click(screen.getByRole('button', { name: 'Apply filters' }));

    // Male-only population share (52%) scales the August prediction down from 54,200.
    expect(await screen.findByText('28,184', {}, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.queryByText('54,200')).not.toBeInTheDocument();
  });

  it('reset restores the unfiltered forecast values', async () => {
    renderApp();
    await screen.findByText('54,200', {}, { timeout: 3000 });

    fireEvent.click(screen.getByRole('button', { name: 'Open filters' }));
    fireEvent.change(screen.getByLabelText('Gender'), { target: { value: 'male' } });
    fireEvent.click(screen.getByRole('button', { name: 'Apply filters' }));
    await screen.findByText('28,184', {}, { timeout: 3000 });

    fireEvent.click(screen.getByRole('button', { name: 'Open filters' }));
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));

    expect(await screen.findByText('54,200', {}, { timeout: 3000 })).toBeInTheDocument();
  });

  it('does not show a Geography filter on the Forecast page (unsupported by forecast data)', async () => {
    renderApp();
    await screen.findByText('54,200', {}, { timeout: 3000 });

    fireEvent.click(screen.getByRole('button', { name: 'Open filters' }));
    expect(screen.queryByLabelText('Geography')).not.toBeInTheDocument();
  });
});
