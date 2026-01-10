from main import SessionLocal, User, NGO, Donation, hash_password, Base, engine
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("db_seeder")

def seed_data():
    session = SessionLocal()
    try:
        # Create Tables
        Base.metadata.create_all(bind=engine)
        logger.info("Tables created successfully.")

        # 1. Create Admin User
        admin_email = "admin@mealmitra.com"
        if not session.query(User).filter(User.email == admin_email).first():
            admin = User(
                username="admin_suresh",
                email=admin_email,
                password=hash_password("Admin@123"),
                is_admin=True,
                address="Admin HQ, Mumbai",
                phone_number="9999999999"
            )
            session.add(admin)
            logger.info("Admin user created.")

        # 2. Create Test User
        user_email = "test@mealmitra.com"
        test_user = session.query(User).filter(User.email == user_email).first()
        if not test_user:
            test_user = User(
                username="rahul_verma",
                email=user_email,
                password=hash_password("Test@123"),
                is_admin=False,
                address="Flat 101, Residency, Pune",
                phone_number="8888888888",
                role="Individual",
                verification_status="Approved"
            )
            session.add(test_user)
            logger.info("Test user created.")
            session.commit() # Commit to get ID for donation
            session.refresh(test_user)

        # 2.1 Create Test Organization
        org_email = "restaurant@mealmitra.com"
        if not session.query(User).filter(User.email == org_email).first():
            org = User(
                username="spice_garden",
                email=org_email,
                password=hash_password("Org@123"),
                is_admin=False,
                address="Spice Garden, FC Road, Pune",
                phone_number="02012345678",
                role="Restaurant",
                fssai_license="12345678901234",
                verification_status="Approved"
            )
            session.add(org)
            logger.info("Test Organization created.")
        
        # 3. Create Test Donation
        if test_user and not session.query(Donation).filter(Donation.user_id == test_user.id).first():
            donation = Donation(
                user_id=test_user.id,
                raw_text="5kg Rice and Daal prepared around 2 PM",
                food="Rice and Daal",
                quantity="5kg",
                location="Pune Residency",
                status="Available",
                is_ngo_only=False,
                price=0,
                safe_until="2026-01-10T20:00:00", # Manually set for seed
                cooked_at="2026-01-10T14:00:00"
            )
            session.add(donation)
            logger.info("Test donation created.")

        # 4. Create Test NGO
        ngo_email = "ngo@mealmitra.com"
        if not session.query(NGO).filter(NGO.email == ngo_email).first():
            ngo = NGO(
                name="Helping Hands Foundation",
                email=ngo_email,
                password=hash_password("Ngo@123"),
                ngo_type="Trust",
                id_proof="TrustDeed123",
                address_proof="ElectricityBill456",
                registration_status="Approved",
                address="NGO Office, Shivaji Nagar, Pune",
                phone_number="7777777777"
            )
            session.add(ngo)
            logger.info("Test NGO created.")

        session.commit()
        logger.info("Database seeding completed successfully!")
        
    except Exception as e:
        logger.error(f"Seeding failed: {e}")
        session.rollback()
    finally:
        session.close()

if __name__ == "__main__":
    seed_data()
