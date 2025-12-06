"""
ADSMedia FastAPI Integration
Send emails via ADSMedia API from FastAPI applications

pip install fastapi requests
"""

import os
from typing import Optional, List
import requests
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, EmailStr

API_BASE_URL = "https://api.adsmedia.live/v1"


class EmailRequest(BaseModel):
    to: EmailStr
    subject: str
    html: str
    to_name: Optional[str] = None
    from_name: Optional[str] = None
    text: Optional[str] = None
    reply_to: Optional[str] = None


class BatchRecipient(BaseModel):
    email: EmailStr
    name: Optional[str] = None


class BatchEmailRequest(BaseModel):
    recipients: List[BatchRecipient]
    subject: str
    html: str
    text: Optional[str] = None
    preheader: Optional[str] = None
    from_name: Optional[str] = None


class ADSMediaClient:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }

    def _request(self, method: str, endpoint: str, data: dict = None) -> dict:
        url = f"{API_BASE_URL}{endpoint}"
        
        if method == "GET":
            response = requests.get(url, headers=self.headers, params=data, timeout=30)
        else:
            response = requests.post(url, headers=self.headers, json=data, timeout=30)
        
        result = response.json()
        if not result.get("success"):
            raise HTTPException(
                status_code=response.status_code,
                detail=result.get("error", {}).get("message", "ADSMedia API Error")
            )
        
        return result.get("data", {})

    def send(self, email: EmailRequest) -> dict:
        payload = email.dict(exclude_none=True)
        # Convert to API format
        if "to_name" in payload:
            payload["to_name"] = payload.pop("to_name")
        if "from_name" in payload:
            payload["from_name"] = payload.pop("from_name")
        if "reply_to" in payload:
            payload["reply_to"] = payload.pop("reply_to")
        
        return self._request("POST", "/send", payload)

    def send_batch(self, batch: BatchEmailRequest) -> dict:
        payload = batch.dict(exclude_none=True)
        if "from_name" in payload:
            payload["from_name"] = payload.pop("from_name")
        
        return self._request("POST", "/send/batch", payload)

    def check_suppression(self, email: str) -> dict:
        return self._request("GET", "/suppressions/check", {"email": email})

    def ping(self) -> dict:
        return self._request("GET", "/ping")

    def get_usage(self) -> dict:
        return self._request("GET", "/account/usage")


# Dependency
def get_adsmedia_client() -> ADSMediaClient:
    api_key = os.getenv("ADSMEDIA_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="ADSMEDIA_API_KEY not configured")
    return ADSMediaClient(api_key)


# Example FastAPI app with ADSMedia routes
def create_email_router():
    """Create FastAPI router with ADSMedia email endpoints"""
    from fastapi import APIRouter
    
    router = APIRouter(prefix="/email", tags=["email"])

    @router.post("/send")
    async def send_email(
        email: EmailRequest,
        client: ADSMediaClient = Depends(get_adsmedia_client)
    ):
        return client.send(email)

    @router.post("/send/batch")
    async def send_batch(
        batch: BatchEmailRequest,
        client: ADSMediaClient = Depends(get_adsmedia_client)
    ):
        return client.send_batch(batch)

    @router.get("/check")
    async def check_suppression(
        email: EmailStr,
        client: ADSMediaClient = Depends(get_adsmedia_client)
    ):
        return client.check_suppression(email)

    @router.get("/ping")
    async def ping(client: ADSMediaClient = Depends(get_adsmedia_client)):
        return client.ping()

    @router.get("/usage")
    async def get_usage(client: ADSMediaClient = Depends(get_adsmedia_client)):
        return client.get_usage()

    return router


# Example usage
if __name__ == "__main__":
    import uvicorn
    
    app = FastAPI(title="ADSMedia Email API")
    app.include_router(create_email_router())
    
    uvicorn.run(app, host="0.0.0.0", port=8000)

