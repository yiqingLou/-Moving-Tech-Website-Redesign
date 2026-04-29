"""
main.py  -  FastAPI backend for MovingTech.ai
"""

from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
import os, json

import firebase_admin
from firebase_admin import credentials, firestore

creds_json = os.getenv("GOOGLE_APPLICATION_CREDENTIALS_JSON")
if creds_json:
    creds_dict = json.loads(creds_json)
    cred = credentials.Certificate(creds_dict)
else:
    cred = credentials.Certificate("serviceAccountKey.json")

firebase_admin.initialize_app(cred)
db = firestore.client()

app = FastAPI(title="MovingTech.ai API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def _bool_flag(val) -> Optional[str]:
    if val is None:
        return None
    return "Y" if bool(val) else "N"

def _doc_to_dict(doc) -> dict:
    d = doc.to_dict()
    if d is None:
        return {}

    features_raw = d.get("features", {}) or {}
    sales        = features_raw.get("sales", {}) or {}
    move_mgmt    = features_raw.get("move_management", {}) or {}
    ops          = features_raw.get("operations", {}) or {}
    erp          = features_raw.get("erp", {}) or {}

    target_market    = d.get("target_market", []) or []
    deployment_types = d.get("deployment_types", []) or []
    languages        = d.get("languages", []) or []
    keywords         = d.get("keywords", []) or []
    status_block     = d.get("status", {}) or {}

    return {
        "id":          doc.id,
        "name":        d.get("name"),
        "website":     d.get("website"),
        "description": d.get("description"),
        "typology":    d.get("software_typology"),
        "best_for":    ", ".join(target_market) if target_market else None,
        "install":     ", ".join(deployment_types) if deployment_types else None,
        "language":    ", ".join(languages) if languages else None,
        "status":      status_block.get("review_status"),
        "features": {
            "lead_mgmt":   _bool_flag(sales.get("lead_management")),
            "surveying":   _bool_flag(sales.get("surveying")),
            "quoting":     _bool_flag(sales.get("quoting")),
            "job_booking": _bool_flag(move_mgmt.get("job_booking")),
            "move_mgmt":   _bool_flag(move_mgmt.get("move_mgmt")),
            "dispatch":    _bool_flag(ops.get("dispatch")),
            "shipments":   _bool_flag(ops.get("shipment")),
            "crew_app":    _bool_flag(ops.get("crew_app")),
            "storage":     _bool_flag(ops.get("storage")),
            "ar":          _bool_flag(erp.get("accounts_receivable")),
            "ap":          _bool_flag(erp.get("accounts_payable")),
            "hr":          _bool_flag(erp.get("hr")),
        },
        "notes":    d.get("notes_and_features"),
        "keywords": ", ".join(keywords) if keywords else None,
        "coverage_scores":  d.get("coverage_scores"),
        "vendor_confirmed": status_block.get("vendor_confirmed"),
        "target_market":    target_market,
        "deployment_types": deployment_types,
        "languages":        languages,
    }

def _fetch_all_docs() -> List[dict]:
    docs = db.collection("companies").stream()
    return [_doc_to_dict(doc) for doc in docs]

def _matches_text(item: dict, query: str) -> bool:
    query = query.lower()
    return (
        query in (item.get("name") or "").lower()
        or query in (item.get("description") or "").lower()
        or query in (item.get("keywords") or "").lower()
    )

def _matches_filters(item: dict, filters: dict) -> bool:
    for field in ("typology", "best_for", "install", "language"):
        val = filters.get(field)
        if val:
            item_val = (item.get(field) or "").lower()
            if val.lower() not in item_val:
                return False
    if filters.get("status"):
        if (item.get("status") or "").lower() != filters["status"].lower():
            return False
    for key in ("lead_mgmt", "dispatch", "crew_app", "storage", "surveying"):
        val = filters.get(key)
        if val is None:
            continue
        feature_val = (item.get("features") or {}).get(key)
        expected = "Y" if val else "N"
        if feature_val != expected:
            return False
    return True

def _sort_items(items: list, sort_by: str) -> list:
    """Sort all matched items before pagination."""
    if sort_by == "verified_first":
        return sorted(items, key=lambda x: (
            0 if (x.get("status") or "").lower() == "verified" else 1,
            (x.get("name") or "").lower()
        ))
    elif sort_by == "unverified_first":
        return sorted(items, key=lambda x: (
            1 if (x.get("status") or "").lower() == "verified" else 0,
            (x.get("name") or "").lower()
        ))
    elif sort_by == "name_asc":
        return sorted(items, key=lambda x: (x.get("name") or "").lower())
    elif sort_by == "name_desc":
        return sorted(items, key=lambda x: (x.get("name") or "").lower(), reverse=True)
    return items

def _paginate(items: list, page: int, page_size: int) -> dict:
    total = len(items)
    start = (page - 1) * page_size
    return {
        "page": page,
        "pageSize": page_size,
        "total": total,
        "items": items[start : start + page_size],
    }

@app.get("/api/software/search")
def search_software(
    q: str = Query(..., min_length=1),
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=50),
    sort_by: str = Query("verified_first"),
):
    all_items = _fetch_all_docs()
    matched = [item for item in all_items if _matches_text(item, q.strip())]
    matched = _sort_items(matched, sort_by)
    return _paginate(matched, page, pageSize)

@app.get("/api/software/filter")
def filter_software(
    typology:  Optional[str]  = Query(None),
    best_for:  Optional[str]  = Query(None),
    install:   Optional[str]  = Query(None),
    language:  Optional[str]  = Query(None),
    status:    Optional[str]  = Query(None),
    lead_mgmt: Optional[bool] = Query(None),
    dispatch:  Optional[bool] = Query(None),
    crew_app:  Optional[bool] = Query(None),
    storage:   Optional[bool] = Query(None),
    surveying: Optional[bool] = Query(None),
    sort_by:   str            = Query("verified_first"),
    page:      int            = Query(1, ge=1),
    pageSize:  int            = Query(20, ge=1, le=50),
):
    filters = {
        "typology":  typology,
        "best_for":  best_for,
        "install":   install,
        "language":  language,
        "status":    status,
        "lead_mgmt": lead_mgmt,
        "dispatch":  dispatch,
        "crew_app":  crew_app,
        "storage":   storage,
        "surveying": surveying,
    }
    all_items = _fetch_all_docs()
    matched = [item for item in all_items if _matches_filters(item, filters)]
    matched = _sort_items(matched, sort_by)
    return _paginate(matched, page, pageSize)

@app.get("/api/software/options")
def get_filter_options():
    all_items = _fetch_all_docs()
    typologies = sorted({item["typology"] for item in all_items if item.get("typology")})
    best_fors  = sorted({item["best_for"] for item in all_items if item.get("best_for")})
    installs   = sorted({item["install"]  for item in all_items if item.get("install")})
    languages  = sorted({item["language"] for item in all_items if item.get("language")})
    statuses   = sorted({item["status"]   for item in all_items if item.get("status")})
    return {
        "typology": typologies,
        "best_for": best_fors,
        "install":  installs,
        "language": languages,
        "status":   statuses,
    }

@app.get("/api/software/{company_id}")
def get_software_by_id(company_id: str):
    doc = db.collection("companies").document(company_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Software profile not found.")
    return _doc_to_dict(doc)
