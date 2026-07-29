import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AgencyDetailPage from './AgencyDetailPage';

function renderAt(agencyId) {
  return render(
    <MemoryRouter initialEntries={[`/agencies/${agencyId}`]}>
      <Routes>
        <Route path="/agencies/:agencyId" element={<AgencyDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('AgencyDetailPage', () => {
  it('renders agency details for a known agency id', async () => {
    renderAt('kw-ymca');

    expect(await screen.findByRole('heading', { name: 'KW YMCA' }, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.getByText(/Kitchener-Waterloo/)).toBeInTheDocument();
    expect(screen.getByText('Review allocation')).toBeInTheDocument();
  });

  it('shows a not-found state for an unknown agency id, with a link back to the directory', async () => {
    renderAt('not-a-real-agency');

    expect(await screen.findByText(/couldn.t find an agency/i, {}, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to Agencies' })).toBeInTheDocument();
  });
});
