"""
TerraSentinel — Data Sources Router
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import DataSource
from schemas import DataSourceOut

router = APIRouter(prefix="/api", tags=["Data Sources"])


@router.get("/data-sources", response_model=List[DataSourceOut])
def list_data_sources(db: Session = Depends(get_db)):
    return db.query(DataSource).all()
