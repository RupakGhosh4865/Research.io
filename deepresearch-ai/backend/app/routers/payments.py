from fastapi import APIRouter, Depends, HTTPException
from app.config import get_settings
from app.middleware.auth import get_current_user
from app.models.user import User
from app.utils.razorpay_utils import get_razorpay_client

router = APIRouter()
settings = get_settings()

@router.post("/create-order")
async def create_order(plan: str, user: User = Depends(get_current_user)):
    if plan not in ["test", "starter", "pro"]:
        raise HTTPException(status_code=400, detail="Invalid plan")
    
    if plan == "test":
        amount = settings.RAZORPAY_TEST_AMOUNT
    elif plan == "starter":
        amount = settings.RAZORPAY_STARTER_AMOUNT
    else:
        amount = settings.RAZORPAY_PRO_AMOUNT
    
    try:
        client = get_razorpay_client()
        order_data = {
            "amount": amount,
            "currency": "INR",
            "receipt": f"rcpt_{str(user.id)[:10]}_{plan}",
            "notes": {
                "user_id": str(user.id),
                "plan": plan
            }
        }
        order = client.order.create(data=order_data)
        return {
            "order_id": order["id"],
            "amount": amount,
            "currency": "INR",
            "key_id": settings.RAZORPAY_KEY_ID,
            "user_email": user.email,
            "user_name": user.email.split('@')[0]  # Placeholder for name
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
