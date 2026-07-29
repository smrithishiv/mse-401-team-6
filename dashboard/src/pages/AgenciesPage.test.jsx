import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AgenciesPage from './AgenciesPage';

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/agencies" element={<AgenciesPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('AgenciesPage', () => {
  it('loads all 61 agencies by default', async () => {
    renderAt('/agencies');
    expect(await screen.findByText('61 agencies', {}, { timeout: 3000 })).toBeInTheDocument();
  });

  it('search filters the directory by agency name as the user types', async () => {
    renderAt('/agencies');
    await screen.findByText('61 agencies', {}, { timeout: 3000 });

    fireEvent.change(screen.getByLabelText('Search agencies by name, city, or status'), {
      target: { value: 'KW YMCA' },
    });

    expect(await screen.findByText('1 agency')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'KW YMCA' })).toBeInTheDocument();
  });

  it('search filters by city', async () => {
    renderAt('/agencies');
    await screen.findByText('61 agencies', {}, { timeout: 3000 });

    fireEvent.change(screen.getByLabelText('Search agencies by name, city, or status'), {
      target: { value: 'Cambridge' },
    });

    expect(await screen.findByRole('link', { name: 'Cambridge Food Bank' })).toBeInTheDocument();
  });

  it('filters by status', async () => {
    renderAt('/agencies');
    await screen.findByText('61 agencies', {}, { timeout: 3000 });

    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'critical' } });

    expect(await screen.findByRole('link', { name: 'Elmira Newcomer Family Pantry' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'KW YMCA' })).not.toBeInTheDocument();
  });

  it('combines search and a status filter together', async () => {
    renderAt('/agencies');
    await screen.findByText('61 agencies', {}, { timeout: 3000 });

    fireEvent.change(screen.getByLabelText('Search agencies by name, city, or status'), { target: { value: 'kw' } });
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'high-demand' } });

    expect(await screen.findByText('1 agency')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'KW YMCA' })).toBeInTheDocument();
  });

  it('shows an empty state when no agencies match', async () => {
    renderAt('/agencies');
    await screen.findByText('61 agencies', {}, { timeout: 3000 });

    fireEvent.change(screen.getByLabelText('Search agencies by name, city, or status'), {
      target: { value: 'zzzznoagencyzzzz' },
    });

    expect(await screen.findByText('No agencies match your search or filters.')).toBeInTheDocument();
  });

  it('initializes search and status filter from the URL', async () => {
    renderAt('/agencies?search=Cambridge+Food+Bank&status=watch');

    expect(await screen.findByDisplayValue('Cambridge Food Bank', {}, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.getByLabelText('Status')).toHaveValue('watch');
    expect(await screen.findByText('1 agency')).toBeInTheDocument();
  });

  it('translates the ?status=review shorthand (used by KPI card links) into the Review Required filter', async () => {
    renderAt('/agencies?status=review');
    await screen.findByText('2 agencies', {}, { timeout: 3000 });

    expect(screen.getByLabelText('Review required')).toHaveValue('true');
    expect(screen.getByLabelText('Status')).toHaveValue('all');
  });
});
