# MovingTech.ai — Backend

FastAPI service that sits between the React frontend and Firestore. It fetches company profiles from the `/companies` Firestore collection, normalises the data into a consistent shape, and exposes a small REST API the frontend already expects.

---

## Project Structure

```
backend/
├── main.py                 # Entire backend — FastAPI app, Firestore client, all endpoints
├── serviceAccountKey.json  # Firebase service account key  ⚠️  never commit this
└── requirements.txt        # Python dependencies
```

---

## Setup

### 1. Prerequisites

- Python 3.9 or higher
- A Firebase project with Firestore enabled
- A service account key (JSON) downloaded from **Firebase Console → Project Settings → Service Accounts → Generate new private key**

Place the downloaded file next to `main.py` and name it `serviceAccountKey.json`, or point to it via the environment variable:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/to/key.json"
```

### 2. Install dependencies

```bash
cd backend
python -m venv venv

# macOS / Linux
source venv/bin/activate

# Windows
venv\Scripts\activate

pip install -r requirements.txt
```

`requirements.txt`:

```
fastapi
uvicorn[standard]
firebase-admin
```

### 3. Run the server

```bash
python -m uvicorn main:app --reload --port 8000
```

Use `python -m uvicorn` (not bare `uvicorn`) on Windows — it bypasses PATH issues reliably on all platforms.

Once running, visit `http://localhost:8000/docs` for the auto-generated interactive API docs.

---

## Firebase Data Flow

```
Firestore /companies/{slug}
         │
         │  firebase-admin SDK streams all documents
         ▼
   _fetch_all_docs()
         │
         │  _doc_to_dict() normalises each document
         ▼
   In-memory Python list
         │
         │  filter / search / paginate
         ▼
   JSON response → React frontend
```

### Why fetch all documents and filter in Python?

Firestore's query API does not support full-text search or partial string matching on array fields. Rather than maintaining a separate search index at the MVP stage, the backend pulls all ~150 documents into memory on each request (each document is small — under 2 KB), applies Python-side filtering, and returns a paginated slice. At the current dataset size this is fast enough and keeps the architecture simple. When the catalogue grows beyond a few thousand entries, replace `_fetch_all_docs()` with Algolia or a Firestore compound-index query.

---

## Firestore Schema → API Shape

The Firestore document structure differs from what the React components expect. `_doc_to_dict()` bridges every mismatch:

| Firestore field | Type | API field | Type | Notes |
|---|---|---|---|---|
| `name` | `string` | `name` | `string` | passed through |
| `software_typology` | `string` | `typology` | `string` | renamed |
| `target_market` | `string[]` | `best_for` | `string` | array joined with `, ` |
| `deployment_types` | `string[]` | `install` | `string` | array joined with `, ` |
| `languages` | `string[]` | `language` | `string` | array joined with `, ` |
| `keywords` | `string[]` | `keywords` | `string` | array joined with `, ` |
| `status.review_status` | `string` | `status` | `string` | nested field flattened |
| `features.sales.lead_management` | `boolean\|null` | `features.lead_mgmt` | `"Y"\|"N"\|null` | converted by `_bool_flag()` |
| `features.operations.crew_app` | `boolean\|null` | `features.crew_app` | `"Y"\|"N"\|null` | converted by `_bool_flag()` |
| *(all other feature flags)* | `boolean\|null` | *(see features object)* | `"Y"\|"N"\|null` | same conversion |
| `notes_and_features` | `string` | `notes` | `string` | renamed |
| `doc.id` (Firestore slug) | `string` | `id` | `string` | e.g. `"smartmoving"` |

### Feature flag conversion — `_bool_flag()`

Firestore stores feature flags as proper booleans (`true` / `false` / `null`). The React components (`FeatureBadge`, `SoftwareCard`, `SoftwareDetailPage`) were originally built against an Excel dataset that used `"Y"` / `"N"` strings. `_bool_flag()` converts back to those strings so no React code needs to change:

```python
def _bool_flag(val) -> Optional[str]:
    if val is None:
        return None       # unverified — shown as "Unknown" in the UI
    return "Y" if bool(val) else "N"
```

