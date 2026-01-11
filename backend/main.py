from fastapi import FastAPI, Depends, Request, Form, HTTPException, status, BackgroundTasks
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
import random
import string
from datetime import datetime, timedelta
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
tags_metadata = [
    {"name": "Auth", "description": "Operations for user and NGO authentication (Login, Register, Logout, Password Reset)."},
    {"name": "Profile", "description": "Operations for maintaining user-specific data (Profiles, Badges, History)."},
    {"name": "Donations", "description": "Core operations for submitting and claiming food donations."},
    {"name": "NGO", "description": "Operations specifically for NGOs (Register, Login, NGO-restricted profile)."},
    {"name": "Admin", "description": "Privileged operations for system administrators (User/Donation management)."},
    {"name": "General", "description": "General system operations."}
]

app = FastAPI(
    title="Meal-Mitra API", 
    version="1.1.0",
    openapi_tags=tags_metadata
)

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

# Production requires SameSite="None" and Secure=True for cross-site cookies
is_production = os.getenv("fastapi_env") == "production"

app.add_middleware(
    SessionMiddleware,
    secret_key=SECRET_KEY,
    same_site="none" if is_production else "lax",
    https_only=is_production  # True in prod (Render), False in dev (localhost)
)

origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "https://meal-mitra-pi.vercel.app",
]

# Add allowed origins from environment variable
env_origins = os.getenv("ALLOWED_ORIGINS")
if env_origins:
    origins.extend([origin.strip() for origin in env_origins.split(",")])

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
    cooked_at: Optional[str] = None
    price: Optional[float] = 0.0
    is_ngo_only: Optional[bool] = False

class UserBase(BaseModel):
    username: str
    email: Optional[str] = None
    address: Optional[str] = None
    phone_number: Optional[str] = None
    role: Optional[str] = "Individual" # Individual, Restaurant, Mess, Canteen, Hotel

class UserCreate(UserBase):
    email: str
    password: str
    fssai_license: Optional[str] = None
    document_proof: Optional[str] = None

class UserResponse(UserBase):
    id: int
    email: str
    is_admin: bool
    verification_status: str
    fssai_license: Optional[str]
    
    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    phone_number: Optional[str] = None

class ForgotPassword(BaseModel):
    email: str

class ResetPassword(BaseModel):
    token: str
    new_password: str

class DonationBase(BaseModel):
    text: str
    lat: Optional[str] = None
    lng: Optional[str] = None

class DonationUpdate(BaseModel):
    text: Optional[str] = None
    lat: Optional[str] = None
    lng: Optional[str] = None
    price: Optional[float] = None
    location: Optional[str] = None
    cooked_at: Optional[str] = None

class DonationResponse(BaseModel):
    id: int
    user_id: int
    raw_text: str
    food: str
    quantity: str
    location: str
    safe_until: Optional[str]
    cooked_at: Optional[str]
    lat: Optional[str]
    lng: Optional[str]
    price: float
    status: str
    is_ngo_only: bool
    
    class Config:
        from_attributes = True

class ProfileResponse(BaseModel):
    user: UserResponse
    donations: List[DonationResponse]
    total_donations: int
    meals_served: int = 0
    co2_reduced: float = 0.0
    kg_saved: float = 0.0

class BadgeResponse(BaseModel):
    id: int
    badge_name: str
    sanskrit_name: str
    slug: str
    description: str
    icon_url: str
    level: int
    unlocked_at: str
    class Config:
        from_attributes = True

class NGOBase(BaseModel):
    name: str
    email: str
    ngo_type: str
    id_proof: str
    address_proof: str
    address: Optional[str] = None
    phone_number: Optional[str] = None

class NGOCreate(NGOBase):
    password: str

class NGOUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    ngo_type: Optional[str] = None
    id_proof: Optional[str] = None
    address_proof: Optional[str] = None
    address: Optional[str] = None
    phone_number: Optional[str] = None

class NGOResponse(NGOBase):
    id: int
    registration_status: str
    
    class Config:
        from_attributes = True

class ChatRequest(BaseModel):
    message: str

# -------------------------------------------------
# DATABASE SETUP (DB IN PROJECT FOLDER)
# -------------------------------------------------
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")
# Render provides 'postgres://' but SQLAlchemy needs 'postgresql://'
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# connect_args is only needed for SQLite
connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args
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
    address = Column(String, nullable=True)
    phone_number = Column(String, nullable=True)
    
    # Organization specific fields
    role = Column(String, default="Individual")
    fssai_license = Column(String, nullable=True)
    document_proof = Column(String, nullable=True)
    verification_status = Column(String, default="Approved") # Individuals are auto-approved

class Donation(Base):
    __tablename__ = "donations"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer)
    raw_text = Column(Text)
    food = Column(String)
    quantity = Column(String)
    location = Column(String)
    safe_until = Column(String)
    cooked_at = Column(String, nullable=True)
    lat = Column(String, nullable=True)
    lng = Column(String, nullable=True)
    price = Column(Integer, default=0)
    status = Column(String, default="Available")
    is_ngo_only = Column(Boolean, default=False)
    
    # Verification details
    claimed_by_user_id = Column(Integer, nullable=True)
    claimed_by_ngo_id = Column(Integer, nullable=True)
    claim_secret = Column(String, nullable=True) # OTP
    otp_created_at = Column(String, nullable=True) # ISO Timestamp

class NGO(Base):
    __tablename__ = "ngos"
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    ngo_type = Column(String)
    id_proof = Column(String)
    address_proof = Column(String)
    registration_status = Column(String, default="Applied")
    certificate_id = Column(String, nullable=True)
    address = Column(String, nullable=True)
    phone_number = Column(String, nullable=True)

class UserBadge(Base):
    __tablename__ = "user_badges"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, index=True)
    badge_name = Column(String)
    sanskrit_name = Column(String)
    unlocked_at = Column(String)

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

