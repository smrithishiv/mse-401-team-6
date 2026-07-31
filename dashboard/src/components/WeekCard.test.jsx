import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WeekCard from './WeekCard';

const predictedWeek = {
  id: 'wk-2026-07-28',
  label: 'Jul 28 – Aug 3',
  type: 'predicted',
  value: 13500,
  changeFromPreviousWeekPct: 3.1,
  confidence: 'high',
  statusKey: 'on-track',
};

describe('WeekCard', () => {
  it('renders the week label, value, status and confidence', () => {
    render(<WeekCard week={predictedWeek} selected={false} onSelect={() => {}} />);

    expect(screen.getByText(/Jul 28 – Aug 3/)).toBeInTheDocument();
    expect(screen.getByText('13,500')).toBeInTheDocument();
    expect(screen.getByText('Allocation on track')).toBeInTheDocument();
    expect(screen.getByText('High confidence')).toBeInTheDocument();
    expect(screen.getByText(/\+3\.1% vs previous week/)).toBeInTheDocument();
  });

  it('calls onSelect with the week id when clicked', () => {
    const onSelect = vi.fn();
    render(<WeekCard week={predictedWeek} selected={false} onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('button', { name: /Jul 28 – Aug 3/ }));
    expect(onSelect).toHaveBeenCalledWith('wk-2026-07-28');
  });

  it('reflects selection via aria-pressed', () => {
    render(<WeekCard week={predictedWeek} selected onSelect={() => {}} />);
    expect(screen.getByRole('button', { name: /Jul 28 – Aug 3/ })).toHaveAttribute('aria-pressed', 'true');
  });
});
