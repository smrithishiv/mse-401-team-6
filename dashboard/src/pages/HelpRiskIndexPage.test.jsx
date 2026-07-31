import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HelpRiskIndexPage from './HelpRiskIndexPage';
import { RISK_INDEX_SECTIONS, RISK_INDEX_NOTICE } from '../data/helpRiskIndexContent';

function renderPage() {
  return render(
    <MemoryRouter>
      <HelpRiskIndexPage />
    </MemoryRouter>
  );
}

describe('HelpRiskIndexPage', () => {
  it('renders the page title', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'How the Risk Index Works', level: 1 })).toBeInTheDocument();
  });

  it('renders every placeholder section heading', () => {
    renderPage();
    RISK_INDEX_SECTIONS.forEach((section) => {
      expect(screen.getByRole('heading', { name: section.title })).toBeInTheDocument();
    });
  });

  it('shows the pending-methodology notice, and does not invent a scale', () => {
    renderPage();
    expect(screen.getByText(RISK_INDEX_NOTICE)).toBeInTheDocument();
  });
});