def get_current_ngo(request: Request, db: Session = Depends(get_db)):
    ngo_id = request.session.get("ngo_id")
    if not ngo_id:
        raise HTTPException(status_code=401, detail="NGO Not logged in")

    ngo = db.query(NGO).filter(NGO.id == ngo_id).first()
    if not ngo:
        raise HTTPException(status_code=401, detail="Invalid NGO session")

    return ngo

def get_admin_user(user: User = Depends(get_current_user)):
    return user

# -------------------------------------------------
# REWARD & BADGE SYSTEM LOGIC
# -------------------------------------------------
from datetime import datetime

BADGE_DEFINITIONS = [
    # LEVEL 1
    {
        "name": "First Donation", 
        "sanskrit": "अन्नदाता (Annadātā)", 
        "slug": "annadata", 
        "description": "Unlocked on your very first food donation!", 
        "level": 1, 
        "type": "count", 
        "threshold": 1,
        "icon_url": "https://cdn-icons-png.flaticon.com/512/2913/2913501.png"
    },
    {
        "name": "Friendly Helper", 
        "sanskrit": "भोजनमित्रः (Bhojanamitraḥ)", 
        "slug": "bhojanamitra", 
        "description": "Rewarded after contributing 2 successful donations.", 
        "level": 1, 
        "type": "count", 
        "threshold": 2,
        "icon_url": "https://cdn-icons-png.flaticon.com/512/1256/1256650.png"
    },
    {
        "name": "Kind Heart", 
        "sanskrit": "करुणामयः (Karuṇāmayaḥ)", 
        "slug": "karunamaya", 
        "description": "Awarded for a donation manually verified as safe and high quality.", 
        "level": 1, 
        "type": "safe", 
        "threshold": 1,
        "icon_url": "https://cdn-icons-png.flaticon.com/512/2107/2107845.png"
    },
    
    # LEVEL 2
    {
        "name": "Hygiene Hero", 
        "sanskrit": "स्वच्छसेवकः (Svacchasevakaḥ)", 
        "slug": "svacchasevaka", 
        "description": "3 safe donations verified by our community and AI.", 
        "level": 2, 
        "type": "safe", 
        "threshold": 3,
        "icon_url": "https://cdn-icons-png.flaticon.com/512/2913/2913564.png"
    },
    {
        "name": "Food Protector", 
        "sanskrit": "अन्नरक्षकः (Annarakṣakaḥ)", 
        "slug": "annaraksaka", 
        "description": "Your food has been gratefully accepted by 5 different NGOs.", 
        "level": 2, 
        "type": "ngo_served", 
        "threshold": 5,
        "icon_url": "https://cdn-icons-png.flaticon.com/512/1152/1152912.png"
    },
    {
        "name": "Eco Friend", 
        "sanskrit": "धरामित्रः (Dharāmitraḥ)", 
        "slug": "dharamitra", 
        "description": "Environmental impact! You've saved over 10kg of food from wastage.", 
        "level": 2, 
        "type": "kg", 
        "threshold": 10,
        "icon_url": "https://cdn-icons-png.flaticon.com/512/2913/2913524.png"
    },
    
    # LEVEL 3
    {
        "name": "Hunger Fighter", 
        "sanskrit": "भूखहन्ता (Bhūkhahantā)", 
        "slug": "bhukhahanta", 
        "description": "An incredible milestone: You've served 25 meals to those in need.", 
        "level": 3, 
        "type": "meals", 
        "threshold": 25,
        "icon_url": "https://cdn-icons-png.flaticon.com/512/3063/3063822.png"
    },
    {
        "name": "Green Warrior", 
        "sanskrit": "हरितसेवकः (Haritasevakaḥ)", 
        "slug": "haritasevaka", 
        "description": "You've directly reduced 5kg of CO2 emissions through food recovery.", 
        "level": 3, 
        "type": "co2", 
        "threshold": 5,
        "icon_url": "https://cdn-icons-png.flaticon.com/512/2913/2913491.png"
    },
    {
        "name": "Public Servant", 
        "sanskrit": "लोकसेवकः (Lokasevakaḥ)", 
        "slug": "lokasevaka", 
        "description": "Building bridges: Served 5 unique NGOs in your community.", 
        "level": 3, 
        "type": "ngo_count", 
        "threshold": 5,
        "icon_url": "https://cdn-icons-png.flaticon.com/512/2913/2913504.png"
    },

    # LEVEL 4
    {
        "name": "Food Warrior", 
        "sanskrit": "अन्नवीरः (Annavīraḥ)", 
        "slug": "annavira", 
        "description": "50 meals served milestone! You're a true hunger fighter.", 
        "level": 4, 
        "type": "meals", 
        "threshold": 50,
        "icon_url": "https://cdn-icons-png.flaticon.com/512/2913/2913521.png"
    },
    {
        "name": "Jewel of Service", 
        "sanskrit": "सेवाशिरोमणिः (Sevāśiromaṇiḥ)", 
        "slug": "sevasiromani", 
        "description": "10+ verified donations. You're a jewel in our community.", 
        "level": 4, 
        "type": "verified", 
        "threshold": 10,
        "icon_url": "https://cdn-icons-png.flaticon.com/512/2913/2913507.png"
    },
    {
        "name": "Nature Protector", 
        "sanskrit": "प्रकृतिरक्षकः (Prakṛtirakṣakaḥ)", 
        "slug": "prakrtiraksaka", 
        "description": "20 kg food saved! Protecting nature one donation at a time.", 
        "level": 4, 
        "type": "kg", 
        "threshold": 20,
        "icon_url": "https://cdn-icons-png.flaticon.com/512/2913/2913511.png"
    },

    # LEVEL 5
    {
        "name": "Great Servant", 
        "sanskrit": "महासेवकः (Mahāsevakaḥ)", 
        "slug": "mahasevaka", 
        "description": "100+ meals served! Legendary commitment to the cause.", 
        "level": 5, 
        "type": "meals", 
        "threshold": 100,
        "icon_url": "https://cdn-icons-png.flaticon.com/512/2913/2913515.png"
    },
    {
        "name": "Life Giver", 
        "sanskrit": "अन्नसंजीवकः (Annasaṁjīvakaḥ)", 
        "slug": "annasamjivaka", 
        "description": "30+ kg food saved. You're giving life back to the planet.", 
        "level": 5, 
        "type": "kg", 
        "threshold": 30,
        "icon_url": "https://cdn-icons-png.flaticon.com/512/2913/2913519.png"
    },
    {
        "name": "Public Welfare Hero", 
        "sanskrit": "लोककल्याणकर्ता (Lokakalyāṇakartā)", 
        "slug": "lokakalyanakarta", 
        "description": "The ultimate honor for long-term consistent donors.", 
        "level": 5, 
        "type": "consistency", 
        "threshold": 1,
        "icon_url": "https://cdn-icons-png.flaticon.com/512/2913/2913523.png"
    },
]

