from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from utils.auth import authenticate_user, create_access_token, create_user, decode_token, get_user

router = APIRouter(prefix="/auth", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str
    role: str = "user"


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict


def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = get_user(payload.get("sub", ""))
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return {k: v for k, v in user.items() if k != "hashed_password"}


@router.post("/register", response_model=TokenResponse)
def register(req: RegisterRequest):
    try:
        user = create_user(req.email, req.password, req.name, req.role)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    token = create_access_token({"sub": req.email})
    return {"access_token": token, "token_type": "bearer", "user": user}


@router.post("/login", response_model=TokenResponse)
def login(form: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form.username, form.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": form.username})
    return {"access_token": token, "token_type": "bearer", "user": user}


@router.get("/me")
def me(current_user: dict = Depends(get_current_user)):
    return current_user
