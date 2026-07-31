import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HorizonSelector from './HorizonSelector';

describe('HorizonSelector', () => {
  it('renders one option per supported horizon', () => {
    render(<HorizonSelector options={[2, 3, 5, 10]} value={5} onChange={() => {}} />);
    expect(screen.getByRole('radio', { name: '2y' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: '3y' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: '5y' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: '10y' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: '5y' })).toHaveAttribute('aria-checked', 'true');
  });

  it('calls onChange with a numeric value when an option is selected', () => {
    const onChange = vi.fn();
    render(<HorizonSelector options={[2, 3, 5, 10]} value={5} onChange={onChange} />);

    fireEvent.click(screen.getByRole('radio', { name: '10y' }));
    expect(onChange).toHaveBeenCalledWith(10);
  });
});
