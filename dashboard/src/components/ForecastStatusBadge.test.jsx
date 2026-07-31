import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ForecastStatusBadge from './ForecastStatusBadge';

describe('ForecastStatusBadge', () => {
  it('renders the "Actual recorded demand" label and its explanatory tooltip content on focus', () => {
    render(<ForecastStatusBadge statusKey="actual" />);
    expect(screen.getByText('Actual recorded demand')).toBeInTheDocument();

    fireEvent.focus(screen.getByRole('button'));
    expect(screen.getByRole('tooltip')).toHaveTextContent(
      'This value comes from completed reporting data and is not a model prediction.'
    );
  });

  it('renders "Allocation on track" with its tooltip content', () => {
    render(<ForecastStatusBadge statusKey="on-track" />);
    expect(screen.getByText('Allocation on track')).toBeInTheDocument();

    fireEvent.focus(screen.getByRole('button'));
    expect(screen.getByRole('tooltip')).toHaveTextContent(
      'The forecast range and current allocation are within the accepted operational threshold. No adjustment is currently recommended.'
    );
  });

  it('renders "Manual confirmation recommended" with its tooltip content', () => {
    render(<ForecastStatusBadge statusKey="manual-review" />);
    expect(screen.getByText('Manual confirmation recommended')).toBeInTheDocument();

    fireEvent.focus(screen.getByRole('button'));
    expect(screen.getByRole('tooltip')).toHaveTextContent(
      'Forecast uncertainty or projected demand exceeds the accepted threshold. Review local conditions before confirming the allocation.'
    );
  });

  it('omits the tooltip trigger when withTooltip is false', () => {
    render(<ForecastStatusBadge statusKey="actual" withTooltip={false} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
