"""
Configuration API endpoints
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, validator
from typing import Optional

router = APIRouter()


class ThresholdConfig(BaseModel):
    water_level_min_cm: float = Field(..., ge=0, le=300)
    water_level_max_cm: float = Field(..., ge=0, le=300)
    temp_min_c: float = Field(..., ge=-40, le=80)
    temp_max_c: float = Field(..., ge=-40, le=80)
    humidity_min_pct: float = Field(..., ge=0, le=100)
    humidity_max_pct: float = Field(..., ge=0, le=100)
    gas_threshold_ppm: float = Field(..., ge=0, le=10000)
    battery_min_v: float = Field(..., ge=0, le=5)
    battery_max_v: float = Field(..., ge=0, le=5)

    @validator('water_level_max_cm')
    def water_max_gt_min(cls, v, values):
        if 'water_level_min_cm' in values and v <= values['water_level_min_cm']:
            raise ValueError('water_level_max_cm must be greater than water_level_min_cm')
        return v

    @validator('temp_max_c')
    def temp_max_gt_min(cls, v, values):
        if 'temp_min_c' in values and v <= values['temp_min_c']:
            raise ValueError('temp_max_c must be greater than temp_min_c')
        return v

    @validator('humidity_max_pct')
    def humidity_max_gt_min(cls, v, values):
        if 'humidity_min_pct' in values and v <= values['humidity_min_pct']:
            raise ValueError('humidity_max_pct must be greater than humidity_min_pct')
        return v

    @validator('battery_max_v')
    def battery_max_gt_min(cls, v, values):
        if 'battery_min_v' in values and v <= values['battery_min_v']:
            raise ValueError('battery_max_v must be greater than battery_min_v')
        return v


class CalibrationConfig(BaseModel):
    water_level: Optional[dict] = None
    gas: Optional[dict] = None
    temperature: Optional[dict] = None
    humidity: Optional[dict] = None
    battery: Optional[dict] = None


# Default thresholds
DEFAULT_THRESHOLDS = ThresholdConfig(
    water_level_min_cm=10,
    water_level_max_cm=200,
    temp_min_c=0,
    temp_max_c=50,
    humidity_min_pct=20,
    humidity_max_pct=80,
    gas_threshold_ppm=1000,
    battery_min_v=3.3,
    battery_max_v=4.2,
)

DEFAULT_CALIBRATION = CalibrationConfig(
    water_level={"slope": 58.0, "offset": -2.5},
    gas={"r0": 10.0, "slope": -0.45, "intercept": 1.2},
    temperature={"offset": 0.0},
    humidity={"offset": 0.0},
    battery={"divider_ratio": 11.0, "adc_ref": 5.0, "offset": 0.0},
)

# In-memory storage for demo (replace with database)
current_thresholds = DEFAULT_THRESHOLDS
current_calibration = DEFAULT_CALIBRATION


router = APIRouter()


@router.get("/thresholds")
async def get_thresholds():
    return current_thresholds


@router.post("/thresholds")
async def update_thresholds(config: ThresholdConfig):
    global current_thresholds
    current_thresholds = config
    return {"success": True, "message": "Thresholds updated", "config": config}


@router.get("/calibration")
async def get_calibration():
    return current_calibration


@router.post("/calibration")
async def update_calibration(config: CalibrationConfig):
    global current_calibration
    # Merge with existing calibration
    update_data = config.dict(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:
            setattr(current_calibration, key, value)
    return {"success": True, "message": "Calibration updated", "config": current_calibration}