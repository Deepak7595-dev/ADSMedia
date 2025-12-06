from typing import Any, Union
import requests
from dify_plugin.entities.tool import ToolInvokeMessage
from dify_plugin import Tool


class CheckSuppressionTool(Tool):
    def _invoke(
        self, 
        user_id: str, 
        tool_parameters: dict[str, Any]
    ) -> Union[ToolInvokeMessage, list[ToolInvokeMessage]]:
        """
        Check email suppression status
        """
        api_key = self.runtime.credentials.get("api_key")
        if not api_key:
            return self.create_text_message("Error: API key not configured")
        
        email = tool_parameters.get("email")
        if not email:
            return self.create_text_message("Error: email is required")
        
        try:
            response = requests.get(
                "https://api.adsmedia.live/v1/suppressions/check",
                headers={"Authorization": f"Bearer {api_key}"},
                params={"email": email},
                timeout=30,
            )
            data = response.json()
            
            if data.get("success"):
                if data["data"].get("suppressed"):
                    return self.create_text_message(
                        f"⚠️ Email SUPPRESSED\n"
                        f"Email: {email}\n"
                        f"Reason: {data['data'].get('reason', 'Unknown')}"
                    )
                else:
                    return self.create_text_message(
                        f"✅ Email OK\n"
                        f"Email {email} is NOT suppressed - safe to send!"
                    )
            else:
                return self.create_text_message(f"❌ Error: {data.get('error', 'Unknown error')}")
        except Exception as e:
            return self.create_text_message(f"❌ Error: {str(e)}")

