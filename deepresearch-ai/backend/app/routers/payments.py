from fastapi import APIRouter, Depends, HTTPException
import stripe
from app.config import get_settings
from app.middleware.auth import get_current_user
from app.models.user import User

router = APIRouter()
settings = get_settings()
stripe.api_key = settings.STRIPE_SECRET_KEY

@router.post("/create-checkout-session")
async def create_checkout_session(plan: str, user: User = Depends(get_current_user)):
    if plan not in ["starter", "pro"]:
        raise HTTPException(status_code=400, detail="Invalid plan")
    
    price_id = settings.STRIPE_STARTER_PRICE_ID if plan == "starter" else settings.STRIPE_PRO_PRICE_ID
    
    try:
        checkout_session = stripe.checkout.Session.create(
            customer=user.stripe_customer_id,
            customer_email=user.email if not user.stripe_customer_id else None,
            payment_method_types=['card'],
            line_items=[
                {
                    'price': price_id,
                    'quantity': 1,
                },
            ],
            mode='subscription',
            success_url=f"{settings.CORS_ORIGINS[0]}/dashboard?payment=success",
            cancel_url=f"{settings.CORS_ORIGINS[0]}/pricing?payment=cancelled",
            metadata={
                "user_id": str(user.id),
                "plan": plan
            }
        )
        return {"url": checkout_session.url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
