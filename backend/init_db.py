"""
Initialize the database with test data.
Run this script once to set up the database with test users and departments.
"""

from app.db import Base, SessionLocal, engine
from app.models.user import User
from app.models.department import Department
from app.models.service import Service
from app.utils.password_hash import hash_password


def init_database():
    """Create tables and add test data."""
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("✓ Database tables created")

    # Create a session
    db = SessionLocal()

    try:
        # Check if admin user already exists
        admin = db.query(User).filter(User.email == "admin@example.com").first()
        if not admin:
            # Create admin user
            admin_user = User(
                name="Admin User",
                email="admin@example.com",
                password=hash_password("password"),
                role="admin"
            )
            db.add(admin_user)
            print("✓ Admin user created (admin@example.com / password)")
        else:
            print("✓ Admin user already exists")

        # Check if test employee exists
        employee = db.query(User).filter(User.email == "employee@example.com").first()
        if not employee:
            # Create employee user
            employee_user = User(
                name="Employee User",
                email="employee@example.com",
                password=hash_password("password"),
                role="employee"
            )
            db.add(employee_user)
            print("✓ Employee user created (employee@example.com / password)")
        else:
            print("✓ Employee user already exists")

        # Check if test regular user exists
        user = db.query(User).filter(User.email == "user@example.com").first()
        if not user:
            # Create regular user
            regular_user = User(
                name="Regular User",
                email="user@example.com",
                password=hash_password("password"),
                role="user"
            )
            db.add(regular_user)
            print("✓ Regular user created (user@example.com / password)")
        else:
            print("✓ Regular user already exists")

        # Check if departments exist
        dept_count = db.query(Department).count()
        if dept_count == 0:
            # Create departments
            departments = [
                Department(name="Registration", description="User registration and document verification"),
                Department(name="Support", description="Customer support and assistance"),
                Department(name="Payment", description="Payment processing and billing"),
            ]
            db.add_all(departments)
            print("✓ Departments created")
        else:
            print(f"✓ Departments already exist ({dept_count} found)")

        # Commit changes
        db.commit()

        # Get departments for services
        departments = db.query(Department).all()
        if departments:
            # Check if services exist
            service_count = db.query(Service).count()
            if service_count == 0:
                # Create services for each department
                services = [
                    Service(
                        name="New Registration",
                        description="Register as a new user",
                        department_id=departments[0].id
                    ),
                    Service(
                        name="Document Verification",
                        description="Verify your documents",
                        department_id=departments[0].id
                    ),
                    Service(
                        name="General Support",
                        description="General support inquiries",
                        department_id=departments[1].id
                    ),
                    Service(
                        name="Technical Support",
                        description="Technical support for your account",
                        department_id=departments[1].id
                    ),
                    Service(
                        name="Payment",
                        description="Make a payment",
                        department_id=departments[2].id
                    ),
                    Service(
                        name="Refund",
                        description="Request a refund",
                        department_id=departments[2].id
                    ),
                ]
                db.add_all(services)
                db.commit()
                print("✓ Services created")
            else:
                print(f"✓ Services already exist ({service_count} found)")

        print("\n✓ Database initialization complete!")
        print("\nTest accounts:")
        print("  Admin: admin@example.com / password")
        print("  Employee: employee@example.com / password")
        print("  User: user@example.com / password")

    except Exception as e:
        print(f"✗ Error initializing database: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    init_database()