def parse_kg(quantity_str: str) -> float:
    try:
        match = re.search(r"(\d+(\.\d+)?)\s*(kg|kgs|kilogram)", quantity_str.lower())
        if match:
            return float(match.group(1))
        return 0.0
    except:
        return 0.0

def calculate_user_impact(user_id: int, db: Session):
    donations = db.query(Donation).filter(Donation.user_id == user_id).all()
    claimed_donations = [d for d in donations if d.status == "Claimed"]
    
    total_kg = sum(parse_kg(d.quantity) for d in claimed_donations)
    total_meals = int(total_kg * 2) # Assume 1kg = 2 meals
    total_co2 = total_kg * 0.5 # Assume 1kg = 0.5kg CO2
    
    # NGOs served
    # donation.status is Claimed, but we don't store WHO claimed it in current schema.
    # To properly track NGOs served, we would need a claim record.
    # For now, let's assume any claimed donation counts as a generic NGO interaction 
    # if it was marked is_ngo_only, or just a successful donation otherwise.
    
    return {
        "kg_saved": total_kg,
        "meals_served": total_meals,
        "co2_reduced": total_co2,
        "money_saved": total_meals * 40, # Est 40 INR per meal
        "total_donations": len(donations),
        "claimed_count": len(claimed_donations),
        "safe_count": len([d for d in donations if d.food != "unknown"]) # Mock "safe" check
    }

async def send_badge_email(email: str, badge_info: dict):
    """Background task to send badge notification email."""
    logger.info(f"Preparing to send badge email to {email} for {badge_info['name']}")
    message = MessageSchema(
        subject=f"Meal Mitra Achievement: {badge_info['name']}!",
        recipients=[email],
        template_body={
            "badge_name": badge_info["name"],
            "sanskrit_name": badge_info["sanskrit"],
            "description": badge_info["description"],
            "icon_url": badge_info["icon_url"]
        },
        subtype=MessageType.html
    )
    fm = FastMail(conf)
    try:
        await fm.send_message(message, template_name="badge_notification_email.html")
        logger.info(f"Badge email successfully sent to {email}")
    except Exception as e:
        logger.error(f"Background email failed for {email}: {e}")

async def send_ngo_status_email(email: str, ngo_name: str, status: str):
    """Background task to send NGO approval/rejection email."""
    logger.info(f"Sending NGO status email to {email} ({status})")
    message = MessageSchema(
        subject=f"Meal Mitra NGO Registration: {status}",
        recipients=[email],
        template_body={
            "ngo_name": ngo_name,
            "status": status
        },
        subtype=MessageType.html
    )
    fm = FastMail(conf)
    try:
        await fm.send_message(message, template_name="ngo_verification_email.html")
        logger.info(f"NGO status email sent to {email}")
    except Exception as e:
        logger.error(f"Failed to send NGO status email to {email}: {e}")

async def send_donation_otp_email(email: str, otp: str, food_name: str, claimer_name: str):
    """Background task to send Donation OTP."""
    logger.info(f"Sending Donation OTP to {email}")
    message = MessageSchema(
        subject=f"Action Required: Verify Donation Handover (OTP: {otp})",
        recipients=[email],
        template_body={
            "otp": otp,
            "food_name": food_name,
            "claimer_name": claimer_name
        },
        subtype=MessageType.html
    )
    fm = FastMail(conf)
    try:
        await fm.send_message(message, template_name="donation_claim_email.html")
        logger.info(f"OTP email sent to {email}")
    except Exception as e:
        logger.error(f"Failed to send OTP email to {email}: {e}")

async def send_org_status_email(email: str, business_name: str, status: str):
    """Background task to send Organization approval/rejection email."""
    logger.info(f"Sending Organization status email to {email} ({status})")
    message = MessageSchema(
        subject=f"Meal Mitra Organization Registration: {status}",
        recipients=[email],
        template_body={
            "business_name": business_name,
            "status": status
        },
        subtype=MessageType.html
    )
    fm = FastMail(conf)
    try:
        await fm.send_message(message, template_name="org_verification_email.html")
        logger.info(f"Organization status email sent to {email}")
    except Exception as e:
        logger.error(f"Failed to send Organization status email to {email}: {e}")

