import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WeeklyTable from './WeeklyTable';

const weeks = [
  {
    id: 'wk-1',
    label: 'Jul 28 – Aug 3',
    type: 'predicted',
    value: 13500,
    changeFromPreviousWeekPct: 3.1,
    range: { low: 12950, high: 14050, marginPct: 4.1 },
    confidence: 'high',
    statusKey: 'on-track',
    currentAllocation: 13000,
    recommendedAllocation: 13500,
  },
  {
    id: 'wk-2',
    label: 'Aug 4 – 10',
    type: 'predicted',
    value: 14100,
    changeFromPreviousWeekPct: 4.4,
    range: { low: 12600, high: 15600, marginPct: 10.6 },
    confidence: 'low',
    statusKey: 'manual-review',
    currentAllocation: 13500,
    recommendedAllocation: 14100,
  },
];

function renderTable(props = {}) {
  const onSort = vi.fn();
  const onSelectWeek = vi.fn();
  render(
    <WeeklyTable
      weeks={weeks}
      selectedWeekId="wk-1"
      onSelectWeek={onSelectWeek}
      sortBy={null}
      sortDir="asc"
      onSort={onSort}
      {...props}
    />
  );
  return { onSort, onSelectWeek };
}

describe('WeeklyTable', () => {
  it('renders a row per week with the required columns', () => {
    renderTable();
    expect(screen.getAllByText('13,500').length).toBeGreaterThan(0);
    expect(screen.getAllByText('14,100').length).toBeGreaterThan(0);
    expect(screen.getByText('12,950–14,050')).toBeInTheDocument();
  });

  it('calls onSort with the column key when a sortable header is clicked', () => {
    const { onSort } = renderTable();
    fireEvent.click(screen.getByRole('button', { name: /Predicted demand/ }));
    expect(onSort).toHaveBeenCalledWith('value');
  });

  it('marks the selected week row with aria-selected', () => {
    renderTable();
    const rows = screen.getAllByRole('row');
    const selectedRow = rows.find((r) => r.getAttribute('aria-selected') === 'true');
    expect(selectedRow).toBeDefined();
    expect(selectedRow).toHaveTextContent('Jul 28 – Aug 3');
  });
});
