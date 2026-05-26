from datetime import datetime
from typing import Any, Literal
from pydantic import BaseModel, field_validator


VALID_INDICATORS = ["RSI", "SMA", "EMA", "BBANDS"]
VALID_OPERATORS = ["<", ">", "<=", ">=",
                   "==", "crosses_above", "crosses_below"]
VALID_ACTIONS = ["BUY", "SELL"]


class ConditionSchema(BaseModel):
    """A single condition in a strategy."""
    indicator: str
    period: int
    operator: str
    value: float | str  # float for a number, "close"/"open" for price reference

    @field_validator("indicator")
    @classmethod
    def validate_indicator(cls, v: str) -> str:
        if v.upper() not in VALID_INDICATORS:
            raise ValueError(f"indicator must be one of {VALID_INDICATORS}")
        return v.upper()

    @field_validator("operator")
    @classmethod
    def validate_operator(cls, v: str) -> str:
        if v not in VALID_OPERATORS:
            raise ValueError(f"operator must be one of {VALID_OPERATORS}")
        return v


class StrategyCreate(BaseModel):
    name: str
    description: str | None = None
    conditions: list[ConditionSchema]
    action: Literal["BUY", "SELL"]
    condition_logic: Literal["AND", "OR"] = "AND"
    created_by: str | None = None


class StrategyUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    conditions: list[ConditionSchema] | None = None
    action: Literal["BUY", "SELL"] | None = None
    condition_logic: Literal["AND", "OR"] | None = None


class StrategyOut(BaseModel):
    id: int
    name: str
    description: str | None
    conditions: list[dict[str, Any]]
    action: str
    condition_logic: str
    created_by: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
