from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from typing import Optional

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load data from Excel
df = pd.read_excel("Moving_and_Relocation_Software_Systems_NEW__1_.xlsx", sheet_name="Companies")

def clean_str(val):
    if pd.isna(val):
        return None
    return str(val).strip()

def row_to_dict(row):
    return {
        "id": str(row.name),
        "name": clean_str(row.get("Company Name")),
        "website": clean_str(row.get("Website")),
        "best_for": clean_str(row.get("BEST FOR")),
        "status": clean_str(row.get("Status")),
        "typology": clean_str(row.get("Software Typology")),
        "description": clean_str(row.get("Description")),
        "install": clean_str(row.get("INSTALL")),
        "language": clean_str(row.get("LANGUAGE")),
        "features": {
            "lead_mgmt": clean_str(row.get("LEAD MGMT")),
            "surveying": clean_str(row.get("SURVEYING")),
            "quoting": clean_str(row.get("QUOTING")),
            "job_booking": clean_str(row.get("JOB BOOKING")),
            "move_mgmt": clean_str(row.get("MOVE MGMT")),
            "dispatch": clean_str(row.get("DISPATCH")),
            "shipments": clean_str(row.get("SHIPMENTS")),
            "crew_app": clean_str(row.get("CREW APP")),
            "storage": clean_str(row.get("STORAGE")),
            "ar": clean_str(row.get("AR")),
            "ap": clean_str(row.get("AP")),
            "hr": clean_str(row.get("HR")),
        },
        "notes": clean_str(row.get("Notes and Features")),
        "keywords": clean_str(row.get("Keywords")),
    }


@app.get("/api/software/search")
def search_software(
    q: str = Query(..., min_length=1),
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=50),
):
    query = q.strip().lower()
    matched = df[
        df["Company Name"].str.lower().str.contains(query, na=False) |
        df["Description"].str.lower().str.contains(query, na=False) |
        df["Keywords"].str.lower().str.contains(query, na=False)
    ]
    total = len(matched)
    start = (page - 1) * pageSize
    items = [row_to_dict(row) for _, row in matched.iloc[start:start + pageSize].iterrows()]
    return {"page": page, "pageSize": pageSize, "total": total, "items": items}


@app.get("/api/software/filter")
def filter_software(
    typology: Optional[str] = Query(None, description="Software Typology, e.g. 'Moving ERP / CRM'"),
    best_for: Optional[str] = Query(None, description="Target market, e.g. 'Local', 'International'"),
    install: Optional[str] = Query(None, description="Deployment type, e.g. 'Cloud', 'Web Based', 'Native App'"),
    language: Optional[str] = Query(None, description="Language support, e.g. 'English', 'Multilingual'"),
    status: Optional[str] = Query(None, description="Verification status, e.g. 'KNOWN', 'UNVERIFIED'"),
    # Feature filters (Y = yes)
    lead_mgmt: Optional[bool] = Query(None, description="Has lead management"),
    dispatch: Optional[bool] = Query(None, description="Has dispatch"),
    crew_app: Optional[bool] = Query(None, description="Has crew app"),
    storage: Optional[bool] = Query(None, description="Has storage management"),
    surveying: Optional[bool] = Query(None, description="Has surveying"),
    # Pagination
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=50),
):
    result = df.copy()

    # Text-based filters (partial match, case-insensitive)
    if typology:
        result = result[result["Software Typology"].str.lower().str.contains(typology.lower(), na=False)]

    if best_for:
        result = result[result["BEST FOR"].str.lower().str.contains(best_for.lower(), na=False)]

    if install:
        result = result[result["INSTALL"].str.lower().str.contains(install.lower(), na=False)]

    if language:
        result = result[result["LANGUAGE"].str.lower().str.contains(language.lower(), na=False)]

    if status:
        result = result[result["Status"].str.lower() == status.lower()]

    # Feature filters: Y = has the feature
    feature_map = {
        "lead_mgmt": ("LEAD MGMT", lead_mgmt),
        "dispatch": ("DISPATCH", dispatch),
        "crew_app": ("CREW APP", crew_app),
        "storage": ("STORAGE", storage),
        "surveying": ("SURVEYING", surveying),
    }
    for _, (col, val) in feature_map.items():
        if val is True:
            result = result[result[col].str.upper() == "Y"]
        elif val is False:
            result = result[result[col].str.upper() == "N"]

    total = len(result)
    start = (page - 1) * pageSize
    items = [row_to_dict(row) for _, row in result.iloc[start:start + pageSize].iterrows()]

    return {"page": page, "pageSize": pageSize, "total": total, "items": items}


@app.get("/api/software/options")
def get_filter_options():
    """Return all available filter options for the frontend dropdowns."""
    return {
        "typology": sorted(df["Software Typology"].dropna().unique().tolist()),
        "best_for": sorted(df["BEST FOR"].dropna().unique().tolist()),
        "install": sorted(df["INSTALL"].dropna().unique().tolist()),
        "language": sorted(df["LANGUAGE"].dropna().unique().tolist()),
        "status": sorted(df["Status"].dropna().unique().tolist()),
    }