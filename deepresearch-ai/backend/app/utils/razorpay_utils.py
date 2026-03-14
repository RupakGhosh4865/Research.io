import razorpay
from app.config import get_settings

settings = get_settings()

def get_razorpay_client():
    return razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

def verify_razorpay_signature(payload: bytes, signature: str, secret: str):
    client = get_razorpay_client()
    return client.utility.verify_payment_signature({
        'razorpay_order_id': payload.get('razorpay_order_id'),
        'razorpay_payment_id': payload.get('razorpay_payment_id'),
        'razorpay_signature': signature
    })
