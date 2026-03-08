from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import stripe
from app.config import get_settings
from app.middleware.auth import get_current_user
from app.models.user import User

router = APIRouter()
settings = get_settings()

stripe.api_key = settings.STRIPE_SECRET_KEY

class CheckoutReq(BaseModel):
    price_id: str
    success_url: str
    cancel_url: str

@router.post("/create-checkout-session")
async def create_checkout(req: CheckoutReq, user: User = Depends(get_current_user)):
    try:
        if not user.stripe_customer_id:
            customer = stripe.Customer.create(email=user.email, metadata={"user_id": str(user.id)})
            customer_id = customer.id
            # NOTE: this should be updated in DB, skipping for brevity
        else:
            customer_id = user.stripe_customer_id
            
        session = stripe.checkout.Session.create(
            mode="payment",
            line_items=[{"price": req.price_id, "quantity": 1}],
            metadata={"user_id": str(user.id), "price_id": req.price_id},
            success_url=req.success_url,
            cancel_url=req.cancel_url,
            customer=customer_id
        )
        return {"checkout_url": session.url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
