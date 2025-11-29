#!/usr/bin/env python
# -*- coding: utf-8 -*-
from fastapi import APIRouter, Request, Header, HTTPException, status
from pydantic import BaseModel

from . import stripe_service
from ..balances import balance_service

# --- Router Setup ---
router = APIRouter()

# --- Request Models ---
class CheckoutRequest(BaseModel):
    user_id: str  # The user's wallet address
    amount_usd: int
    success_url: str = "http://localhost:3000/payment-success"  # Default for local dev
    cancel_url: str = "http://localhost:3000/payment-cancelled"  # Default for local dev

# --- API Endpoints ---

@router.post("/billing/create-checkout-session")
def create_checkout_session(checkout_request: CheckoutRequest):
    """
    Creates a Stripe checkout session for a user to purchase compute credits.
    """
    try:
        session = stripe_service.create_stripe_checkout_session(
            user_id=checkout_request.user_id,
            amount_usd=checkout_request.amount_usd,
            success_url=checkout_request.success_url,
            cancel_url=checkout_request.cancel_url
        )
        return {"checkout_url": session.url}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create Stripe session.")

@router.get("/billing/balance/{user_id}")
def get_user_balance(user_id: str):
    """
    Retrieves the user's internal credit balance.
    """
    balance = balance_service.get_balance(user_id)
    return {"user_id": user_id, "balance_usd": balance}

@router.post("/billing/webhook")
async def stripe_webhook(request: Request, stripe_signature: str = Header(None)):
    """
    Handles incoming webhooks from Stripe to credit user accounts upon successful payment.
    """
    payload = await request.body()
    try:
        event = stripe_service.verify_webhook_signature(payload=payload, sig_header=stripe_signature)
    except ValueError as e:
        print(f"Webhook signature verification failed: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid signature.")

    # Handle the event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        if session['payment_status'] == 'paid':
            user_id = session['client_reference_id']
            amount_usd = session['amount_total'] / 100  # Convert from cents
            
            if user_id and amount_usd > 0:
                print(f"--- Checkout Session Succeeded: Crediting Account ---")
                print(f"User ID (Wallet): {user_id}")
                print(f"Amount (USD): ${amount_usd}")
                
                # Credit the user's internal balance
                balance_service.add_credits(user_id=user_id, amount_usd=amount_usd)
            else:
                print("Webhook Error: Missing user_id or zero amount from session.")
    else:
        print(f"Unhandled Stripe event type: {event['type']}")

    return {"status": "ok"}
