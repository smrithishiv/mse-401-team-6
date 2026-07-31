import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DemandDriverExplanationPanel from './DemandDriverExplanationPanel';

const groups = [
  {
    groupId: 'single-parent-households',
    name: 'Single-parent households',
    shareOfDemand: 22,
    projectedChangePercent: 8.4,
    contributingFactors: [
      {
        id: 'household-benefit-level',
        name: 'Household benefit level',
        direction: 'negative',
        contribution: 0.34,
        explanation: 'A projected reduction in household support is associated with increased demand.',
      },
    ],
    detailHref: '/help/projections#external-indicators',
  },
];

function renderPanel(props = {}) {
  return render(
    <MemoryRouter>
      <DemandDriverExplanationPanel periodLabel="August 2026" groups={groups} {...props} />
    </MemoryRouter>
  );
}

describe('DemandDriverExplanationPanel', () => {
  it('renders group data sourced from props (the service layer), not invented copy', () => {
    renderPanel();

    expect(screen.getByText(/Who.s driving the August 2026 number/)).toBeInTheDocument();
    expect(screen.getByText('Single-parent households')).toBeInTheDocument();
    expect(screen.getByText('22% of demand')).toBeInTheDocument();
    expect(screen.getByText('+8.4% projected change')).toBeInTheDocument();
    expect(
      screen.getByText('A projected reduction in household support is associated with increased demand.')
    ).toBeInTheDocument();
  });

  it('renders nothing when there are no groups', () => {
    const { container } = renderPanel({ groups: [] });
    expect(container).toBeEmptyDOMElement();
  });
});
