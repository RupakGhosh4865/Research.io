from fastapi import APIRouter, Request, Depends, Header, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from svix.webhooks import Webhook, WebhookVerificationError
import stripe
from app.database import get_db
from app.models.user import User
from app.models.research import CreditTransaction
from app.config import get_settings

router = APIRouter()
settings = get_settings()

stripe.api_key = settings.STRIPE_SECRET_KEY

@router.post("/clerk")
async def clerk_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    payload = await request.body()
    headers = request.headers
    
    svix_id = headers.get("svix-id")
    svix_timestamp = headers.get("svix-timestamp")
    svix_signature = headers.get("svix-signature")
    
    if not svix_id or not svix_timestamp or not svix_signature:
        raise HTTPException(status_code=400, detail="Missing svix headers")
        
    wh = Webhook(settings.CLERK_SECRET_KEY) 
    try:
        event = wh.verify(payload, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature
        })
    except WebhookVerificationError:
        raise HTTPException(status_code=400, detail="Invalid svix signature")
        
    event_type = event["type"]
    data = event["data"]
    
    if event_type == "user.created":
        email = data["email_addresses"][0]["email_address"]
        clerk_id = data["id"]
        
        customer = stripe.Customer.create(email=email, metadata={"clerk_id": clerk_id})
        
        new_user = User(
            clerk_id=clerk_id,
            email=email,
            credits_remaining=3,
            stripe_customer_id=customer.id
        )
        db.add(new_user)
        await db.commit()
    
    elif event_type == "user.updated":
        clerk_id = data["id"]
        email = data["email_addresses"][0]["email_address"]
        result = await db.execute(select(User).filter(User.clerk_id == clerk_id))
        user = result.scalars().first()
        if user:
            user.email = email
            await db.commit()
            
    elif event_type == "user.deleted":
        clerk_id = data["id"]
        result = await db.execute(select(User).filter(User.clerk_id == clerk_id))
        user = result.scalars().first()
        if user:
            await db.delete(user)
            await db.commit()

    return {"success": True}

@router.post("/stripe")
async def stripe_webhook(request: Request, stripe_signature: str = Header(None), db: AsyncSession = Depends(get_db)):
    payload = await request.body()
    try:
        event = stripe.Webhook.construct_event(
            payload, stripe_signature, settings.STRIPE_WEBHOOK_SECRET
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
        
    event_type = event["type"]
    data = event["data"]["object"]
    
    if event_type == "checkout.session.completed":
        customer_id = data.get("customer")
        result = await db.execute(select(User).filter(User.stripe_customer_id == customer_id))
        user = result.scalars().first()
        if user:
            user.credits_remaining += 10 # generic default implementation
            user.plan = "pro"
            
            tx = CreditTransaction(
                user_id=user.id,
                amount=10,
                type="stripe_purchase",
                stripe_payment_intent_id=data.get("payment_intent")
            )
            db.add(tx)
            await db.commit()
            
    elif event_type == "customer.subscription.deleted":
        customer_id = data.get("customer")
        result = await db.execute(select(User).filter(User.stripe_customer_id == customer_id))
        user = result.scalars().first()
        if user:
            user.plan = "free"
            await db.commit()

    return {"received": True}
