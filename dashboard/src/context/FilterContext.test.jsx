import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterProvider, useFilters } from './FilterContext';

function TestConsumer() {
  const { appliedFilters, draftFilters, setDraftFilter, applyFilters, resetFilters } = useFilters();
  return (
    <div>
      <p data-testid="applied-gender">{appliedFilters.gender}</p>
      <p data-testid="draft-gender">{draftFilters.gender}</p>
      <button onClick={() => setDraftFilter('gender', 'female')}>set-draft</button>
      <button onClick={applyFilters}>apply</button>
      <button onClick={resetFilters}>reset</button>
    </div>
  );
}

describe('FilterContext', () => {
  it('only updates applied filters once Apply is clicked, not on draft changes', () => {
    render(
      <FilterProvider>
        <TestConsumer />
      </FilterProvider>
    );

    expect(screen.getByTestId('applied-gender')).toHaveTextContent('all');

    fireEvent.click(screen.getByText('set-draft'));
    expect(screen.getByTestId('draft-gender')).toHaveTextContent('female');
    expect(screen.getByTestId('applied-gender')).toHaveTextContent('all');

    fireEvent.click(screen.getByText('apply'));
    expect(screen.getByTestId('applied-gender')).toHaveTextContent('female');
  });

  it('reset returns both draft and applied filters to defaults', () => {
    render(
      <FilterProvider>
        <TestConsumer />
      </FilterProvider>
    );

    fireEvent.click(screen.getByText('set-draft'));
    fireEvent.click(screen.getByText('apply'));
    fireEvent.click(screen.getByText('reset'));

    expect(screen.getByTestId('applied-gender')).toHaveTextContent('all');
    expect(screen.getByTestId('draft-gender')).toHaveTextContent('all');
  });
});
