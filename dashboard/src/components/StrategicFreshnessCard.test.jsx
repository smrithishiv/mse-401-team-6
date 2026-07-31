import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StrategicFreshnessCard from './StrategicFreshnessCard';
import { formatDate } from '../utils/format';

const status = {
  generatedAt: '2026-06-30T23:45:00',
  dataThrough: '2026-06-30',
  refreshCadence: 'quarterly',
  nextScheduledRefresh: '2026-09-30T23:45:00',
};

describe('StrategicFreshnessCard', () => {
  it('renders the generated date and cadence', () => {
    render(<StrategicFreshnessCard status={status} />);
    expect(screen.getByText('Strategic forecast updated')).toBeInTheDocument();
    expect(screen.getByText('June 30, 2026')).toBeInTheDocument();
    expect(screen.getByText('Quarterly refresh')).toBeInTheDocument();
  });

  it('reveals data-through and next-refresh detail in a tooltip on focus', () => {
    render(<StrategicFreshnessCard status={status} />);
    fireEvent.focus(screen.getByRole('button', { name: 'Strategic forecast freshness details' }));

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveTextContent(formatDate(status.dataThrough));
    expect(tooltip).toHaveTextContent('Sep 30');
  });
});
