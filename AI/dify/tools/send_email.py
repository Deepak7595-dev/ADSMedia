from typing import Any, Union
import requests
from dify_plugin.entities.tool import ToolInvokeMessage
from dify_plugin import Tool


class SendEmailTool(Tool):
    def _invoke(
        self, 
        user_id: str, 
        tool_parameters: dict[str, Any]
    ) -> Union[ToolInvokeMessage, list[ToolInvokeMessage]]:
        """
        Send email via ADSMedia API
        """
        api_key = self.runtime.credentials.get("api_key")
        if not api_key:
            return self.create_text_message("Error: API key not configured")
        
        to = tool_parameters.get("to")
        subject = tool_parameters.get("subject")
        html = tool_parameters.get("html")
        
        if not to or not subject or not html:
            return self.create_text_message("Error: to, subject, and html are required")
        
        payload = {
            "to": to,
            "subject": subject,
            "html": html,
        }
        
        if tool_parameters.get("to_name"):
            payload["to_name"] = tool_parameters["to_name"]
        if tool_parameters.get("from_name"):
            payload["from_name"] = tool_parameters["from_name"]
        
        try:
            response = requests.post(
                "https://api.adsmedia.live/v1/send",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json=payload,
                timeout=30,
            )
            data = response.json()
            
            if data.get("success"):
                return self.create_text_message(
                    f"✅ Email sent successfully!\n"
                    f"To: {to}\n"
                    f"Subject: {subject}\n"
                    f"Message ID: {data['data']['message_id']}"
                )
            else:
                return self.create_text_message(f"❌ Error: {data.get('error', 'Unknown error')}")
        except Exception as e:
            return self.create_text_message(f"❌ Error: {str(e)}")