def check_and_unlock_badges(user_id: int, db: Session, background_tasks: Optional[BackgroundTasks] = None):
    impact = calculate_user_impact(user_id, db)
    owned_badges = {b.badge_name for b in db.query(UserBadge).filter(UserBadge.user_id == user_id).all()}
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.email:
        logger.warning(f"Cannot check badges for user ID {user_id}: User not found or no email")
        return []

    new_badges_unlocked = []
    
    for defn in BADGE_DEFINITIONS:
        if defn["name"] in owned_badges:
            continue
            
        unlocked = False
        if defn["type"] == "count" and impact["total_donations"] >= defn["threshold"]:
            unlocked = True
        elif defn["type"] == "safe" and impact["safe_count"] >= defn["threshold"]:
            unlocked = True
        elif defn["type"] == "kg" and impact["kg_saved"] >= defn["threshold"]:
            unlocked = True
        elif defn["type"] == "meals" and impact["meals_served"] >= defn["threshold"]:
            unlocked = True
        elif defn["type"] == "co2" and impact["co2_reduced"] >= defn["threshold"]:
            unlocked = True
        elif defn["type"] == "ngo_served" and impact["claimed_count"] >= defn["threshold"]:
            unlocked = True
        elif defn["type"] == "verified" and impact["claimed_count"] >= defn["threshold"]: # Same for now
            unlocked = True
            
        if unlocked:
            badge = UserBadge(
                user_id=user_id,
                badge_name=defn["name"],
                sanskrit_name=defn["sanskrit"],
                unlocked_at=datetime.now().isoformat()
            )
            db.add(badge)
            new_badges_unlocked.append(defn)
            
    if new_badges_unlocked:
        db.commit()
        badge_names = [b["name"] for b in new_badges_unlocked]
        logger.info(f"User {user_id} unlocked new badges: {', '.join(badge_names)}")
        
        # Trigger background emails
        if background_tasks:
            for b_info in new_badges_unlocked:
                background_tasks.add_task(send_badge_email, user.email, b_info)
    
    return [b["name"] for b in new_badges_unlocked]

