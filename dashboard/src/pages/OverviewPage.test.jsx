import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { FilterUIProvider } from '../context/FilterUIContext';
import AppHeader from '../components/AppHeader';
import OverviewPage from './OverviewPage';

function renderApp() {
  return render(
    <MemoryRouter>
      <FilterUIProvider>
        <AppHeader />
        <OverviewPage />
      </FilterUIProvider>
    </MemoryRouter>
  );
}

describe('OverviewPage', () => {
  it('does not show the full filter drawer trigger — Overview stays a compact summary', async () => {
    renderApp();
    await screen.findByText('54,200 people', {}, { timeout: 3000 });

    expect(screen.queryByRole('button', { name: 'Open filters' })).not.toBeInTheDocument();
  });

  it('offers a compact reporting-period selector that swaps in the actual July snapshot', async () => {
    renderApp();
    await screen.findByText('54,200 people', {}, { timeout: 3000 });

    fireEvent.change(screen.getByLabelText('Reporting period'), { target: { value: 'jul-2026' } });

    expect(await screen.findByText('51,840 people', {}, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.getByText('Actual')).toBeInTheDocument();
  });

  it('filters the agencies table by the compact agency selector', async () => {
    renderApp();
    const table = await screen.findByRole('table', {}, { timeout: 3000 });
    await within(table).findByText('KW YMCA', {}, { timeout: 3000 });
    expect(within(table).getByText('Cambridge Food Bank')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Agency'), { target: { value: 'kw-ymca' } });

    await within(table).findByText('KW YMCA', {}, { timeout: 3000 });
    expect(within(table).queryByText('Cambridge Food Bank')).not.toBeInTheDocument();
  });
});
