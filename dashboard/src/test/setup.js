import '@testing-library/jest-dom/vitest';

// jsdom doesn't implement ResizeObserver, which Recharts' ResponsiveContainer
// requires to measure its parent element.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserverStub;

// jsdom doesn't implement matchMedia, which useMediaQuery (responsive
// chart-type switching) relies on. Default to "not matching" (i.e. the wide
// breakpoint) so tests get deterministic, non-narrow layout unless a test
// overrides window.matchMedia itself.
window.matchMedia =
  window.matchMedia ||
  function matchMedia(query) {
    return {
      matches: false,
      media: query,
      addEventListener() {},
      removeEventListener() {},
    };
  };
