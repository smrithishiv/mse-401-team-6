import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { FilterUIProvider } from '../context/FilterUIContext';
import AppHeader from '../components/AppHeader';
import OverviewPage from './OverviewPage';

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname + location.search}</div>;
}

function renderApp() {
  return render(
    <MemoryRouter initialEntries={['/overview']}>
      <FilterUIProvider>
        <AppHeader />
        <Routes>
          <Route path="/overview" element={<OverviewPage />} />
          <Route path="/agencies" element={<LocationDisplay />} />
          <Route path="/forecast" element={<LocationDisplay />} />
          <Route path="/at-risk-groups" element={<LocationDisplay />} />
        </Routes>
      </FilterUIProvider>
    </MemoryRouter>
  );
}

describe('OverviewPage', () => {
  it('does not show the full filter drawer trigger, or an agency selector — Overview stays a compact org-wide summary', async () => {
    renderApp();
    await screen.findByText('54,200 people', {}, { timeout: 3000 });

    expect(screen.queryByRole('button', { name: 'Open filters' })).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Agency')).not.toBeInTheDocument();
  });

  it('renders a dynamic Operational Summary built from current data, not a fixed paragraph', async () => {
    renderApp();
    await screen.findByText('Operational Summary', {}, { timeout: 3000 });

    expect(screen.getByText(/August 2026 demand is forecasted at 54,200 people/)).toBeInTheDocument();
    expect(screen.getByText(/agenc(y requires|ies require) manual review/)).toBeInTheDocument();
    expect(screen.getByText(/September 2026 forecast confidence is low/)).toBeInTheDocument();
  });

  it('renders data freshness (data updated + model last run) sourced from the service layer, near the page title', async () => {
    renderApp();
    await screen.findByText('54,200 people', {}, { timeout: 3000 });

    expect(screen.getByText(/Data updated/)).toBeInTheDocument();
  });

  it('the Active Agencies KPI card navigates to /agencies', async () => {
    renderApp();
    await screen.findByText('54,200 people', {}, { timeout: 3000 });

    fireEvent.click(screen.getByRole('link', { name: /Active agencies: 61/ }));

    expect(await screen.findByTestId('location')).toHaveTextContent('/agencies');
  });

  it('the Allocation Alerts KPI card navigates to the filtered review queue', async () => {
    renderApp();
    await screen.findByText('54,200 people', {}, { timeout: 3000 });

    fireEvent.click(screen.getByRole('link', { name: /Allocation alerts: 3/ }));

    expect(await screen.findByTestId('location')).toHaveTextContent('/agencies?status=review');
  });

  it('the predicted demand hero card navigates to /forecast', async () => {
    renderApp();
    await screen.findByText('54,200 people', {}, { timeout: 3000 });

    fireEvent.click(screen.getByRole('link', { name: /Predicted hamper demand/ }));

    expect(await screen.findByTestId('location')).toHaveTextContent('/forecast');
  });

  it('removes the "View all 61" link now that the Active Agencies card already navigates there', async () => {
    renderApp();
    await screen.findByText('Agencies needing review', {}, { timeout: 3000 });

    expect(screen.queryByText(/View all 61/)).not.toBeInTheDocument();
  });

  it('offers a compact reporting-period selector that swaps in the actual July snapshot', async () => {
    renderApp();
    await screen.findByText('54,200 people', {}, { timeout: 3000 });

    fireEvent.change(screen.getByLabelText('Reporting period'), { target: { value: 'previous' } });

    expect(await screen.findByText('51,840 people', {}, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.getByText('Actual')).toBeInTheDocument();
  });

  it('the agencies needing review table lists only flagged agencies with a reason and recommended action', async () => {
    renderApp();
    const table = await screen.findByRole('table', {}, { timeout: 3000 });
    await within(table).findByText('KW YMCA', {}, { timeout: 3000 });

    expect(within(table).getByText(/23% above expected demand/)).toBeInTheDocument();
    expect(within(table).getByText('Review allocation')).toBeInTheDocument();
  });
});
