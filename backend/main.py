from fastapi import FastAPI, Depends, Request, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from sqlalchemy import Column, Integer, String, Text, Boolean, create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from pydantic import BaseModel, Field
from typing import List, Optional
import hashlib
import re
import os
import logging
import json
from dotenv import load_dotenv
from groq import Groq
import bcrypt

from itsdangerous import URLSafeTimedSerializer
from fastapi_mail import FastMail, ConnectionConfig, MessageSchema, MessageType

# Load environment variables
load_dotenv()

# -------------------------------------------------
# LOGGING SETUP
# -------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("meal-mitra")

# -------------------------------------------------
# APP SETUP
# -------------------------------------------------
app = FastAPI(title="Meal-Mitra API", version="1.1.0")

SECRET_KEY = os.getenv("SESSION_SECRET_KEY", "CHANGE_THIS_SECRET_KEY")
SALT = os.getenv("RESET_PASSWORD_SALT", "meal-mitra-reset-salt")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# SMTP Configuration
conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM"),
    MAIL_PORT=int(os.getenv("MAIL_PORT", 587)),
    MAIL_SERVER=os.getenv("MAIL_SERVER"),
    MAIL_STARTTLS=os.getenv("MAIL_STARTTLS", "True") == "True",
    MAIL_SSL_TLS=os.getenv("MAIL_SSL_TLS", "False") == "True",
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True,
    TEMPLATE_FOLDER=os.path.join(os.path.dirname(__file__), "templates")
)

serializer = URLSafeTimedSerializer(SECRET_KEY)

app.add_middleware(
    SessionMiddleware,
    secret_key=SECRET_KEY,
    same_site="lax",
    https_only=False
)

origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------
# PYDANTIC SCHEMAS
# -------------------------------------------------
class ParsedFood(BaseModel):
    food: Optional[str] = "unknown"
    quantity: Optional[str] = "unknown"
    location: Optional[str] = "unknown"
    safe_until: Optional[str] = None

class UserBase(BaseModel):
    username: str
    email: Optional[str] = None

class UserCreate(UserBase):
    email: str
    password: str

class UserResponse(UserBase):
    id: int
    email: str
    is_admin: bool
    class Config:
        from_attributes = True

class ForgotPassword(BaseModel):
    email: str

class ResetPassword(BaseModel):
    token: str
    new_password: str

class DonationBase(BaseModel):
    text: str
    lat: Optional[str] = None
    lng: Optional[str] = None

class DonationResponse(BaseModel):
    id: int
    user_id: int
    raw_text: str
    food: str
    quantity: str
    location: str
    safe_until: Optional[str]
    lat: Optional[str]
    lng: Optional[str]
    
    class Config:
        from_attributes = True

class ProfileResponse(BaseModel):
    user: UserResponse
    donations: List[DonationResponse]
    total_donations: int

# -------------------------------------------------
# DATABASE SETUP (DB IN PROJECT FOLDER)
# -------------------------------------------------
DATABASE_URL = "sqlite:///./app.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

import bcrypt

# -------------------------------------------------
# PASSWORD HASHING (bcrypt direct)
# -------------------------------------------------
def normalize_password(password: str) -> bytes:
    # bcrypt has a 72-byte limit. SHA256 digest is 32 bytes.
    return hashlib.sha256(password.encode("utf-8")).digest()

def hash_password(password: str) -> str:
    pwd_bytes = normalize_password(password)
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode("utf-8")

def verify_password(password: str, hashed: str) -> bool:
    try:
        pwd_bytes = normalize_password(password)
        return bcrypt.checkpw(pwd_bytes, hashed.encode("utf-8"))
    except Exception as e:
        print(f"Verification error: {e}")
        return False

# -------------------------------------------------
# DATABASE MODELS
# -------------------------------------------------
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    is_admin = Column(Boolean, default=False)

class Donation(Base):
    __tablename__ = "donations"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer)
    raw_text = Column(Text)
    food = Column(String)
    quantity = Column(String)
    location = Column(String)
    safe_until = Column(String)
    lat = Column(String, nullable=True)
    lng = Column(String, nullable=True)

