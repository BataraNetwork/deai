#!/usr/bin/env python
# -*- coding: utf-8 -*-
import asyncio
import json
import threading
from pathlib import Path
from typing import Dict

# --- Constants ---
BALANCES_FILE = Path("balances.json")

# --- Thread-safe Balance Management ---
_lock = threading.Lock()
_balances: Dict[str, float] = {}

def _load_balances():
    """Loads the balances from the JSON file into memory."""
    # This function should be called within a lock.
    if BALANCES_FILE.exists():
        with open(BALANCES_FILE, 'r') as f:
            try:
                _balances = json.load(f)
            except json.JSONDecodeError:
                # If file is empty or corrupt, start with empty balances
                _balances = {}
    else:
        _balances = {}

def _save_balances():
    """Saves the current in-memory balances to the JSON file."""
    # This function should be called within a lock.
    with open(BALANCES_FILE, 'w') as f:
        json.dump(_balances, f, indent=4)

# --- Public API ---

def get_balance(user_id: str) -> float:
    """
    Retrieves the credit balance for a specific user.
    This operation is thread-safe and reads the latest data from the file.
    """
    with _lock:
        _load_balances()
        return _balances.get(user_id, 0.0)

def add_credits(user_id: str, amount_usd: float):
    """
    Adds credits to a user's balance in a thread-safe manner.
    """
    with _lock:
        _load_balances() # Load the latest state to avoid overwriting recent changes
        _balances[user_id] = _balances.get(user_id, 0.0) + amount_usd
        _save_balances() # Persist the change immediately
    print(f"Added ${amount_usd} to {user_id}. New balance: {_balances.get(user_id, 0.0)}")


async def check_and_debit_balance(user_id: str, amount_usd: float) -> bool:
    """
    Asynchronously checks for sufficient balance and deducts credits.
    This is the recommended method for use in async contexts like FastAPI.
    It runs the synchronous, thread-safe file operations in a separate thread.
    """
    def _sync_check_and_debit():
        with _lock:
            _load_balances()  # Load the latest state from disk
            current_balance = _balances.get(user_id, 0.0)
            if current_balance >= amount_usd:
                _balances[user_id] = current_balance - amount_usd
                _save_balances()  # Persist the change
                print(f"Used ${amount_usd} from {user_id}. Remaining balance: {_balances[user_id]}")
                return True
            else:
                print(f"Insufficient balance for {user_id}. Required: ${amount_usd}, has: ${current_balance}")
                return False

    # Run the synchronous, thread-safe function in a separate thread to avoid blocking the event loop
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(None, _sync_check_and_debit)


# --- Initial Load ---
# Perform an initial load when the module is imported.
with _lock:
    _load_balances()
