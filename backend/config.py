import os
from pathlib import Path
from dotenv import load_dotenv

env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

class Settings:
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Obfuscated / configurable API Prefix
    API_PREFIX: str = os.getenv("API_PREFIX", "/api/v1")
    CLIENT_ACCESS_KEY: str = os.getenv("CLIENT_ACCESS_KEY", "yatra_prod_sec_token_99x88")

    # Anti-DDoS Rate Limiting & Payload Guards
    RATE_LIMIT_PER_MINUTE: int = int(os.getenv("RATE_LIMIT_PER_MINUTE", "120"))
    AUTH_RATE_LIMIT_PER_MINUTE: int = int(os.getenv("AUTH_RATE_LIMIT_PER_MINUTE", "5"))
    MAX_REQUEST_SIZE_BYTES: int = int(os.getenv("MAX_REQUEST_SIZE_BYTES", "1048576")) # 1MB limit
    DOCS_ENABLED: bool = os.getenv("DOCS_ENABLED", "true").lower() in ("true", "1", "yes")

    # JWT Security
    JWT_SECRET: str = os.getenv("JWT_SECRET", "diwali-yatra-super-secret-key-2026-secure-token")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_EXPIRE_DAYS: int = int(os.getenv("JWT_EXPIRE_DAYS", "30"))

    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./tour_data.db")
    
    ADMIN_PHONE: str = os.getenv("ADMIN_PHONE", "9999999999")
    ADMIN_NAME: str = os.getenv("ADMIN_NAME", "Suresh Bhai (Tour Organizer)")
    ADMIN_SECRET_KEY: str = os.getenv("ADMIN_SECRET_KEY", "yatra_admin_2026_secure")

    EXPOSE_DEMO_OTP: bool = os.getenv("EXPOSE_DEMO_OTP", "true").lower() in ("true", "1", "yes")
    DEMO_OTP_CODE: str = os.getenv("DEMO_OTP_CODE", "123456")

    SMS_GATEWAY_API_KEY: str = os.getenv("SMS_GATEWAY_API_KEY", "")
    SMS_SENDER_ID: str = os.getenv("SMS_SENDER_ID", "")

    UPI_VPA: str = os.getenv("UPI_VPA", "sakinakadiwali@upi")
    UPI_NAME: str = os.getenv("UPI_NAME", "Sakinaka Diwali Yatra Sangh")

    ORGANIZER_PHONE: str = os.getenv("ORGANIZER_PHONE", "+91 98200 45678")
    ORGANIZER_ALT_PHONE: str = os.getenv("ORGANIZER_ALT_PHONE", "+91 98200 12345")
    ORGANIZER_EMAIL: str = os.getenv("ORGANIZER_EMAIL", "sakinakadiwalitour@gmail.com")
    EMERGENCY_HELPLINE: str = os.getenv("EMERGENCY_HELPLINE", "+91 98200 99999")

    WHATSAPP_GROUP_URL: str = os.getenv("WHATSAPP_GROUP_URL", "https://chat.whatsapp.com/G51k2L4x9diwaliYatraGroup")
    INSTAGRAM_PROFILE_URL: str = os.getenv("INSTAGRAM_PROFILE_URL", "https://instagram.com/sakinakadiwalitour")

    ALLOWED_ORIGINS_RAW: str = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000")
    
    @property
    def ALLOWED_ORIGINS(self) -> list:
        return [o.strip() for o in self.ALLOWED_ORIGINS_RAW.split(",") if o.strip()]

settings = Settings()
