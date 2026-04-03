# MovingTech.ai — Frontend

React application for browsing, searching, and filtering a directory of moving and relocation software. The frontend is intentionally decoupled from the data source — all external communication is routed through a thin API client (`src/api/client.js`) so the backend can be swapped or extended without touching any component code.



## Setup and Running

### Prerequisites

- Node.js 16 or higher
- The Python backend running on port 8000 (see `/backend/README.md`)

### Install and start

```bash
cd frontend
npm install
npm start
```

React dev server starts on `http://localhost:3000`. API calls are proxied to `http://localhost:8000` via the `proxy` field in `package.json` — no environment variables are needed for local development.

### Configuring the API URL

For staging or production, set the backend base URL before building:

```bash
REACT_APP_API_URL=https://api.movingtech.ai npm run build
```

If `REACT_APP_API_URL` is not set, `client.js` falls back to `http://localhost:8000`.

---

## Routing

Defined in `App.js` using React Router v6:

| Path | Component | Description |
|---|---|---|
| `/` | `LandingPage` | Marketing hero, preview cards, value propositions |
| `/directory` | `DirectoryPage` | Full searchable and filterable software listing |
| `/software/:id` | `SoftwareDetailPage` | Individual profile page for one software product |
| `/compare` | `ComparePage` | *(stub)* Side-by-side comparison — not yet implemented |

The `Navbar` component sits outside the `<Routes>` block so it renders on every page.

### Navigation state — zero extra requests

When a user clicks a `SoftwareCard`, the full item object is passed through React Router's `location.state`:

```js
// softwareCard.jsx
navigate(`/software/${item.id}`, { state: { item } });
```

`SoftwareDetailPage` checks for this state first and skips the API call entirely when it's present. The API is only called when the user lands on a detail URL directly (e.g. from a bookmark or shared link):

```js
// softwareDetailPage.jsx
const [item, setItem] = useState(location.state?.item || null);
const [loading, setLoading] = useState(!location.state?.item);
```

---

## How the Frontend Communicates with the Backend

### API client — `src/api/client.js`

Single source of truth for all network calls. Components never call `fetch()` directly.

```
Component / Page
      │
      │  calls named function
      ▼
src/api/client.js          (searchSoftware, filterSoftware, getFilterOptions, getSoftwareById)
      │
      │  fetch() → HTTP GET
      ▼
Python FastAPI backend :8000
      │
      │  JSON response
      ▼
client.js returns resolved promise
      │
      ▼
Component updates state
```

| Function | Endpoint | Used by |
|---|---|---|
| `searchSoftware(q, page, pageSize)` | `GET /api/software/search` | `DirectoryPage` (when search box has input) |
| `filterSoftware(filters, page, pageSize)` | `GET /api/software/filter` | `DirectoryPage` (when filters are active, no search query) |
| `getFilterOptions()` | `GET /api/software/options` | `DirectoryPage` (on mount, populates sidebar dropdowns) |
| `getSoftwareById(id)` | `GET /api/software/{id}` | `SoftwareDetailPage` (direct URL access only) |

### Data-fetching hook — `src/hooks/useAPI.js`

`useApi(fetchFn, deps)` is a generic hook that wraps any async function and manages `loading`, `error`, and `data` state with a mounted-ref guard to prevent state updates on unmounted components.

`DirectoryPage` does not use `useApi` directly — it manages its own state because the fetch function depends on multiple pieces of state (search query, filters, page) that change independently and need coordinated resets. Simpler pages like `SoftwareDetailPage` use the pattern inline.

`useDebounce(value, delay)` delays propagating the search input value by 350 ms so the API is not called on every keystroke.

---

## UI/UX Design Decisions

### Search and filter are mutually exclusive

When the search box contains text, the filter sidebar is bypassed entirely and `searchSoftware()` is called. When the search box is empty, `filterSoftware()` runs with whatever sidebar filters are active. This mirrors the mental model most users have — you either know what you're looking for (search) or you're browsing (filter). Mixing both would require more complex backend query logic and is deferred to a future phase.

### Boolean feature filters cycle through three states