# -------------------------------------------------
# FOOD PARSER (Groq AI)
# -------------------------------------------------
# -------------------------------------------------
# FOOD PARSER (Groq AI)
# -------------------------------------------------
def parse_food_text(text: str, cooked_at: Optional[str] = None) -> ParsedFood:
    logger.info(f"Parsing food text: {text} (Cooked At: {cooked_at})")
    
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
            cooked_at=cooked_at,
            safe_until=None
        )

    client = Groq(api_key=GROQ_API_KEY)
    
    prompt = f"""
    The following text is a food donation message: "{text}"
    The user specified the food was cooked/bought at: "{cooked_at if cooked_at else 'Time not provided'}"
    
    Extract details and return ONLY a JSON object:
    - food (Type of food, translated to English)
    - quantity (Amount/Weight)
    - location (Place mentioned)
    - price (Expected price, 0 if free)
    - is_ngo_only (Boolean)
    - cooked_at (The provided cooked_at time, or null)
    - estimated_safety_hours (Integer: Estimate how many hours this specific food remains safe to consume at room temperature. e.g., Dal/Rice: 6, Bread: 24, Cooked Veg: 8, Milk: 4)
    - safe_until (ISO format timestamp: If cooked_at is provided, add estimated_safety_hours to it. If cooked_at is null, return null)
    
    Example input: "Dal Tadka", cooked_at="2026-01-10T10:00:00"
    Example output: {{"food": "Dal Tadka", "quantity": "unknown", "location": "unknown", "price": 0.0, "is_ngo_only": false, "cooked_at": "2026-01-10T10:00:00", "estimated_safety_hours": 8, "safe_until": "2026-01-10T18:00:00"}}
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
        return ParsedFood(food="unknown", quantity="unknown", location="unknown", cooked_at=cooked_at, safe_until=None)

# -------------------------------------------------
# AUTH ROUTES
# -------------------------------------------------
# -------------------------------------------------
# AUTH ROUTES
# -------------------------------------------------
@app.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED, tags=["Auth"])
def register(
    username: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    address: Optional[str] = Form(None),
    phone_number: Optional[str] = Form(None),
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
        password=hash_password(password),
        address=address,
        phone_number=phone_number
    )
    db.add(user)
    db.commit()

    return {"message": "User registered successfully"}

@app.post("/register/organization", response_model=dict, status_code=status.HTTP_201_CREATED, tags=["Auth"])
def register_organization(
    business_name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    role: str = Form(...), # Restaurant, Mess, Canteen
    fssai_license: str = Form(...),
    address: str = Form(...),
    phone_number: str = Form(...),
    db: Session = Depends(get_db)
):
    email = email.strip().lower()
    logger.info(f"Registering organization: {business_name} ({email}) as {role}")
    
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        username=business_name, # Use business name as username
        email=email,
        password=hash_password(password),
        address=address,
        phone_number=phone_number,
        role=role,
        fssai_license=fssai_license,
        verification_status="Applied" # Default pending
    )
    db.add(user)
    db.commit()

    return {"message": "Organization registered successfully. Please wait for admin verification."}

@app.post("/forgot-password", response_model=dict, tags=["Auth"])
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
    reset_url = f"https://meal-mitra-pi.vercel.app/reset-password?token={token}"

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

@app.post("/reset-password", response_model=dict, tags=["Auth"])
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

@app.post("/login", response_model=dict, tags=["Auth"])
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
    
    if user.verification_status != "Approved":
        logger.warning(f"Login denied: User '{username}' is {user.verification_status}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Account is {user.verification_status}. Please wait for admin verification."
        )

    request.session["user_id"] = user.id
    logger.info(f"User '{username}' logged in successfully (ID: {user.id})")
    return {"message": "Login successful"}

@app.post("/logout", response_model=dict, tags=["Auth"])
def logout(request: Request):
    user_id = request.session.get("user_id")
    request.session.clear()
    logger.info(f"User ID {user_id} logged out")
    return {"message": "Logged out successfully"}

@app.get("/profile", response_model=ProfileResponse, tags=["Profile"])
def get_profile(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    logger.info(f"Fetching profile for user: {user.username}")
    donations = db.query(Donation).filter(Donation.user_id == user.id).all()
    impact = calculate_user_impact(user.id, db)
    
    return {
        "user": user,
        "donations": donations,
        "total_donations": len(donations),
        "meals_served": impact["meals_served"],
        "co2_reduced": impact["co2_reduced"],
        "kg_saved": impact["kg_saved"]
    }

@app.get("/profile/badges", response_model=List[BadgeResponse], tags=["Profile"])
def get_user_badges(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    logger.info(f"Fetching enriched badges for user: {user.username}")
    user_badges = db.query(UserBadge).filter(UserBadge.user_id == user.id).all()
    
    enriched_badges = []
    # Create a lookup for definitions
    defn_lookup = {d["name"]: d for d in BADGE_DEFINITIONS}
    
    for ub in user_badges:
        defn = defn_lookup.get(ub.badge_name)
        if defn:
            enriched_badges.append({
                "id": ub.id,
                "badge_name": ub.badge_name,
                "sanskrit_name": ub.sanskrit_name,
                "slug": defn["slug"],
                "description": defn["description"],
                "icon_url": defn["icon_url"],
                "level": defn["level"],
                "unlocked_at": ub.unlocked_at
            })
            
    return enriched_badges

@app.patch("/profile", response_model=UserResponse, tags=["Profile"])
def patch_profile(update: UserUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    logger.info(f"Patching profile for user: {user.username}")
    if update.username is not None:
        user.username = update.username.strip().lower()
    if update.email is not None:
        user.email = update.email.strip().lower()
    if update.address is not None:
        user.address = update.address
    if update.phone_number is not None:
        user.phone_number = update.phone_number
    db.commit()
    db.refresh(user)
    return user

@app.put("/profile", response_model=UserResponse, tags=["Profile"])
def put_profile(update: UserUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    logger.info(f"Updating profile for user: {user.username}")
    user.username = update.username.strip().lower() if update.username else user.username
    user.email = update.email.strip().lower() if update.email else user.email
    user.address = update.address if update.address else user.address
    user.phone_number = update.phone_number if update.phone_number else user.phone_number
    db.commit()
    db.refresh(user)
    return user

# -------------------------------------------------
# NGO ROUTES
# -------------------------------------------------
@app.post("/ngo/register", response_model=dict, status_code=status.HTTP_201_CREATED, tags=["NGO"])
async def ngo_register(
    name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    ngo_type: str = Form(...),
    id_proof: str = Form(...),
    address_proof: str = Form(...),
    address: Optional[str] = Form(None),
    phone_number: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    name = name.strip()
    email = email.strip().lower()
    logger.info(f"Registering NGO: {name} ({email})")
    
    if db.query(NGO).filter((NGO.name == name) | (NGO.email == email)).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="NGO name or email already exists"
        )

    new_ngo = NGO(
        name=name,
        email=email,
        password=hash_password(password),
        ngo_type=ngo_type,
        id_proof=id_proof,
        address_proof=address_proof,
        registration_status="Applied",
        address=address,
        phone_number=phone_number
    )
    db.add(new_ngo)
    db.commit()
    return {"message": "NGO registered and application status: Applied"}

@app.post("/ngo/login", response_model=dict, tags=["NGO"])
def ngo_login(
    request: Request,
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    email = email.strip().lower()
    logger.info(f"NGO Login attempt for: {email}")
    ngo = db.query(NGO).filter(NGO.email == email).first()
    
    if not ngo or not verify_password(password, ngo.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid NGO credentials"
        )

    request.session["ngo_id"] = ngo.id
    logger.info(f"NGO '{ngo.name}' logged in successfully (ID: {ngo.id})")
    return {"message": "NGO Login successful"}

@app.get("/ngo/profile", response_model=NGOResponse, tags=["NGO"])
def ngo_profile(ngo: NGO = Depends(get_current_ngo)):
    return ngo

@app.patch("/ngo/profile", response_model=NGOResponse, tags=["NGO"])
def patch_ngo_profile(update: NGOUpdate, ngo: NGO = Depends(get_current_ngo), db: Session = Depends(get_db)):
    logger.info(f"Patching NGO profile for: {ngo.name}")
    if update.name is not None:
        ngo.name = update.name.strip()
    if update.email is not None:
        ngo.email = update.email.strip().lower()
    if update.ngo_type is not None:
        ngo.ngo_type = update.ngo_type
    if update.id_proof is not None:
        ngo.id_proof = update.id_proof
    if update.address_proof is not None:
        ngo.address_proof = update.address_proof
    if update.address is not None:
        ngo.address = update.address
    if update.phone_number is not None:
        ngo.phone_number = update.phone_number
    db.commit()
    db.refresh(ngo)
    return ngo

@app.put("/ngo/profile", response_model=NGOResponse, tags=["NGO"])
def put_ngo_profile(update: NGOUpdate, ngo: NGO = Depends(get_current_ngo), db: Session = Depends(get_db)):
    logger.info(f"Updating NGO profile for: {ngo.name}")
    ngo.name = update.name.strip() if update.name else ngo.name
    ngo.email = update.email.strip().lower() if update.email else ngo.email
    ngo.ngo_type = update.ngo_type if update.ngo_type else ngo.ngo_type
    ngo.id_proof = update.id_proof if update.id_proof else ngo.id_proof
    ngo.address_proof = update.address_proof if update.address_proof else ngo.address_proof
    ngo.address = update.address if update.address else ngo.address
    ngo.phone_number = update.phone_number if update.phone_number else ngo.phone_number
    db.commit()
    db.refresh(ngo)
    return ngo

# -------------------------------------------------
# DONATION ROUTE
# -------------------------------------------------
# -------------------------------------------------
# DONATION ROUTE
# -------------------------------------------------
@app.post("/donations", response_model=dict, status_code=status.HTTP_201_CREATED, tags=["Donations"])
def donate_food(
    background_tasks: BackgroundTasks,
    text: str = Form(...),
    cooked_at: Optional[str] = Form(None),
    lat: Optional[str] = Form(None),
    lng: Optional[str] = Form(None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    logger.info(f"User {user.username} (ID: {user.id}) is donating: {text}")
    parsed = parse_food_text(text, cooked_at=cooked_at)

    donation = Donation(
        user_id=user.id,
        raw_text=text,
        food=parsed.food or "unknown",
        quantity=parsed.quantity or "unknown",
        location=parsed.location or "unknown",
        safe_until=parsed.safe_until,
        cooked_at=parsed.cooked_at or cooked_at,
        lat=lat,
        lng=lng,
        price=parsed.price or 0,
        is_ngo_only=parsed.is_ngo_only or False
    )

    db.add(donation)
    db.commit()
    db.refresh(donation)
    
    # Check for badges (Annadātā, Friendly Helper, Kind Heart etc.)
    check_and_unlock_badges(user.id, db, background_tasks)

    logger.info(f"Donation created successfully: ID {donation.id}")
    return {
        "donation_id": donation.id,
        "cleaned": parsed.model_dump()
    }

@app.post("/donations/{donation_id}/claim", response_model=dict, tags=["Donations"])
def claim_donation(
    donation_id: int,
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    # Try to get either user or NGO from session
    user_id = request.session.get("user_id")
    ngo_id = request.session.get("ngo_id")

    if not user_id and not ngo_id:
        raise HTTPException(status_code=401, detail="Must be logged in as User or NGO to claim")

    donation = db.query(Donation).filter(Donation.id == donation_id).first()
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")
    
    if donation.status != "Available":
        raise HTTPException(status_code=400, detail="Donation is no longer available")

    # Business Logic for NGO-Only
    if donation.is_ngo_only:
        if not ngo_id:
            raise HTTPException(status_code=403, detail="This donation is restricted to NGOs only")
        
        # Check if NGO is Approved
        ngo = db.query(NGO).filter(NGO.id == ngo_id).first()
        if not ngo or ngo.registration_status != "Approved":
            raise HTTPException(status_code=403, detail="Only Approved NGOs can claim restricted donations. Please wait for admin verification.")

        # NGOs get it for free
        logger.info(f"NGO ID {ngo_id} ({ngo.name}) is claiming NGO-only donation ID: {donation_id}")
    else:
        # Public donation
        if user_id:
             logger.info(f"User ID {user_id} is claiming public donation ID: {donation_id}")
        elif ngo_id:
             logger.info(f"NGO ID {ngo_id} is claiming public donation ID: {donation_id}")
    
    # Generate OTP
    otp = "".join(random.choices(string.digits, k=6))
    
    donation.status = "Claimed"
    donation.claim_secret = otp
    donation.otp_created_at = datetime.utcnow().isoformat()
    
    if ngo_id:
        donation.claimed_by_ngo_id = ngo_id
        claimer = db.query(NGO).filter(NGO.id == ngo_id).first()
        claimer_name = claimer.name
        claimer_email = claimer.email
    else:
        donation.claimed_by_user_id = user_id
        claimer = db.query(User).filter(User.id == user_id).first()
        claimer_name = claimer.username
        claimer_email = claimer.email
        
    db.commit()
    
    # Send OTP to Donor and Claimer
    donor = db.query(User).filter(User.id == donation.user_id).first()
    if donor:
        background_tasks.add_task(send_donation_otp_email, donor.email, otp, donation.food, claimer_name)
    background_tasks.add_task(send_donation_otp_email, claimer_email, otp, donation.food, claimer_name)

    # Check for badges
    check_and_unlock_badges(user_id or ngo_id, db, background_tasks)

    return {"message": "Donation claimed successfully. Check your email for the OTP verification code."}

@app.post("/donations/{donation_id}/verify", response_model=dict, tags=["Donations"])
def verify_donation_claim(
    donation_id: int,
    otp: str = Form(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Verify the OTP to complete the donation handover."""
    donation = db.query(Donation).filter(Donation.id == donation_id).first()
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")
        
    # Only Donor or Claimer can verify (in this design, we trust the Donor to output the code or Claimer to provide it)
    # Ideally, the Donor enters the code given by Claimer.
    if donation.user_id != user.id:
         raise HTTPException(status_code=403, detail="Only the donor can verify the handover")
         
    if donation.status != "Claimed":
        raise HTTPException(status_code=400, detail=f"Donation is in {donation.status} state")
        
    # Check OTP
    if donation.claim_secret != otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
        
    # Check Expiry (1 hour)
    if donation.otp_created_at:
        created_at = datetime.fromisoformat(donation.otp_created_at)
        if datetime.utcnow() - created_at > timedelta(hours=1):
            donation.status = "Available" # Reset? Or Expired? Let's reset to Available so someone else can claim.
            donation.claim_secret = None
            donation.claimed_by_user_id = None
            donation.claimed_by_ngo_id = None
            db.commit()
            raise HTTPException(status_code=400, detail="OTP Expired. Donation has been made available again.")

    donation.status = "Completed"
    db.commit()
    
    return {"message": "Donation verified and completed successfully!"}

