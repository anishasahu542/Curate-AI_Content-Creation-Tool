from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import json
import os
import random
from datetime import datetime, timedelta

router = APIRouter()

DATABASE_FILE = "billing.json"

class VerifyPaymentRequest(BaseModel):
    cardNumber: str
    cardExpiry: str
    cardCvv: str
    cardHolder: str
    planName: str
    amount: str

class BuyCreditsRequest(BaseModel):
    cardNumber: str
    cardExpiry: str
    cardCvv: str
    cardHolder: str
    creditsAmount: int
    priceAmount: str

def _load_billing():
    if not os.path.exists(DATABASE_FILE):
        default_data = {
            "profile": {
                "plan": "Creator Premium",
                "creditsUsed": 1450,
                "creditsTotal": 5000,
                "renewsOn": (datetime.now() + timedelta(days=30)).strftime('%B %d, %Y')
            },
            "invoices": [
                {
                  "id": "INV-2026-001",
                  "date": datetime.now().strftime('%Y-%m-%d'),
                  "amount": "$19.00",
                  "plan": "Creator Premium",
                  "status": "Paid",
                  "paymentMethod": "Visa **** 4242"
                }
            ]
        }
        _save_billing(default_data)
        return default_data
        
    try:
        with open(DATABASE_FILE, "r") as f:
            return json.load(f)
    except:
        return {}

def _save_billing(data):
    with open(DATABASE_FILE, "w") as f:
        json.dump(data, f, indent=4)

@router.get("/state")
async def get_billing_state():
    """Retrieve current subscription plan, credits status, and transaction history."""
    return _load_billing()

@router.post("/checkout")
async def process_checkout(request: VerifyPaymentRequest):
    """Simulate payment checkout validation and update plan parameters."""
    # Basic payment details validation simulation
    clean_card = request.cardNumber.replace(" ", "")
    if len(clean_card) < 15 or len(clean_card) > 19:
        raise HTTPException(status_code=400, detail="Invalid card number length. Must be between 15 and 19 digits.")
        
    if not request.cardExpiry or "/" not in request.cardExpiry:
        raise HTTPException(status_code=400, detail="Invalid card expiration date. Use MM/YY format.")
        
    if len(request.cardCvv) < 3 or len(request.cardCvv) > 4:
        raise HTTPException(status_code=400, detail="Invalid CVV code. Must be 3 or 4 digits.")
        
    if not request.cardHolder.strip():
        raise HTTPException(status_code=400, detail="Cardholder name cannot be empty.")

    # Determine mock credit allocations based on plan name
    plan_lower = request.planName.lower().strip()
    if "premium" in plan_lower:
        credits_allocated = 5000
    elif "pro" in plan_lower:
        credits_allocated = 15000
    elif "enterprise" in plan_lower or "agency" in plan_lower:
        credits_allocated = 50000
    elif "free" in plan_lower or "starter" in plan_lower:
        credits_allocated = 500
    else:
        credits_allocated = 5000 # default fallback

    # Determine Card Brand
    first_digit = clean_card[0] if clean_card else "4"
    card_brand = "Visa"
    if first_digit == "5":
        card_brand = "Mastercard"
    elif first_digit == "3":
        card_brand = "Amex"
    elif first_digit == "6":
        card_brand = "Discover"

    data = _load_billing()
    
    # Update active plan
    data["profile"] = {
        "plan": request.planName.strip(),
        "creditsUsed": 0, # Reset usage on upgrade
        "creditsTotal": credits_allocated,
        "renewsOn": (datetime.now() + timedelta(days=30)).strftime('%B %d, %Y')
    }

    # Generate receipt invoice
    new_invoice = {
        "id": f"INV-2026-{random.randint(100, 999)}",
        "date": datetime.now().strftime('%Y-%m-%d'),
        "amount": request.amount,
        "plan": request.planName.strip(),
        "status": "Paid",
        "paymentMethod": f"{card_brand} **** {clean_card[-4:]}"
    }
    
    # Prepend new invoice
    data["invoices"].insert(0, new_invoice)
    
    _save_billing(data)
    
    return {"status": "success", "message": f"Successfully subscribed to {request.planName}!", "data": data}

@router.post("/buy-credits")
async def buy_addon_credits(request: BuyCreditsRequest):
    """Simulate credit add-on transactions."""
    clean_card = request.cardNumber.replace(" ", "")
    if len(clean_card) < 15 or len(clean_card) > 19:
        raise HTTPException(status_code=400, detail="Invalid card number length.")
    if len(request.cardCvv) < 3 or len(request.cardCvv) > 4:
        raise HTTPException(status_code=400, detail="Invalid CVV code.")

    first_digit = clean_card[0] if clean_card else "4"
    card_brand = "Visa"
    if first_digit == "5":
        card_brand = "Mastercard"
    elif first_digit == "3":
        card_brand = "Amex"

    data = _load_billing()
    
    # Update credits
    data["profile"]["creditsTotal"] += request.creditsAmount
    
    # Create invoice for credits add-on
    new_invoice = {
        "id": f"INV-CR-{random.randint(100, 999)}",
        "date": datetime.now().strftime('%Y-%m-%d'),
        "amount": request.priceAmount,
        "plan": f"+{request.creditsAmount:,} Add-on Credits",
        "status": "Paid",
        "paymentMethod": f"{card_brand} **** {clean_card[-4:]}"
    }
    
    data["invoices"].insert(0, new_invoice)
    _save_billing(data)
    
    return {"status": "success", "message": f"Successfully purchased {request.creditsAmount:,} credits!", "data": data}
