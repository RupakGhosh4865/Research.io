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

@router.post("/razorpay")
async def razorpay_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    payload = await request.body()
    # Razorpay recommends verifying the signature for every webhook
    # For simplicity, we'll verify the signature provided in the payment response on the frontend 
    # OR handle the payment.captured event here.
    
    # In a typical Razorpay flow, the frontend sends the payment_id and order_id to a verification endpoint
    # Let's add a separate verification endpoint in payments.py or handle it here if it's a standard webhook.
    
    # If this is a standard webhook (payment.captured)
    import json
    data = json.loads(payload)
    
    # Verify signature if RAZORPAY_WEBHOOK_SECRET is set
    if settings.RAZORPAY_WEBHOOK_SECRET:
        signature = request.headers.get("X-Razorpay-Signature")
        if not signature:
             raise HTTPException(status_code=400, detail="Missing signature")
        # Signature verification logic here...
    
    event = data.get("event")
    if event == "payment.captured":
        payment = data["payload"]["payment"]["entity"]
        order_id = payment.get("order_id")
        # Find user by order notes or custom lookup
        notes = data["payload"]["payment"]["entity"].get("notes", {})
        user_id = notes.get("user_id")
        plan = notes.get("plan")
        
        if user_id:
            from app.models.user import PlanType
            result = await db.execute(select(User).filter(User.id == user_id))
            user = result.scalars().first()
            if user:
                user.plan = PlanType(plan)
                if plan == 'test':
                    user.credits_remaining += 10
                elif plan == 'starter':
                    user.credits_remaining += 30
                elif plan == 'pro':
                    user.credits_remaining += 50
                await db.commit()
                
    return {"status": "success"}

@router.post("/razorpay-verify")
async def razorpay_verify(data: dict, db: AsyncSession = Depends(get_db)):
    # Manual verification endpoint called from frontend
    from app.utils.razorpay_utils import get_razorpay_client
    import hmac
    import hashlib

    order_id = data.get("razorpay_order_id")
    payment_id = data.get("razorpay_payment_id")
    signature = data.get("razorpay_signature")
    user_id = data.get("user_id")
    plan = data.get("plan")

    # Verify signature
    msg = f"{order_id}|{payment_id}"
    expected_signature = hmac.new(
        key=settings.RAZORPAY_KEY_SECRET.encode(),
        msg=msg.encode(),
        digestmod=hashlib.sha256
    ).hexdigest()

    if expected_signature != signature:
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Update user
    from app.models.user import PlanType
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalars().first()
    if user:
        user.plan = PlanType(plan)
        if plan == 'test':
            user.credits_remaining += 10
        elif plan == 'starter':
            user.credits_remaining += 30
        elif plan == 'pro':
            user.credits_remaining += 50
        await db.commit()
        return {"status": "success"}
    
    raise HTTPException(status_code=404, detail="User not found")
