from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException
from core.config import settings

# 🔐 bcrypt (with safe handling)
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# --- In-memory user store (replace with DB in production) ---
USERS_DB: dict = {}


# ✅ Hash password (FIX applied)
def hash_password(password: str) -> str:
    if len(password.encode("utf-8")) > 72:
        raise ValueError("Password too long (max 72 bytes for bcrypt)")
    return pwd_context.hash(password)


# ✅ Verify password (FIX applied)
def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain[:72], hashed)


# 🔐 JWT token creation
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


# 🔐 Decode token
def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None


# 👤 Get user
def get_user(email: str) -> Optional[dict]:
    return USERS_DB.get(email)


# 👤 Create user
def create_user(email: str, password: str, name: str, role: str = "user") -> dict:
    if email in USERS_DB:
        raise ValueError("User already exists")

    user = {
        "email": email,
        "name": name,
        "hashed_password": hash_password(password),
        "role": role,
        "department": "General",
        "member_since": datetime.utcnow().isoformat(),
    }

    USERS_DB[email] = user
    return {k: v for k, v in user.items() if k != "hashed_password"}


# 🔐 Authenticate user
def authenticate_user(email: str, password: str) -> Optional[dict]:
    user = get_user(email)
    if not user:
        return None

    if not verify_password(password, user["hashed_password"]):
        return None

    return {k: v for k, v in user.items() if k != "hashed_password"}


# 🔐 RBAC check
def check_domain_access(user: dict, domain: str) -> bool:
    if user.get("role") == "admin":
        return True

    user_dept = user.get("department", "General").lower().replace(" ", "_")
    return domain in ("general", "global", user_dept)