#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Dependency injectors for the Node Engine service.

This file follows the dependency injection pattern, creating "provider" functions
that instantiate and return service instances. FastAPI's `Depends` system will
use these functions to manage service lifecycles.

This approach decouples the application logic from the concrete implementation
of its services, making the app more modular, testable, and maintainable.
"""

import os
import functools
from fastapi import HTTPException, status

# Import the refactored service class and its configuration variables
from .onchain.service import (
    OnChainService,
    RPC_URL,
    DEAI_TOKEN_CONTRACT_ADDRESS,
    OPERATOR_PRIVATE_KEY,
    OPERATOR_ADDRESS,
    DEAI_TOKEN_ABI
)


@functools.lru_cache(maxsize=1)
def get_onchain_service() -> OnChainService:
    """
    Dependency provider for the OnChainService.

    This function is responsible for instantiating the OnChainService with
    the required configuration from environment variables and ABI files.

    Using `lru_cache(maxsize=1)` makes this function behave like a singleton
    for the application's lifecycle. The first call will create the instance,
    and all subsequent calls within the same process will return the cached instance,
    avoiding expensive re-initialization.

    Raises:
        HTTPException: If the service cannot be initialized due to missing
                       configuration or connection errors, it raises a 503
                       Service Unavailable error, preventing the app from running
                       in a broken state.
    """
    try:
        return OnChainService(
            rpc_url=RPC_URL,
            contract_address=DEAI_TOKEN_CONTRACT_ADDRESS,
            operator_pk=OPERATOR_PRIVATE_KEY,
            operator_address=OPERATOR_ADDRESS,
            contract_abi=DEAI_TOKEN_ABI
        )
    except (ValueError, ConnectionError) as e:
        # If the on-chain service fails to initialize, the node cannot function.
        # This is a critical error, so we prevent the application from starting
        # or handling requests by raising a 503 Service Unavailable.
        print(f"CRITICAL: Failed to initialize OnChainService: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Could not initialize blockchain service: {e}"
        )
