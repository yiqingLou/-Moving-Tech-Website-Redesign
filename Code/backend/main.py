from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SOFTWARE = [
    {"id": "1", "name": "Move", "description": " moving companies"},
    {"id": "2", "name": "SmartMove", "description": "Dispatch management"},
 
]

@app.get("/api/software/search")
def search_software(
    q: str = Query(..., min_length=1),
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=50),
):
    query = q.strip().lower()
    if not query:
        raise HTTPException(status_code=400, detail="Missing query parameter: q")

    matched = [
        s for s in SOFTWARE
        if query in s["name"].lower() or query in (s.get("description") or "").lower()
    ]

    total = len(matched)
    start = (page - 1) * pageSize
    items = matched[start:start + pageSize]

    return {"page": page, "pageSize": pageSize, "total": total, "items": items}