"""
ADSMedia Flask Integration
Send emails via ADSMedia API from Flask applications

pip install flask requests
"""

import os
import requests
from typing import Optional, List, Dict, Any
from functools import wraps
from flask import Flask, request, jsonify, g, current_app

API_BASE_URL = "https://api.adsmedia.live/v1"


class ADSMediaClient:
    """ADSMedia API Client"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }

    def _request(self, method: str, endpoint: str, data: Dict = None) -> Dict[str, Any]:
        url = f"{API_BASE_URL}{endpoint}"
        
        if method == "GET":
            response = requests.get(url, headers=self.headers, params=data, timeout=30)
        else:
            response = requests.post(url, headers=self.headers, json=data, timeout=30)
        
        result = response.json()
        if not result.get("success"):
            raise Exception(result.get("error", {}).get("message", "ADSMedia API Error"))
        
        return result.get("data", {})

    def send(self, to: str, subject: str, html: str, **kwargs) -> Dict[str, Any]:
        payload = {"to": to, "subject": subject, "html": html}
        payload.update(kwargs)
        return self._request("POST", "/send", payload)

    def send_batch(self, recipients: List[Dict], subject: str, html: str, **kwargs) -> Dict[str, Any]:
        payload = {"recipients": recipients, "subject": subject, "html": html}
        payload.update(kwargs)
        return self._request("POST", "/send/batch", payload)

    def check_suppression(self, email: str) -> Dict[str, Any]:
        return self._request("GET", "/suppressions/check", {"email": email})

    def ping(self) -> Dict[str, Any]:
        return self._request("GET", "/ping")


class ADSMedia:
    """Flask extension for ADSMedia"""
    
    def __init__(self, app: Flask = None):
        self.app = app
        if app is not None:
            self.init_app(app)

    def init_app(self, app: Flask):
        app.config.setdefault('ADSMEDIA_API_KEY', os.environ.get('ADSMEDIA_API_KEY'))
        app.extensions['adsmedia'] = self
        
        @app.before_request
        def before_request():
            g.adsmedia = self.get_client()

    def get_client(self) -> ADSMediaClient:
        api_key = current_app.config['ADSMEDIA_API_KEY']
        if not api_key:
            raise ValueError("ADSMEDIA_API_KEY not configured")
        return ADSMediaClient(api_key)


# Blueprint with email routes
def create_email_blueprint():
    from flask import Blueprint
    
    bp = Blueprint('email', __name__, url_prefix='/email')

    @bp.route('/send', methods=['POST'])
    def send_email():
        try:
            data = request.json
            result = g.adsmedia.send(
                to=data['to'],
                subject=data['subject'],
                html=data['html'],
            )
            return jsonify({'success': True, 'data': result})
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @bp.route('/check')
    def check_suppression():
        try:
            email = request.args.get('email')
            result = g.adsmedia.check_suppression(email)
            return jsonify({'success': True, 'data': result})
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @bp.route('/ping')
    def ping():
        try:
            result = g.adsmedia.ping()
            return jsonify({'success': True, 'data': result})
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    return bp


# Example app
if __name__ == '__main__':
    app = Flask(__name__)
    app.config['ADSMEDIA_API_KEY'] = os.environ.get('ADSMEDIA_API_KEY')
    
    adsmedia = ADSMedia(app)
    app.register_blueprint(create_email_blueprint())
    
    app.run(debug=True)

