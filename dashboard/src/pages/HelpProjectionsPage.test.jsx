import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HelpProjectionsPage from './HelpProjectionsPage';
import { PROJECTIONS_SECTIONS, PROJECTIONS_NOTICE } from '../data/helpProjectionsContent';

function renderPage() {
  return render(
    <MemoryRouter>
      <HelpProjectionsPage />
    </MemoryRouter>
  );
}

describe('HelpProjectionsPage', () => {
  it('renders the page title', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'How Projections Work', level: 1 })).toBeInTheDocument();
  });

  it('renders every placeholder section heading', () => {
    renderPage();
    PROJECTIONS_SECTIONS.forEach((section) => {
      expect(screen.getByRole('heading', { name: section.title })).toBeInTheDocument();
    });
  });

  it('shows the pending-methodology notice', () => {
    renderPage();
    expect(screen.getByText(PROJECTIONS_NOTICE)).toBeInTheDocument();
  });
});