The feature toggles in the sidebar cycle: **Any → Yes → No → Any**. `null` means no preference, `true` means must have the feature, `false` means must not have it. This lets a user explicitly exclude software that lacks dispatch, for example — something a simple checkbox cannot express.

```js
// filterPanel.jsx
const next = current === null ? true : current === true ? false : null;
```

### Page resets to 1 on query or filter change

Any change to the search term or a filter value resets the page counter to 1. This is handled by a dedicated `useEffect` watching `[debouncedSearch, filters]` separately from the fetch effect, keeping the two concerns cleanly separated.

### Result count display

The directory shows a `results-summary` line (`Showing 1–20 of 87 software profiles`) above the grid, and a live count badge in the topbar. Both update from a single `results.total` value returned by the API, so they are always in sync.

### Navbar scroll behaviour

The navbar gains a `navbar--scrolled` CSS class once the user scrolls past 10 px, which triggers a background and shadow transition. This is implemented with a `scroll` event listener in `useEffect` that is cleaned up on unmount.

### Status components

`LoadingSpinner`, `ErrorMessage`, and `EmptyState` live in `statusComponents.jsx` and are used consistently across every page. They accept props for custom messages and retry callbacks so pages can show context-appropriate copy without duplicating structure.

---

## Component Reference

### `<SoftwareCard item={} />`

Clickable card shown in the directory grid. Derives its feature badge list by filtering the `features` object for entries where the value is `"Y"`, then maps those keys through a human-readable `FEATURE_LABELS` map. Shows up to 8 badges; surplus features are collapsed to `+N more`.

### `<FilterPanel options={} filters={} onChange={} onReset={} />`

Controlled component — owns no local state. Receives the current filter object, calls `onChange` with a full updated copy on every interaction. Dropdown options are populated from the `options` prop which comes from `GET /api/software/options`, so they always reflect what is actually in the database.

### `<FeatureBadge label={} size="sm|md" />`

Renders a single pill. Used in `SoftwareCard` (size `sm`) and on the detail page keyword list (size `md`).

### `<Pagination page={} pageSize={} total={} onChange={} />`

Renders nothing when `totalPages <= 1`. Page numbers are windowed around the current page with a delta of 2, and ellipsis markers are inserted for gaps. The component is purely presentational — it calls `onChange(newPage)` and the parent owns the page state.

### `<Navbar />`

Contains the logo, nav links, and a CTA button. Active link is highlighted by comparing `location.pathname` from `useLocation()`. The component adds a CSS class when `window.scrollY > 10` to add a background on scroll.

---

## Extending the Frontend

### Adding a new page

1. Create `src/pages/yourPage.jsx`.
2. Add a `<Route path="/your-path" element={<YourPage />} />` in `App.js`.
3. Add a `<Link>` in `navbar.jsx` if it should appear in navigation.

### Adding a new API function

Add a named export to `src/api/client.js`:

```js
export async function getFeaturedSoftware() {
  return request('/api/software/featured');
}
```

Then import and call it from any page or hook.

### Adding a new filter dimension

1. Add the field to `INITIAL_FILTERS` in `directoryPage.jsx`.
2. Add a `<select>` or toggle button in `filterPanel.jsx`, wired to `handleChange(key, value)`.
3. Verify the backend's `/api/software/options` response includes the new dimension and `/api/software/filter` accepts the new query parameter.

### Implementing the Compare page

`comparePage.jsx` is a stub. The intended flow is:

1. User selects 2–4 items in the directory (checkbox or "Add to compare" button on each card).
2. Selected item IDs are held in a top-level state (or React context) passed down from `App.js`.
3. `ComparePage` reads those IDs, fetches full profiles via `getSoftwareById()` for any not already in state, and renders a side-by-side feature matrix.

The feature matrix structure is already defined in `softwareDetailPage.jsx` (`FEATURE_SECTIONS`) — reuse it as the row definition for the comparison table.

### Environment variables

| Variable | Default | Description |
|---|---|---|
| `REACT_APP_API_URL` | `http://localhost:8000` | Backend base URL used by `client.js` |

All React environment variables must be prefixed with `REACT_APP_` to be accessible at runtime. Set them in `.env` for local overrides or in your CI/CD pipeline for deployments.