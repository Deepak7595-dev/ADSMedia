"""
ADSMedia Django Integration
Send emails via ADSMedia API from Django applications

pip install requests
"""

import os
import requests
from typing import Optional, List, Dict, Any

API_BASE_URL = "https://api.adsmedia.live/v1"


class ADSMediaClient:
    """ADSMedia API Client for Django"""
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.environ.get("ADSMEDIA_API_KEY")
        if not self.api_key:
            raise ValueError("ADSMEDIA_API_KEY not configured")
        
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

    def _request(self, method: str, endpoint: str, data: Dict = None) -> Dict[str, Any]:
        url = f"{API_BASE_URL}{endpoint}"
        
        if method == "GET":
            response = requests.get(url, headers=self.headers, params=data, timeout=30)
        elif method == "POST":
            response = requests.post(url, headers=self.headers, json=data, timeout=30)
        elif method == "PUT":
            response = requests.put(url, headers=self.headers, json=data, timeout=30)
        elif method == "DELETE":
            response = requests.delete(url, headers=self.headers, timeout=30)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        result = response.json()
        if not result.get("success"):
            raise Exception(result.get("error", {}).get("message", "ADSMedia API Error"))
        
        return result.get("data", {})

    def send(
        self,
        to: str,
        subject: str,
        html: str,
        to_name: str = None,
        from_name: str = None,
        text: str = None,
        reply_to: str = None,
    ) -> Dict[str, Any]:
        """Send a single email"""
        payload = {"to": to, "subject": subject, "html": html}
        if to_name:
            payload["to_name"] = to_name
        if from_name:
            payload["from_name"] = from_name
        if text:
            payload["text"] = text
        if reply_to:
            payload["reply_to"] = reply_to
        
        return self._request("POST", "/send", payload)

    def send_batch(
        self,
        recipients: List[Dict],
        subject: str,
        html: str,
        text: str = None,
        preheader: str = None,
        from_name: str = None,
    ) -> Dict[str, Any]:
        """Send batch emails"""
        payload = {"recipients": recipients, "subject": subject, "html": html}
        if text:
            payload["text"] = text
        if preheader:
            payload["preheader"] = preheader
        if from_name:
            payload["from_name"] = from_name
        
        return self._request("POST", "/send/batch", payload)

    def check_suppression(self, email: str) -> Dict[str, Any]:
        """Check if email is suppressed"""
        return self._request("GET", "/suppressions/check", {"email": email})

    def ping(self) -> Dict[str, Any]:
        """Test API connection"""
        return self._request("GET", "/ping")

    def get_usage(self) -> Dict[str, Any]:
        """Get usage statistics"""
        return self._request("GET", "/account/usage")


# Django email backend
class ADSMediaEmailBackend:
    """
    Django Email Backend using ADSMedia API
    
    settings.py:
        EMAIL_BACKEND = 'adsmedia.ADSMediaEmailBackend'
        ADSMEDIA_API_KEY = 'your-api-key'
        ADSMEDIA_FROM_NAME = 'My App'
    """
    
    def __init__(self, fail_silently=False, **kwargs):
        from django.conf import settings
        
        self.fail_silently = fail_silently
        self.api_key = getattr(settings, 'ADSMEDIA_API_KEY', None) or os.environ.get('ADSMEDIA_API_KEY')
        self.from_name = getattr(settings, 'ADSMEDIA_FROM_NAME', 'Django')
        
        if not self.api_key:
            raise ValueError("ADSMEDIA_API_KEY not configured")
        
        self.client = ADSMediaClient(self.api_key)

    def open(self):
        return True

    def close(self):
        pass

    def send_messages(self, email_messages):
        """Send one or more EmailMessage objects"""
        sent = 0
        
        for message in email_messages:
            try:
                html = message.body
                if hasattr(message, 'alternatives') and message.alternatives:
                    for content, mime in message.alternatives:
                        if mime == 'text/html':
                            html = content
                            break
                
                for recipient in message.to:
                    self.client.send(
                        to=recipient,
                        subject=message.subject,
                        html=html,
                        text=message.body if html != message.body else None,
                        from_name=self.from_name,
                        reply_to=message.reply_to[0] if message.reply_to else None,
                    )
                    sent += 1
                    
            except Exception as e:
                if not self.fail_silently:
                    raise
        
        return sent


# Get default client
_client = None

def get_client() -> ADSMediaClient:
    """Get singleton ADSMedia client"""
    global _client
    if _client is None:
        _client = ADSMediaClient()
    return _client