Base.metadata.create_all(bind=engine)

# -------------------------------------------------
# DEPENDENCIES
# -------------------------------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(request: Request, db: Session = Depends(get_db)):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not logged in")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid session")

    return user

def get_admin_user(user: User = Depends(get_current_user)):
    if not user.is_admin:
        logger.warning(f"Unauthorized admin access attempt by user: {user.username}")
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# -------------------------------------------------
# FOOD PARSER (Groq AI)
# -------------------------------------------------
# -------------------------------------------------
# FOOD PARSER (Groq AI)
# -------------------------------------------------
def parse_food_text(text: str) -> ParsedFood:
    logger.info(f"Parsing food text: {text}")
    
    if not GROQ_API_KEY:
        logger.warning("GROQ_API_KEY not found. Falling back to regex parser.")
        # Fallback to simple regex if no API key
        text_lower = text.lower()
        quantity = "unknown"
        food = "unknown"
        location = "unknown"
        
        qty_match = re.search(r"(\d+\s?(kg|kgs|kilogram|plates|packets))", text_lower)
        if qty_match:
            quantity = qty_match.group(1)

        food_keywords = ["chawal", "rice", "dal", "sabzi", "roti", "bread"]
        for f in food_keywords:
            if f in text_lower:
                food = f
                break

        loc_match = re.search(r"(ghar|home|office|canteen)", text_lower)
        if loc_match:
            location = loc_match.group(1)

        return ParsedFood(
            food=food,
            quantity=quantity,
            location=location,
            safe_until=None
        )

    client = Groq(api_key=GROQ_API_KEY)
    
    prompt = f"""
    The following text is a food donation message in any language (e.g., English, Hindi, Marathi, etc.): "{text}"
    
    Extract the following details and return ONLY a JSON object:
    - food (The type of food mentioned, translated to English if possible)
    - quantity (The amount or weight mentioned, e.g., "10 kg", "2 packets")
    - location (The place or landmark mentioned)
    - safe_until (iso date or null if not mentioned)
    
    Example input: "office mein 10 kg chawal bacha hai"
    Example output: {{"food": "rice", "quantity": "10 kg", "location": "office", "safe_until": null}}
    """
    
    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        content = completion.choices[0].message.content
        logger.info(f"Groq API response: {content}")
        return ParsedFood.model_validate_json(content)
    except Exception as e:
        logger.error(f"Groq Parsing Error: {e}")
        return ParsedFood(food="unknown", quantity="unknown", location="unknown", safe_until=None)

# -------------------------------------------------
# AUTH ROUTES
# -------------------------------------------------
# -------------------------------------------------
# AUTH ROUTES
# -------------------------------------------------
@app.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
def register(
    username: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    username = username.strip().lower()
    email = email.strip().lower()
    logger.info(f"Registering user: {username} ({email})")
    if db.query(User).filter((User.username == username) | (User.email == email)).first():
        logger.warning(f"Registration failed: Username '{username}' or email '{email}' already exists")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Username or email already exists"
        )

    user = User(
        username=username,
        email=email,
        password=hash_password(password)
    )
    db.add(user)
    db.commit()

    return {"message": "User registered successfully"}

