import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { FilterUIProvider } from '../context/FilterUIContext';
import AppHeader from '../components/AppHeader';
import AtRiskGroupsPage from './AtRiskGroupsPage';

function renderApp() {
  return render(
    <MemoryRouter>
      <FilterUIProvider>
        <AppHeader />
        <AtRiskGroupsPage />
      </FilterUIProvider>
    </MemoryRouter>
  );
}

describe('At-risk Groups filters', () => {
  it('exposes Geography, Population Group, Risk Level and Socioeconomic Indicator controls', async () => {
    renderApp();
    await screen.findByText('Food Insecurity Risk – Waterloo Region', {}, { timeout: 3000 });

    fireEvent.click(screen.getByRole('button', { name: 'Open filters' }));

    expect(screen.getByLabelText('Reporting Period')).toBeInTheDocument();
    expect(screen.getByLabelText('Geography')).toBeInTheDocument();
    expect(screen.getByLabelText('Population Group')).toBeInTheDocument();
    expect(screen.getByLabelText('Risk Level')).toBeInTheDocument();
    expect(screen.getByLabelText('Socioeconomic Indicator')).toBeInTheDocument();
  });

  it('narrows the risk map to a single region when a Geography filter is applied', async () => {
    renderApp();
    await screen.findByText('N. Kitchener', {}, { timeout: 3000 });
    expect(screen.getByText('Cambridge')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Open filters' }));
    fireEvent.change(screen.getByLabelText('Geography'), { target: { value: 'n-kitchener' } });
    fireEvent.click(screen.getByRole('button', { name: 'Apply filters' }));

    await screen.findByText('N. Kitchener', {}, { timeout: 3000 });
    expect(screen.queryByText('Cambridge')).not.toBeInTheDocument();
  });

  it('switching Reporting Period to May 2026 shows that period’s average risk index', async () => {
    renderApp();
    await screen.findByText('6.4', {}, { timeout: 3000 });

    fireEvent.click(screen.getByRole('button', { name: 'Open filters' }));
    fireEvent.change(screen.getByLabelText('Reporting Period'), { target: { value: 'may-2026' } });
    fireEvent.click(screen.getByRole('button', { name: 'Apply filters' }));

    expect(await screen.findByText('5.1', {}, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.queryByText('6.4')).not.toBeInTheDocument();
  });
});
