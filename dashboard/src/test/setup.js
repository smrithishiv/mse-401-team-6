import '@testing-library/jest-dom/vitest';

// jsdom doesn't implement ResizeObserver, which Recharts' ResponsiveContainer
// requires to measure its parent element.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserverStub;
