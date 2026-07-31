import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { FilterUIProvider } from '../context/FilterUIContext';
import AppHeader from '../components/AppHeader';
import AtRiskGroupsPage from './AtRiskGroupsPage';

function renderApp() {
  return render(
    <MemoryRouter initialEntries={['/at-risk-groups']}>
      <FilterUIProvider>
        <AppHeader />
        <AtRiskGroupsPage />
      </FilterUIProvider>
    </MemoryRouter>
  );
}

describe('At-risk Groups region selection', () => {
  it('selecting a region on the map updates the title and risk index label, and shows Clear selection', async () => {
    renderApp();
    await screen.findByText('Food Insecurity Risk – Waterloo Region', {}, { timeout: 3000 });

    expect(screen.getByRole('heading', { level: 1, name: 'At-risk Groups' })).toBeInTheDocument();
    expect(screen.getByText('Waterloo Region average risk index')).toBeInTheDocument();
    expect(screen.queryByText('Clear selection')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^N\. Kitchener: /i }));

    expect(await screen.findByRole('heading', { level: 1, name: 'At-risk Groups — N. Kitchener' })).toBeInTheDocument();
    expect(screen.getByText('N. Kitchener risk index')).toBeInTheDocument();
    expect(screen.getByText('Clear selection')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Clear selection'));

    expect(await screen.findByRole('heading', { level: 1, name: 'At-risk Groups' })).toBeInTheDocument();
    expect(screen.getByText('Waterloo Region average risk index')).toBeInTheDocument();
  });

  it('the High-risk Areas card expands to a list, and "Select on map" selects that region', async () => {
    renderApp();
    await screen.findByText('Food Insecurity Risk – Waterloo Region', {}, { timeout: 3000 });

    fireEvent.click(screen.getByRole('button', { name: /High-risk areas/ }));

    const panel = await screen.findByRole('group', { name: 'High-risk areas' });
    const selectButtons = within(panel).getAllByText('Select on map');
    expect(selectButtons.length).toBeGreaterThan(0);

    fireEvent.click(selectButtons[0]);
    expect(await screen.findByText('Clear selection')).toBeInTheDocument();
  });

  it('the High-risk Groups card expands to a list with a "Filter page to this group" action', async () => {
    renderApp();
    await screen.findByText('Food Insecurity Risk – Waterloo Region', {}, { timeout: 3000 });

    fireEvent.click(screen.getByRole('button', { name: /High-risk groups/ }));

    const panel = await screen.findByRole('group', { name: 'High-risk groups' });
    expect(within(panel).getAllByText('Filter page to this group').length).toBeGreaterThan(0);
  });
});

describe('Food price inflation card', () => {
  it('renders the renamed label with reporting period, comparison type, and cadence', async () => {
    renderApp();
    expect(await screen.findByText('Food price inflation', {}, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.getByText('+9.2%')).toBeInTheDocument();
    expect(screen.getByText('June 2026, year over year')).toBeInTheDocument();
    expect(screen.getByText('Updated monthly')).toBeInTheDocument();
  });
});

describe('Regional detail metrics', () => {
  it('shows a geography level badge for each metric row', async () => {
    renderApp();
    await screen.findByText('Food Insecurity Risk – Waterloo Region', {}, { timeout: 3000 });

    expect(screen.getByText('Regional detail metrics — Waterloo Region')).toBeInTheDocument();
    expect(screen.getAllByText('Regional data').length).toBeGreaterThan(0);
  });
});