@app.get("/donations", response_model=List[DonationResponse], tags=["Donations"])
def get_all_donations(db: Session = Depends(get_db)):
    # Lazy Expiration Logic
    now_iso = datetime.utcnow().isoformat()
    available_donations = db.query(Donation).filter(Donation.status == "Available").all()
    
    expired_count = 0
    for d in available_donations:
        if d.safe_until and d.safe_until < now_iso:
            d.status = "Expired"
            expired_count += 1
    
    if expired_count > 0:
        db.commit()
        logger.info(f"Lazily expired {expired_count} donations")

    return db.query(Donation).filter(Donation.status == "Available").all()

@app.get("/my-donations", response_model=List[DonationResponse], tags=["Profile"])
def my_donations(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    logger.info(f"Fetching donations for user: {user.username}")
    return db.query(Donation).filter(Donation.user_id == user.id).all()

@app.patch("/donations/{donation_id}", response_model=DonationResponse, tags=["Donations"])
def patch_donation(donation_id: int, update: DonationUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    logger.info(f"Patching donation ID: {donation_id} for user: {user.username}")
    donation = db.query(Donation).filter(Donation.id == donation_id, Donation.user_id == user.id).first()
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found or not owned by you")
    if donation.status != "Available":
        raise HTTPException(status_code=400, detail="Cannot update a claimed or completed donation")

    if update.text is not None:
        donation.raw_text = update.text
        # Re-parse if text changed
        new_cooked_at = update.cooked_at if update.cooked_at else donation.cooked_at
        parsed = parse_food_text(update.text, cooked_at=new_cooked_at)
        donation.food = parsed.food or "unknown"
        donation.quantity = parsed.quantity or "unknown"
        donation.price = parsed.price or 0
        donation.is_ngo_only = parsed.is_ngo_only or False
        donation.safe_until = parsed.safe_until
        donation.cooked_at = parsed.cooked_at or new_cooked_at

    if update.location is not None:
        donation.location = update.location
    if update.lat is not None:
        donation.lat = update.lat
    if update.lng is not None:
        donation.lng = update.lng
    if update.price is not None:
        donation.price = update.price
    if update.cooked_at is not None and update.text is None:
        # If only cooked_at is updated, re-calculate safety with existing text
        donation.cooked_at = update.cooked_at
        parsed = parse_food_text(donation.raw_text, cooked_at=update.cooked_at)
        donation.safe_until = parsed.safe_until

    db.commit()
    db.refresh(donation)
    return donation

@app.put("/donations/{donation_id}", response_model=DonationResponse, tags=["Donations"])
def put_donation(donation_id: int, update: DonationUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    logger.info(f"Updating donation ID: {donation_id} for user: {user.username}")
    donation = db.query(Donation).filter(Donation.id == donation_id, Donation.user_id == user.id).first()
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found or not owned by you")
    if donation.status != "Available":
        raise HTTPException(status_code=400, detail="Cannot update a claimed or completed donation")

    if not update.text:
         raise HTTPException(status_code=400, detail="Text is required for full update")

    donation.raw_text = update.text
    parsed = parse_food_text(update.text, cooked_at=update.cooked_at)
    donation.food = parsed.food or "unknown"
    donation.quantity = parsed.quantity or "unknown"
    donation.price = update.price if update.price is not None else (parsed.price or 0)
    donation.is_ngo_only = parsed.is_ngo_only or False
    donation.location = update.location if update.location else "unknown"
    donation.lat = update.lat
    donation.lng = update.lng
    donation.cooked_at = parsed.cooked_at or update.cooked_at
    donation.safe_until = parsed.safe_until

    db.commit()
    db.refresh(donation)
    return donation

# -------------------------------------------------
# ADMIN ROUTES
# -------------------------------------------------
@app.get("/admin/users", response_model=List[UserResponse], tags=["Admin"])
def admin_get_users(admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    logger.info(f"Admin {admin.username} is fetching all users")
    return db.query(User).all()

@app.get("/admin/donations", response_model=List[DonationResponse], tags=["Admin"])
def admin_get_donations(admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    logger.info(f"Admin {admin.username} is fetching all donations")
    return db.query(Donation).all()

@app.delete("/admin/donations/{donation_id}", response_model=dict, tags=["Admin"])
def admin_delete_donation(donation_id: int, admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    logger.info(f"Admin {admin.username} is deleting donation ID: {donation_id}")
    donation = db.query(Donation).filter(Donation.id == donation_id).first()
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")
    
    db.delete(donation)
    db.commit()
    return {"message": f"Donation {donation_id} deleted successfully"}

@app.post("/admin/promote/{user_id}", response_model=dict, tags=["Admin"])
def admin_promote_user(user_id: int, admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    logger.info(f"Admin {admin.username} is promoting user ID: {user_id}")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_admin = True
    db.commit()
    return {"message": f"User {user.username} promoted to admin"}

@app.get("/admin/ngos", response_model=List[NGOResponse], tags=["Admin"])
def admin_get_ngos(admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    logger.info(f"Admin {admin.username} is fetching all NGOs")
    return db.query(NGO).all()

@app.post("/admin/ngos/{ngo_id}/verify", response_model=dict, tags=["Admin"])
async def admin_verify_ngo(
    ngo_id: int, 
    action: str, # 'approve' or 'reject'
    background_tasks: BackgroundTasks,
    admin: User = Depends(get_admin_user), 
    db: Session = Depends(get_db)
):
    logger.info(f"Admin {admin.username} is verifying NGO ID: {ngo_id} (Action: {action})")
    ngo = db.query(NGO).filter(NGO.id == ngo_id).first()
    if not ngo:
        raise HTTPException(status_code=404, detail="NGO not found")
    
    if action == "approve":
        ngo.registration_status = "Approved"
    elif action == "reject":
        ngo.registration_status = "Rejected"
    else:
        raise HTTPException(status_code=400, detail="Invalid action. Use 'approve' or 'reject'.")
    
    db.commit()
    
    # Send notification email
    background_tasks.add_task(send_ngo_status_email, ngo.email, ngo.name, ngo.registration_status)
    
    return {"message": f"NGO {ngo.name} status updated to {ngo.registration_status}"}

@app.get("/dashboard/user", tags=["Profile"])
def get_user_dashboard(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Aggregation of user statistics for their dashboard."""
    logger.info(f"Fetching dashboard for user: {user.username}")
    
    # 1. Basic Counts
    total_donated = db.query(Donation).filter(Donation.user_id == user.id).count()
    total_claimed = db.query(Donation).filter(
        (Donation.claimed_by_user_id == user.id) | 
        (Donation.status == "Claimed") # Simplified logic, ideally check claimer ID
    ).count()
    if user.role != "Individual":
         # Orgs might behave like NGOs for claiming? Or just track donations.
         pass
         
    active_donations = db.query(Donation).filter(Donation.user_id == user.id, Donation.status == "Available").count()

    # 2. Impact Metrics
    impact = calculate_user_impact(user.id, db)

    # 3. Recent Activity (Last 5)
    recent = db.query(Donation).filter(Donation.user_id == user.id).order_by(Donation.id.desc()).limit(5).all()
    
    return {
        "stats": {
            "total_donated": total_donated,
            "total_claimed_by_others": db.query(Donation).filter(Donation.user_id == user.id, Donation.status == "Completed").count(),
            "active_listings": active_donations
        },
        "impact": impact,
        "recent_activity": recent
    }

@app.get("/dashboard/admin", tags=["Admin"])
def get_admin_dashboard(admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    """System-wide statistics for the Admin Dashboard."""
    logger.info(f"Fetching admin dashboard for: {admin.username}")
    
    # 1. User Stats
    total_users = db.query(User).count()
    total_ngos = db.query(NGO).count()
    
    # 2. Pending Verifications
    pending_orgs = db.query(User).filter(User.verification_status == "Applied").count()
    pending_ngos = db.query(NGO).filter(NGO.registration_status == "Applied").count()
    
    # 3. Donation Health
    stats = {
        "total": db.query(Donation).count(),
        "available": db.query(Donation).filter(Donation.status == "Available").count(),
        "claimed": db.query(Donation).filter(Donation.status == "Claimed").count(),
        "completed": db.query(Donation).filter(Donation.status == "Completed").count(),
        "expired": db.query(Donation).filter(Donation.status == "Expired").count()
    }
    
    return {
        "user_stats": {
            "total_users": total_users,
            "total_ngos": total_ngos
        },
        "pending_actions": {
            "organizations": pending_orgs,
            "ngos": pending_ngos
        },
        "donation_stats": stats,
        "system_health": "Good" # Placeholder
    }

@app.get("/admin/organizations", response_model=List[UserResponse], tags=["Admin"])
def admin_get_organizations(admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    logger.info(f"Admin {admin.username} fetching organizations")
    return db.query(User).filter(User.role != "Individual").all()

@app.post("/admin/organizations/{user_id}/verify", response_model=dict, tags=["Admin"])
async def admin_verify_organization(
    user_id: int,
    action: str, # 'approve' or 'reject'
    background_tasks: BackgroundTasks,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    logger.info(f"Admin {admin.username} verifying User ID: {user_id} (Action: {action})")
    org_user = db.query(User).filter(User.id == user_id).first()
    
    if not org_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if action == "approve":
        org_user.verification_status = "Approved"
    elif action == "reject":
        org_user.verification_status = "Rejected"
    else:
        raise HTTPException(status_code=400, detail="Invalid action")
        
    db.commit()
    
    # Send email
    background_tasks.add_task(send_org_status_email, org_user.email, org_user.username, org_user.verification_status)
    
    return {"message": f"Organization {org_user.username} status updated to {org_user.verification_status}"}

@app.post("/chat", response_model=dict, tags=["General"])
def chat_bot(
    request_body: ChatRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """Context-aware chatbot for health, nutrition, and platform queries. Accessible to All."""
    
    # 1. Gather Context
    user_id = request.session.get("user_id")
    ngo_id = request.session.get("ngo_id")
    
    context = ""
    user_role = "Guest"
    user_name = "Guest"

    if user_id:
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user_role = user.role
            user_name = user.username
            impact = calculate_user_impact(user.id, db)
            recent_donations = db.query(Donation).filter(Donation.user_id == user.id).order_by(Donation.id.desc()).limit(3).all()
            donation_history = "\n".join([f"- {d.food} ({d.quantity}) on {d.created_at}" for d in recent_donations]) if recent_donations else "No recent donations."
            
            context = f"""
            User: {user.username}
            Active Role: {user.role}
            Impact Stats:
            - Meals Served: {impact['meals_served']}
            - CO2 Saved: {impact['co2_reduced']}kg
            - Money Saved: ₹{impact.get('money_saved', 0)}
            Recent Activity:
            {donation_history}
            """
            
    elif ngo_id:
        ngo = db.query(NGO).filter(NGO.id == ngo_id).first()
        if ngo:
            user_role = "NGO"
            user_name = ngo.name
            context = f"""
            User: {ngo.name}
            Active Role: NGO ({ngo.ngo_type})
            Status: {ngo.registration_status}
            """

    if not context:
        context = "User is a guest visitor. Encourage them to join Meal-Mitra to donate or claim food."

    # 2. Construct System Prompt
    system_prompt = f"""
    You are 'Meal-Mitra Bot', an AI assistant for the Meal-Mitra food donation platform.
    
    YOUR MISSION:
    - Help users reduce food waste.
    - Provide advice on food safety, nutrition, and health.
    - Explain platform features (donating, claiming, badges).
    - Use the provided USER CONTEXT to personalize answers.
    
    USER CONTEXT:
    {context}
    
    GUARDRAILS:
    - ONLY answer questions related to Food, Health, Nutrition, and Meal-Mitra.
    - IF asked about completely unrelated topics (entertainment, coding, politics), politely refuse: "I am only tuned to help with food, health, and Meal-Mitra."
    - Be friendly, encouraging, and concise.
    """
    
    # 3. Call Groq API
    try:
        client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": request_body.message}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.7,
            max_tokens=300,
        )
        response_text = chat_completion.choices[0].message.content
        return {"response": response_text}
    except Exception as e:
        logger.error(f"Chatbot error: {e}")
        # Soft fallback if AI fails
        return {"response": "I'm currently having trouble connecting to my brain. Please try again later! 🤖"}

@app.get("/", tags=["General"])
def root():
    return {"status": "Meal-Mitra FastAPI backend (Admin Enabled) running", "version": "1.2.0"}
