from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from fastapi import Depends
from typing import Annotated

DbSession = Annotated[AsyncSession, Depends(get_db)]
