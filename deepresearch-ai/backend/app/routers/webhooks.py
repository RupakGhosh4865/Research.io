from fastapi import APIRouter, Request, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from svix.webhooks import Webhook, WebhookVerificationError
from app.database import get_db
from app.models.user import User
from app.config import get_settings

router = APIRouter()
settings = get_settings()

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
        
        new_user = User(
            clerk_id=clerk_id,
            email=email,
            credits_remaining=3
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

import stripe

@router.post("/stripe")
async def stripe_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    if not sig_header:
        raise HTTPException(status_code=400, detail="Missing stripe signature")
        
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        user_id = session.get('metadata', {}).get('user_id')
        plan = session.get('metadata', {}).get('plan')
        customer_id = session.get('customer')
        
        if user_id:
            from app.models.user import PlanType
            result = await db.execute(select(User).filter(User.id == user_id))
            user = result.scalars().first()
            if user:
                user.stripe_customer_id = customer_id
                user.plan = PlanType[plan]
                # Add credits based on plan
                if plan == 'starter':
                    user.credits_remaining += 50
                elif plan == 'pro':
                    user.credits_remaining += 200
                await db.commit()
                
    return {"status": "success"}
