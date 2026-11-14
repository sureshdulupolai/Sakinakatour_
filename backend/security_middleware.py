import time
import collections
from typing import Dict, Deque
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse, Response
from config import settings

class AntiDDoSSecurityMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        # In-memory sliding window: IP -> Deque of timestamps
        self.request_history: Dict[str, Deque[float]] = collections.defaultdict(collections.deque)
        self.auth_history: Dict[str, Deque[float]] = collections.defaultdict(collections.deque)
        self.jailed_ips: Dict[str, float] = {}  # IP -> unjail timestamp

    async def dispatch(self, request: Request, call_next):
        # 1. Determine client IP (handles standard and proxy headers)
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            client_ip = forwarded.split(",")[0].strip()
        else:
            client_ip = request.client.host if request.client else "127.0.0.1"

        now = time.time()

        # 2. Check if IP is currently jailed (Flood Ban)
        if client_ip in self.jailed_ips:
            if now < self.jailed_ips[client_ip]:
                remaining = int(self.jailed_ips[client_ip] - now)
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={
                        "error": "IP_TEMPORARILY_BLOCKED",
                        "detail": f"Too many requests. Your IP is temporarily throttled. Retry in {remaining} seconds."
                    },
                    headers={"Retry-After": str(remaining)}
                )
            else:
                del self.jailed_ips[client_ip]

        # 3. Payload Body Size Guard (Prevents memory exhaustion attacks)
        content_length = request.headers.get("Content-Length")
        if content_length and int(content_length) > settings.MAX_REQUEST_SIZE_BYTES:
            return JSONResponse(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                content={"error": "PAYLOAD_TOO_LARGE", "detail": "Request body exceeds allowed limit (1MB max)."}
            )

        # 4. Sliding Window Rate Limiting
        # Clean timestamps older than 60 seconds
        window = 60.0
        ip_queue = self.request_history[client_ip]
        while ip_queue and (now - ip_queue[0]) > window:
            ip_queue.popleft()

        # If IP sent > 250 reqs in 60s, jail for 300 seconds (5 min)
        if len(ip_queue) > (settings.RATE_LIMIT_PER_MINUTE * 2):
            self.jailed_ips[client_ip] = now + 300
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"error": "FLOOD_DETECTED", "detail": "Aggressive traffic detected. Access blocked for 5 minutes."}
            )

        # Standard rate limit check
        if len(ip_queue) >= settings.RATE_LIMIT_PER_MINUTE:
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"error": "RATE_LIMIT_EXCEEDED", "detail": "Too many requests. Please slow down."},
                headers={"Retry-After": "60"}
            )

        ip_queue.append(now)

        # 5. Strict Auth Route Rate Limiting (OTP & Login)
        path = request.url.path
        if "/auth/" in path or "/admin/login" in path:
            auth_queue = self.auth_history[client_ip]
            while auth_queue and (now - auth_queue[0]) > window:
                auth_queue.popleft()
            if len(auth_queue) >= settings.AUTH_RATE_LIMIT_PER_MINUTE:
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={"error": "AUTH_RATE_LIMIT_EXCEEDED", "detail": "Too many verification attempts. Please wait 60 seconds."},
                    headers={"Retry-After": "60"}
                )
            auth_queue.append(now)

        # 6. Handshake Access Key Check on API endpoints
        # Protects internal API routes from external scraping bots
        if path.startswith("/api/"):
            client_key = request.headers.get("X-App-Client-Key")
            has_auth = request.headers.get("Authorization")
            # In production, require either valid client key or authorization header
            if settings.ENVIRONMENT == "production":
                if client_key != settings.CLIENT_ACCESS_KEY and not has_auth:
                    return JSONResponse(
                        status_code=status.HTTP_403_FORBIDDEN,
                        content={"error": "UNAUTHORIZED_CLIENT", "detail": "Direct automated access prohibited."}
                    )

        # Process the request
        response: Response = await call_next(request)

        # 7. Inject Hardened Security Headers on all responses
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # Prevent caching of sensitive booking or passenger state
        if path.startswith("/api/"):
            response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, proxy-revalidate"
            response.headers["Pragma"] = "no-cache"

        return response