---

## API Reference

All endpoints return JSON. Pagination is zero-indexed on the server but the `page` parameter is 1-based (page 1 = first page).

### `GET /api/software/search`

Full-text search across `name`, `description`, and `keywords`.

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `q` | string | yes | — | Search term (min 1 character) |
| `page` | integer | no | `1` | Page number |
| `pageSize` | integer | no | `20` | Results per page (max 50) |

**Response**

```json
{
  "page": 1,
  "pageSize": 20,
  "total": 4,
  "items": [ /* array of company objects */ ]
}
```

**Algorithm**

`_matches_text()` lowercases both the query and the three target fields, then checks for substring presence — equivalent to SQL `ILIKE '%query%'`. No tokenisation or fuzzy matching at MVP stage.

---

### `GET /api/software/filter`

Structured filter across all indexed fields and boolean feature flags.

| Parameter | Type | Description |
|---|---|---|
| `typology` | string | Partial match against `software_typology` |
| `best_for` | string | Partial match against joined `target_market` array |
| `install` | string | Partial match against joined `deployment_types` array |
| `language` | string | Partial match against joined `languages` array |
| `status` | string | Exact match against `status.review_status` |
| `lead_mgmt` | boolean | `true` = must have feature, `false` = must not |
| `dispatch` | boolean | same |
| `crew_app` | boolean | same |
| `storage` | boolean | same |
| `surveying` | boolean | same |
| `page` | integer | Page number (default `1`) |
| `pageSize` | integer | Results per page (default `20`, max `50`) |

**Algorithm**

`_matches_filters()` is a sequential AND gate — every active filter must pass. Text filters use case-insensitive substring matching. Boolean feature filters compare the normalised `"Y"` / `"N"` value after `_bool_flag()` has run, so `true` maps to `"Y"` and `false` to `"N"`. A filter value of `null` / not provided means "no preference" and is skipped entirely.

---

### `GET /api/software/options`

Returns all distinct values present in the live dataset for each filterable dimension. The frontend uses this to populate the sidebar filter dropdowns dynamically — they always reflect the actual data.

**Response**

```json
{
  "typology": ["Field Service Mgmt", "Moving ERP / CRM", ...],
  "best_for":  ["domestic_local, all_movers", ...],
  "install":   ["cloud, web", ...],
  "language":  ["English", "Multilingual", ...],
  "status":    ["draft", "verified", ...]
}
```

---

### `GET /api/software/{company_id}`

Fetch a single profile by its Firestore document slug.

| Parameter | Type | Description |
|---|---|---|
| `company_id` | string | Firestore document ID, e.g. `smartmoving` |

Returns a single company object or `404` if not found. This endpoint is more efficient than the filter endpoint for direct lookups — it calls `db.collection("companies").document(id).get()` rather than streaming the entire collection.

---

## CORS

`allow_origins=["*"]` is set for local development convenience. Before deploying to production, replace the wildcard with your actual frontend origin:

```python
allow_origins=["https://movingtech.ai"]
```

---

## Extending the Backend

### Adding a new filterable field

1. Add the field to `_doc_to_dict()` so it appears in every API response.
2. Add a `Query` parameter to `filter_software()`.
3. Add a matching condition inside `_matches_filters()`.
4. Add the field to the set comprehension in `get_filter_options()`.

### Adding a new endpoint

FastAPI route registration is straightforward:

```python
@app.get("/api/software/featured")
def get_featured():
    all_items = _fetch_all_docs()
    featured = [i for i in all_items if i.get("vendor_confirmed")]
    return {"items": featured[:6]}
```

### Improving search performance

Replace `_fetch_all_docs()` + Python filtering with:
- **Algolia** — index Firestore documents via a Cloud Function on write; query from FastAPI using the Algolia Python client.
- **Firestore compound queries** — viable for exact-match and array-contains filters; not suitable for partial text search.
- **Redis cache** — cache `_fetch_all_docs()` output for 60 seconds to cut Firestore reads on high-traffic pages.