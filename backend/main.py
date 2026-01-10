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
    price: Optional[float] = 0.0
    is_ngo_only: Optional[bool] = False

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

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None

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

class NGOCreate(NGOBase):
    password: str
    id_proof: str
    address_proof: str

class NGOUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    ngo_type: Optional[str] = None
    id_proof: Optional[str] = None
    address_proof: Optional[str] = None

class NGOResponse(NGOBase):
    id: int
    registration_status: str
    certificate_id: Optional[str] = None
    class Config:
        from_attributes = True

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
    price = Column(Integer, default=0)
    status = Column(String, default="Available")
    is_ngo_only = Column(Boolean, default=False)

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
        "total_donations": len(donations),
        "claimed_count": len(claimed_donations),
        "safe_count": len([d for d in donations if d.food != "unknown"]) # Mock "safe" check
    }

def check_and_unlock_badges(user_id: int, db: Session):
    impact = calculate_user_impact(user_id, db)
    owned_badges = {b.badge_name for b in db.query(UserBadge).filter(UserBadge.user_id == user_id).all()}
    
    new_badges = []
    
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
            new_badges.append(defn["name"])
            
    if new_badges:
        db.commit()
        logger.info(f"User {user_id} unlocked new badges: {', '.join(new_badges)}")
    
    return new_badges

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
    - price (The expected price or cost mentioned, return 0 if not specified or if it's a free donation)
    - is_ngo_only (Boolean: true if the donation is explicitly for NGOs or mentions work for charity/NGOS, false if for general public)
    
    Example input: "office mein 10 kg chawal bacha hai and price is 50"
    Example output: {{"food": "rice", "quantity": "10 kg", "location": "office", "safe_until": null, "price": 50.0, "is_ngo_only": false}}
    
    Example input: "10 packets of milk for NGOs only, free of cost"
    Example output: {{"food": "milk", "quantity": "10 packets", "location": "unknown", "safe_until": null, "price": 0.0, "is_ngo_only": true}}
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
    impact = calculate_user_impact(user.id, db)
    
    return {
        "user": user,
        "donations": donations,
        "total_donations": len(donations),
        "meals_served": impact["meals_served"],
        "co2_reduced": impact["co2_reduced"],
        "kg_saved": impact["kg_saved"]
    }

@app.get("/profile/badges", response_model=List[BadgeResponse])
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

@app.patch("/profile", response_model=UserResponse)
def patch_profile(update: UserUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    logger.info(f"Patching profile for user: {user.username}")
    if update.username is not None:
        user.username = update.username.strip().lower()
    if update.email is not None:
        user.email = update.email.strip().lower()
    db.commit()
    db.refresh(user)
    return user

@app.put("/profile", response_model=UserResponse)
def put_profile(update: UserUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    logger.info(f"Updating profile for user: {user.username}")
    user.username = update.username.strip().lower() if update.username else user.username
    user.email = update.email.strip().lower() if update.email else user.email
    db.commit()
    db.refresh(user)
    return user

# -------------------------------------------------
# NGO ROUTES
# -------------------------------------------------
@app.post("/ngo/register", response_model=dict, status_code=status.HTTP_201_CREATED)
async def ngo_register(
    name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    ngo_type: str = Form(...),
    id_proof: str = Form(...),
    address_proof: str = Form(...),
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
        registration_status="Applied"
    )
    db.add(new_ngo)
    db.commit()
    return {"message": "NGO registered and application status: Applied"}

@app.post("/ngo/login", response_model=dict)
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

@app.get("/ngo/profile", response_model=NGOResponse)
def ngo_profile(ngo: NGO = Depends(get_current_ngo)):
    return ngo

@app.patch("/ngo/profile", response_model=NGOResponse)
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
    db.commit()
    db.refresh(ngo)
    return ngo

@app.put("/ngo/profile", response_model=NGOResponse)
def put_ngo_profile(update: NGOUpdate, ngo: NGO = Depends(get_current_ngo), db: Session = Depends(get_db)):
    logger.info(f"Updating NGO profile for: {ngo.name}")
    ngo.name = update.name.strip() if update.name else ngo.name
    ngo.email = update.email.strip().lower() if update.email else ngo.email
    ngo.ngo_type = update.ngo_type if update.ngo_type else ngo.ngo_type
    ngo.id_proof = update.id_proof if update.id_proof else ngo.id_proof
    ngo.address_proof = update.address_proof if update.address_proof else ngo.address_proof
    db.commit()
    db.refresh(ngo)
    return ngo

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
        lng=lng,
        price=parsed.price or 0,
        is_ngo_only=parsed.is_ngo_only or False
    )

    db.add(donation)
    db.commit()
    db.refresh(donation)
    
    # Check for badges (Annadātā, Friendly Helper, Kind Heart etc.)
    check_and_unlock_badges(user.id, db)

    logger.info(f"Donation created successfully: ID {donation.id}")
    return {
        "donation_id": donation.id,
        "cleaned": parsed.model_dump()
    }

@app.post("/donations/{donation_id}/claim", response_model=dict)
def claim_donation(
    donation_id: int,
    request: Request,
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
        # NGOs get it for free
        logger.info(f"NGO ID {ngo_id} is claiming NGO-only donation ID: {donation_id}")
    else:
        # Public donation
        if user_id:
            logger.info(f"User ID {user_id} is claiming public donation ID: {donation_id} (Price: {donation.price})")
        elif ngo_id:
            logger.info(f"NGO ID {ngo_id} is claiming public donation ID: {donation_id} (Price: {donation.price})")

    donation.status = "Claimed"
    db.commit()
    
    # Check for donor's badges (NGOs served, KG saved milestones etc.)
    check_and_unlock_badges(donation.user_id, db)
    
    return {
        "message": "Donation claimed successfully",
        "status": "Claimed",
        "is_ngo_only": donation.is_ngo_only,
        "price_paid": donation.price if not donation.is_ngo_only else 0
    }

@app.get("/my-donations", response_model=List[DonationResponse])
def my_donations(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    logger.info(f"Fetching donations for user: {user.username}")
    return db.query(Donation).filter(Donation.user_id == user.id).all()

@app.patch("/donations/{donation_id}", response_model=DonationResponse)
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
        parsed = parse_food_text(update.text)
        donation.food = parsed.food or "unknown"
        donation.quantity = parsed.quantity or "unknown"
        donation.price = parsed.price or 0
        donation.is_ngo_only = parsed.is_ngo_only or False

    if update.location is not None:
        donation.location = update.location
    if update.lat is not None:
        donation.lat = update.lat
    if update.lng is not None:
        donation.lng = update.lng
    if update.price is not None:
        donation.price = update.price

    db.commit()
    db.refresh(donation)
    return donation

@app.put("/donations/{donation_id}", response_model=DonationResponse)
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
    parsed = parse_food_text(update.text)
    donation.food = parsed.food or "unknown"
    donation.quantity = parsed.quantity or "unknown"
    donation.price = update.price if update.price is not None else (parsed.price or 0)
    donation.is_ngo_only = parsed.is_ngo_only or False
    donation.location = update.location if update.location else "unknown"
    donation.lat = update.lat
    donation.lng = update.lng

    db.commit()
    db.refresh(donation)
    return donation

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
