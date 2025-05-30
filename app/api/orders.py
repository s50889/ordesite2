from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.user import User
from app.models.order import Order
from app.models.response import OrderResponse
from app.utils.auth import get_current_user

router = APIRouter()

@router.get("/orders", response_model=List[OrderResponse])
async def get_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """注文一覧を取得"""
    orders = db.query(Order).filter(Order.user_id == current_user.id).all()
    return orders 