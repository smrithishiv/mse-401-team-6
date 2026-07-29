# Breaking Bread — Demand Forecast Dashboard

A demand forecasting and food insecurity decision-support dashboard for the
Waterloo Region, built for the Food Bank of Waterloo Region as part of the
MSE 401 capstone. This is the frontend prototype: all data is currently
mocked, but the app is structured so the mock services can be swapped for a
real backend without touching any component code (see
[Connecting a real backend](#connecting-a-real-backend) below).

## Tech stack

- React 18 + JavaScript (no TypeScript)
- Vite
- React Router
- Recharts (charts)
- Lucide React (icons)
- CSS Modules + a shared CSS variable system
- Vitest + React Testing Library (tests)

## Getting started

Requires Node 18+.

```bash
npm install
npm run dev       # starts the dev server at http://localhost:5173
```

Other scripts:

```bash
npm run build      # production build to dist/
npm run preview    # preview the production build locally
npm test           # run the test suite once
npm run test:watch # run tests in watch mode
```

Copy `.env.example` to `.env` if you want to point the app at a real backend
once one exists:

```bash
cp .env.example .env
```

## Project structure

```
src/
  components/   Reusable presentational components (cards, badges, charts, tables…)
  pages/        One file per route (OverviewPage, ForecastPage, AtRiskGroupsPage)
                plus the two Forecast sub-views (Operational / Strategic)
  services/     The data-access layer — see below
  data/         Mock data, shaped exactly like the future API responses
  hooks/        useAsync (data fetching), useForecastMode (page-local UI state)
  context/      FilterContext (shared filter state + drawer open/close)
  utils/        Formatting, chart-data merging, CSV/JSON export, data contracts
  styles/       CSS variables (variables.css) and global resets (global.css)
```

## Routes

- `/overview` — headline demand number, active agencies, allocation alerts,
  population signals, agencies needing review
- `/forecast` — Operational (July–Sept monthly cards + chart) and Strategic
  (5-year chart + demographic breakdown) views, toggled with a segmented
  control
- `/at-risk-groups` — risk metrics, a simplified Waterloo Region risk map,
  socioeconomic signal cards, population signal bars

All three share the same `AppHeader`, `FilterDrawer`, and `DashboardFooter`.

## Data layer & connecting a real backend

Components never import mock data directly — they call functions in
`src/services/`:

| Service function | File | Future endpoint |
|---|---|---|
| `getOperationalForecast(filters)` | `forecastService.js` | `GET /api/forecast/operational` |
| `getStrategicForecast(filters)` | `forecastService.js` | `GET /api/forecast/strategic` |
| `getOverviewSummary()` | `overviewService.js` | `GET /api/overview` |
| `getAgencyAlerts()` | `overviewService.js` | `GET /api/agencies/alerts` |
| `getAtRiskGroups(filters)` | `riskService.js` | `GET /api/at-risk-groups` |

Today, every one of these calls `mockRequest(...)` from `src/services/api.js`,
which resolves the corresponding file in `src/data/` after an artificial
~500ms delay (so loading skeletons are actually exercised). `api.js` also
exports `apiFetch(path, options)`, a fetch wrapper already pointed at
`VITE_API_BASE_URL` with error handling built in.

**To connect a real backend once it exists**, in each service file swap the
`mockRequest(...)` call for `apiFetch(...)`, e.g. in `forecastService.js`:

```js
// Before
export async function getOperationalForecast(filters = {}) {
  return mockRequest(operationalForecast, { forceError: filters.forceError });
}

// After
export async function getOperationalForecast(filters = {}) {
  return apiFetch(`/api/forecast/operational${toQueryString(filters)}`);
}
```

No changes are needed in any page or component — they only depend on the
service function's return shape, which is documented as JSDoc typedefs in
`src/utils/types.js` and mirrored exactly by the mock data in `src/data/`.
Keep new backend responses conforming to those shapes and everything upstream
(cards, charts, tables) keeps working as-is.

Set the real backend's URL in `.env`:

```
VITE_API_BASE_URL=https://your-backend.example.com
```

## State management

- **`FilterContext`** (`src/context/FilterContext.jsx`) holds the applied
  filters, a draft copy edited inside the `FilterDrawer`, and drawer
  open/close state. Draft changes only take effect on "Apply filters" (or
  are cleared on "Reset"), so pages don't refetch on every keystroke.
- **`useAsync`** (`src/hooks/useAsync.js`) is the generic data-fetching hook
  every page uses — tracks `data` / `loading` / `error` and exposes `retry`
  for the `ErrorState` component's retry button.
- **`useForecastMode`** (`src/hooks/useForecastMode.js`) is a small hook
  local to the Forecast page for the Operational/Strategic toggle and the
  selected month card.

No Redux — the app's state needs are simple enough that Context + a couple
of hooks cover it without extra ceremony.

## Exporting reports

The "Export report" button (present on all three pages) downloads whatever
data is currently displayed as JSON or CSV via `src/utils/export.js`. This is
a client-side stand-in for a future server-generated report endpoint.

## Testing

`src/**/*.test.js(x)` covers:

- Forecast mode switching (`src/pages/ForecastPage.test.jsx`)
- Filter application, including a real value-scaling check
  (`src/pages/ForecastPage.filters.test.jsx`)
- Loading and error states, including retry (`src/hooks/useAsync.test.js`)
- Filter context apply/reset semantics (`src/context/FilterContext.test.jsx`)
- Forecast values rendered from the service layer
  (`src/services/forecastService.test.js`)

Run them with `npm test`.
