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

## Filter architecture

There is **one reusable filter system**, not three copies of the same panel.
Each page configures it with only the fields that match its own analytical
purpose, and filters are page-local by default — nothing carries between
routes automatically.

- **`src/config/filterFields.js`** declares each page's field list
  (`forecastFilterFields`, `atRiskFilterFields`, `overviewCompactFilterFields`)
  plus their defaults. This is the single place that decides which controls a
  page gets. Notably, **Forecast has no Geography filter** — the forecast
  mock/service data has no regional breakdown, so showing that control would
  imply model support that doesn't exist yet. At-risk Groups does have one,
  built from `src/utils/geography.js`, which reads the region catalog out of
  `mockRiskData.js` — if geography is later promoted to a dashboard-wide
  context (e.g. once the forecast model gains regional data), that context
  should source its region list from `geography.js` too, rather than
  duplicating it.
- **`usePageFilters`** (`src/hooks/usePageFilters.js`) is the hook Forecast
  and At-risk Groups each instantiate independently. It owns that page's
  draft/applied filter values and drawer open state as local `useState` —
  never shared, never persisted elsewhere — so filter selections can't leak
  from one page into another. Draft edits only take effect on "Apply filters"
  (or are cleared on "Reset"), so pages don't refetch on every keystroke.
- **`FilterUIContext`** (`src/context/FilterUIContext.jsx`) is a thin,
  separate context that only carries UI wiring: whichever page currently has
  filters registers `{ hasFilters, activeCount, openDrawer }` so `AppHeader`
  knows whether to render the filter icon and what it should open. It carries
  no filter *values* — that stays in each page via `usePageFilters`. Because
  registration happens in an effect that cleans up on unmount, navigating to
  Overview (which never calls `usePageFilters`) automatically clears it, so
  the header filter icon disappears there.
- **`FilterDrawer`** (`src/components/FilterDrawer.jsx`) is generic and
  config-driven — it renders whatever `fields` a page passes in, with no
  knowledge of Forecast vs. At-risk Groups. Both pages reuse the same
  component with different configs.
- **Overview** intentionally skips the drawer. It stays a stable,
  organization-wide summary with just `CompactFilterBar`
  (`src/components/CompactFilterBar.jsx`) — a reporting-period selector and
  an agency selector, both inline in the page header, both backed by real
  mock snapshots (see `getOverviewSnapshot` in `mockOverviewData.js`).

## State management

- **`useAsync`** (`src/hooks/useAsync.js`) is the generic data-fetching hook
  every page uses — tracks `data` / `loading` / `error` and exposes `retry`
  for the `ErrorState` component's retry button.
- **`useForecastMode`** (`src/hooks/useForecastMode.js`) is a small hook
  local to the Forecast page for the Operational/Strategic toggle and the
  selected month card.

No Redux — the app's state needs are simple enough that a couple of local
hooks plus the one small `FilterUIContext` cover it without extra ceremony.

## Exporting reports

The "Export report" button (present on all three pages) downloads whatever
data is currently displayed as JSON or CSV via `src/utils/export.js`. This is
a client-side stand-in for a future server-generated report endpoint.

## Testing

`src/**/*.test.js(x)` covers:

- Forecast mode switching (`src/pages/ForecastPage.test.jsx`)
- Forecast filter application, including a real value-scaling check and that
  Geography is absent (`src/pages/ForecastPage.filters.test.jsx`)
- At-risk Groups filters — Geography/Population/Risk Level/Socioeconomic
  controls exist, geography narrows the map, reporting period changes the
  numbers (`src/pages/AtRiskGroupsPage.filters.test.jsx`)
- Overview's compact filters — no drawer icon, reporting period swaps
  snapshots, agency selector filters the table (`src/pages/OverviewPage.test.jsx`)
- `usePageFilters` draft/apply/reset semantics and that two page instances
  never share state (`src/hooks/usePageFilters.test.jsx`)
- Loading and error states, including retry (`src/hooks/useAsync.test.js`)
- Forecast values rendered from the service layer
  (`src/services/forecastService.test.js`)

Run them with `npm test`.