@app.post("/forgot-password", response_model=dict)
async def forgot_password(
    email: str = Form(...),
    db: Session = Depends(get_db)
):
    email = email.strip().lower()
    logger.info(f"Password reset requested for email: {email}")
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        # We return success even if user not found to prevent user enumeration
        logger.info(f"Email {email} not found, but returning success for security")
        return {"message": "Recovery email sent if the account exists"}

    token = serializer.dumps(email, salt=SALT)
    reset_url = f"http://localhost:3000/reset-password?token={token}"

    message = MessageSchema(
        subject="Meal Mitra - Password Reset",
        recipients=[email],
        template_body={"reset_url": reset_url},
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    try:
        await fm.send_message(message, template_name="password_reset_email.html")
        logger.info(f"HTML reset email sent to {email}")
    except Exception as e:
        logger.error(f"Failed to send email: {e}")
        raise HTTPException(status_code=500, detail="Failed to send email")

    return {"message": "Recovery email sent"}

@app.post("/reset-password", response_model=dict)
def reset_password(
    token: str = Form(...),
    new_password: str = Form(...),
    db: Session = Depends(get_db)
):
    try:
        email = serializer.loads(token, salt=SALT, max_age=3600)
    except Exception:
        logger.warning("Invalid or expired reset token")
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.password = hash_password(new_password)
    db.commit()
    logger.info(f"Password updated for user: {email}")

    return {"message": "Password updated successfully"}

@app.post("/login", response_model=dict)
def login(
    request: Request,
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    username = username.strip().lower()
    logger.info(f"Login attempt for user: {username}")
    user = db.query(User).filter(User.username == username).first()
    if not user or not verify_password(password, user.password):
        logger.warning(f"Login failed: Invalid credentials for user '{username}'")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid credentials"
        )

    request.session["user_id"] = user.id
    logger.info(f"User '{username}' logged in successfully (ID: {user.id})")
    return {"message": "Login successful"}

@app.post("/logout", response_model=dict)
def logout(request: Request):
    user_id = request.session.get("user_id")
    request.session.clear()
    logger.info(f"User ID {user_id} logged out")
    return {"message": "Logged out successfully"}

@app.get("/profile", response_model=ProfileResponse)
def get_profile(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    logger.info(f"Fetching profile for user: {user.username}")
    donations = db.query(Donation).filter(Donation.user_id == user.id).all()
    
    return {
        "user": user,
        "donations": donations,
        "total_donations": len(donations)
    }

# -------------------------------------------------
# DONATION ROUTE
# -------------------------------------------------
# -------------------------------------------------
# DONATION ROUTE
# -------------------------------------------------
@app.post("/donations", response_model=dict, status_code=status.HTTP_201_CREATED)
def donate_food(
    text: str = Form(...),
    lat: Optional[str] = Form(None),
    lng: Optional[str] = Form(None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    logger.info(f"User {user.username} (ID: {user.id}) is donating: {text}")
    parsed = parse_food_text(text)

    donation = Donation(
        user_id=user.id,
        raw_text=text,
        food=parsed.food or "unknown",
        quantity=parsed.quantity or "unknown",
        location=parsed.location or "unknown",
        safe_until=parsed.safe_until,
        lat=lat,
        lng=lng
    )

    db.add(donation)
    db.commit()
    db.refresh(donation)

    logger.info(f"Donation created successfully: ID {donation.id}")
    return {
        "donation_id": donation.id,
        "cleaned": parsed.model_dump()
    }

@app.get("/my-donations", response_model=List[DonationResponse])
def my_donations(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    logger.info(f"Fetching donations for user: {user.username}")
    return db.query(Donation).filter(Donation.user_id == user.id).all()

# -------------------------------------------------
# ADMIN ROUTES
# -------------------------------------------------
@app.get("/admin/users", response_model=List[UserResponse])
def admin_get_users(admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    logger.info(f"Admin {admin.username} is fetching all users")
    return db.query(User).all()

@app.get("/admin/donations", response_model=List[DonationResponse])
def admin_get_donations(admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    logger.info(f"Admin {admin.username} is fetching all donations")
    return db.query(Donation).all()

@app.delete("/admin/donations/{donation_id}", response_model=dict)
def admin_delete_donation(donation_id: int, admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    logger.info(f"Admin {admin.username} is deleting donation ID: {donation_id}")
    donation = db.query(Donation).filter(Donation.id == donation_id).first()
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")
    
    db.delete(donation)
    db.commit()
    return {"message": f"Donation {donation_id} deleted successfully"}

@app.post("/admin/promote/{user_id}", response_model=dict)
def admin_promote_user(user_id: int, admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    logger.info(f"Admin {admin.username} is promoting user ID: {user_id}")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_admin = True
    db.commit()
    return {"message": f"User {user.username} promoted to admin"}

@app.get("/")
def root():
    return {"status": "Meal-Mitra FastAPI backend (Admin Enabled) running", "version": "1.2.0"}
