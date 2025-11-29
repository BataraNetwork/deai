#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os
import stripe
from dotenv import load_dotenv

# --- Initialization ---
load_dotenv()

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")

if not stripe.api_key:
    print("Warning: STRIPE_SECRET_KEY is not set. Billing functions will not work.")
if not webhook_secret:
    print("Warning: STRIPE_WEBHOOK_SECRET is not set. Webhook verification will fail.")


# --- Public Functions ---

def create_stripe_checkout_session(user_id: str, amount_usd: int, success_url: str, cancel_url: str):
    """
    Creates a new Stripe Checkout Session for a one-time payment.

    Args:
        user_id: The unique identifier for the user in your system (e.g., wallet address).
        amount_usd: The amount in USD to charge (will be converted to cents).
        success_url: The URL to redirect the user to after a successful payment.
        cancel_url: The URL to redirect the user to if they cancel the payment.

    Returns:
        A Stripe Checkout Session object.
    """
    if not stripe.api_key:
        raise ValueError("Stripe API key is not configured.")

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': 'DeAI Compute Credits',
                        'description': 'Purchase credits for running AI inference tasks on the DeAI network.',
                    },
                    'unit_amount': amount_usd * 100,  # Amount in cents
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=success_url,
            cancel_url=cancel_url,
            # Attach the user_id to the session so we know who to credit upon success
            client_reference_id=user_id
        )
        return session
    except Exception as e:
        print(f"Error creating Stripe session: {e}")
        raise

def verify_webhook_signature(payload: bytes, sig_header: str) -> stripe.Event:
    """
    Verifies the signature of an incoming webhook from Stripe.

    Args:
        payload: The raw request body.
        sig_header: The value of the 'Stripe-Signature' header.

    Returns:
        The parsed Stripe Event object.

    Raises:
        ValueError: If the signature is invalid.
    """
    if not webhook_secret:
        raise ValueError("Stripe webhook secret is not configured.")

    try:
        event = stripe.Webhook.construct_event(
            payload=payload, sig_header=sig_header, secret=webhook_secret
        )
        return event
    except stripe.error.SignatureVerificationError as e:
        raise ValueError("Invalid webhook signature.") from e
