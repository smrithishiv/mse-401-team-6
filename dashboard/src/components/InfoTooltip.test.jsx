import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import InfoTooltip from './InfoTooltip';

describe('InfoTooltip', () => {
  it('is closed by default', () => {
    render(<InfoTooltip label="Explain confidence" content="High confidence means..." />);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('opens on keyboard focus and is readable by assistive tech via aria-describedby', () => {
    render(<InfoTooltip label="Explain confidence" content="High confidence means..." />);
    const trigger = screen.getByRole('button', { name: 'Explain confidence' });

    fireEvent.focus(trigger);

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveTextContent('High confidence means...');
    expect(trigger).toHaveAttribute('aria-describedby', tooltip.id);
  });

  it('opens on hover', () => {
    render(<InfoTooltip label="Explain confidence" content="High confidence means..." />);
    const trigger = screen.getByRole('button', { name: 'Explain confidence' });

    fireEvent.mouseEnter(trigger);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  it('closes on Escape', () => {
    render(<InfoTooltip label="Explain confidence" content="High confidence means..." />);
    const trigger = screen.getByRole('button', { name: 'Explain confidence' });

    fireEvent.focus(trigger);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    fireEvent.keyDown(trigger, { key: 'Escape' });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('closes on blur', () => {
    render(<InfoTooltip label="Explain confidence" content="High confidence means..." />);
    const trigger = screen.getByRole('button', { name: 'Explain confidence' });

    fireEvent.focus(trigger);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    fireEvent.blur(trigger);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});
