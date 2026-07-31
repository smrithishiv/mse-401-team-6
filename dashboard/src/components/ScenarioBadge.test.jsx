import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ScenarioBadge from './ScenarioBadge';

describe('ScenarioBadge', () => {
  it('renders the exact required disclaimer copy', () => {
    render(<ScenarioBadge />);
    expect(screen.getByText('Planning scenario — not the official forecast')).toBeInTheDocument();
  });
});
