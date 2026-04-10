from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from pydantic import BaseModel

from app.db import get_db
from app.dependencies import get_current_admin
from app.models.user import User
from app.models.department import Department
from app.models.service import Service
from app.models.token import Token
from app.utils.password_hash import hash_password

router = APIRouter(prefix='/admin', tags=['admin'])


# Pydantic schemas for admin operations
class DepartmentCreate(BaseModel):
    name: str
    description: Optional[str] = None


class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class ServiceCreate(BaseModel):
    name: str
    description: Optional[str] = None
    department_id: int


class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    department_id: Optional[int] = None


class EmployeeCreate(BaseModel):
    name: str
    email: str
    password: str


class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None


# ==================== EMPLOYEE MANAGEMENT ====================

@router.post('/employees', response_model=dict)
async def add_employee(
    employee_data: EmployeeCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Add a new employee."""
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == employee_data.email).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists")

    # Create new employee
    new_employee = User(
        name=employee_data.name,
        email=employee_data.email,
        password=hash_password(employee_data.password),
        role="employee"
    )
    db.add(new_employee)
    db.commit()
    db.refresh(new_employee)

    return {"message": "Employee added successfully", "employee_id": new_employee.id}


@router.get('/employees', response_model=List[dict])
async def get_employees(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get all employees."""
    employees = db.query(User).filter(User.role == "employee").all()
    return [
        {"id": emp.id, "name": emp.name, "email": emp.email}
        for emp in employees
    ]


@router.put('/employees/{employee_id}')
async def edit_employee(
    employee_id: int,
    employee_data: EmployeeUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Edit an employee's information."""
    employee = db.query(User).filter(
        User.id == employee_id,
        User.role == "employee"
    ).first()

    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

    if employee_data.name:
        employee.name = employee_data.name
    if employee_data.email:
        # Check if new email already exists
        existing = db.query(User).filter(
            User.email == employee_data.email,
            User.id != employee_id
        ).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists")
        employee.email = employee_data.email

    db.commit()
    return {"message": "Employee updated successfully"}


@router.delete('/employees/{employee_id}')
async def delete_employee(
    employee_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete an employee."""
    employee = db.query(User).filter(
        User.id == employee_id,
        User.role == "employee"
    ).first()

    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

    db.delete(employee)
    db.commit()
    return {"message": "Employee deleted successfully"}


# ==================== DEPARTMENT MANAGEMENT ====================

@router.post('/departments', response_model=dict)
async def add_department(
    dept_data: DepartmentCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Add a new department."""
    # Check if department name already exists
    existing = db.query(Department).filter(Department.name == dept_data.name).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Department name already exists")

    new_dept = Department(name=dept_data.name, description=dept_data.description)
    db.add(new_dept)
    db.commit()
    db.refresh(new_dept)

    return {"message": "Department added successfully", "department_id": new_dept.id}


@router.get('/departments', response_model=List[dict])
async def get_departments(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get all departments."""
    departments = db.query(Department).all()
    return [
        {"id": dept.id, "name": dept.name, "description": dept.description}
        for dept in departments
    ]


@router.put('/departments/{department_id}')
async def edit_department(
    department_id: int,
    dept_data: DepartmentUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Edit a department."""
    department = db.query(Department).filter(Department.id == department_id).first()

    if not department:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")

    if dept_data.name:
        # Check if new name already exists
        existing = db.query(Department).filter(
            Department.name == dept_data.name,
            Department.id != department_id
        ).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Department name already exists")
        department.name = dept_data.name
    
    if dept_data.description is not None:
        department.description = dept_data.description

    db.commit()
    return {"message": "Department updated successfully"}


@router.delete('/departments/{department_id}')
async def delete_department(
    department_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete a department."""
    department = db.query(Department).filter(Department.id == department_id).first()

    if not department:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")

    db.delete(department)
    db.commit()
    return {"message": "Department deleted successfully"}


# ==================== SERVICE MANAGEMENT ====================

@router.post('/services', response_model=dict)
async def add_service(
    service_data: ServiceCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Add a new service."""
    # Check if department exists
    dept = db.query(Department).filter(Department.id == service_data.department_id).first()
    if not dept:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")

    new_service = Service(
        name=service_data.name,
        description=service_data.description,
        department_id=service_data.department_id
    )
    db.add(new_service)
    db.commit()
    db.refresh(new_service)

    return {"message": "Service added successfully", "service_id": new_service.id}


@router.get('/services', response_model=List[dict])
async def get_services(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get all services."""
    services = db.query(Service).all()
    return [
        {"id": svc.id, "name": svc.name, "description": svc.description, "department_id": svc.department_id}
        for svc in services
    ]


@router.put('/services/{service_id}')
async def edit_service(
    service_id: int,
    service_data: ServiceUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Edit a service."""
    service = db.query(Service).filter(Service.id == service_id).first()

    if not service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")

    if service_data.name:
        service.name = service_data.name
    if service_data.description is not None:
        service.description = service_data.description
    if service_data.department_id:
        # Check if new department exists
        dept = db.query(Department).filter(Department.id == service_data.department_id).first()
        if not dept:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")
        service.department_id = service_data.department_id

    db.commit()
    return {"message": "Service updated successfully"}


@router.delete('/services/{service_id}')
async def delete_service(
    service_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete a service."""
    service = db.query(Service).filter(Service.id == service_id).first()

    if not service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")

    db.delete(service)
    db.commit()
    return {"message": "Service deleted successfully"}


# ==================== REPORTS ====================

@router.get('/reports/summary')
async def get_reports_summary(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get overall token reports (total, completed, pending)."""
    total_tokens = db.query(func.count(Token.id)).scalar()
    completed_tokens = db.query(func.count(Token.id)).filter(Token.status == "completed").scalar()
    pending_tokens = db.query(func.count(Token.id)).filter(Token.status == "pending").scalar()
    active_tokens = db.query(func.count(Token.id)).filter(Token.status == "active").scalar()
    cancelled_tokens = db.query(func.count(Token.id)).filter(Token.status == "cancelled").scalar()

    return {
        "total_tokens": total_tokens or 0,
        "completed_tokens": completed_tokens or 0,
        "pending_tokens": pending_tokens or 0,
        "active_tokens": active_tokens or 0,
        "cancelled_tokens": cancelled_tokens or 0
    }


@router.get('/reports/service/{service_id}')
async def get_service_report(
    service_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get token report for a specific service."""
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")

    total_tokens = db.query(func.count(Token.id)).filter(Token.service_id == service_id).scalar()
    completed_tokens = db.query(func.count(Token.id)).filter(
        Token.service_id == service_id,
        Token.status == "completed"
    ).scalar()
    pending_tokens = db.query(func.count(Token.id)).filter(
        Token.service_id == service_id,
        Token.status == "pending"
    ).scalar()
    active_tokens = db.query(func.count(Token.id)).filter(
        Token.service_id == service_id,
        Token.status == "active"
    ).scalar()

    return {
        "service_name": service.name,
        "total_tokens": total_tokens or 0,
        "completed_tokens": completed_tokens or 0,
        "pending_tokens": pending_tokens or 0,
        "active_tokens": active_tokens or 0
    }


@router.get('/reports/department/{department_id}')
async def get_department_report(
    department_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get token report for a specific department."""
    department = db.query(Department).filter(Department.id == department_id).first()
    if not department:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")

    # Get all services in the department
    services = db.query(Service).filter(Service.department_id == department_id).all()
    service_ids = [svc.id for svc in services]

    # Query tokens for all services in the department
    total_tokens = db.query(func.count(Token.id)).filter(Token.service_id.in_(service_ids)).scalar()
    completed_tokens = db.query(func.count(Token.id)).filter(
        Token.service_id.in_(service_ids),
        Token.status == "completed"
    ).scalar()
    pending_tokens = db.query(func.count(Token.id)).filter(
        Token.service_id.in_(service_ids),
        Token.status == "pending"
    ).scalar()
    active_tokens = db.query(func.count(Token.id)).filter(
        Token.service_id.in_(service_ids),
        Token.status == "active"
    ).scalar()

    return {
        "department_name": department.name,
        "total_tokens": total_tokens or 0,
        "completed_tokens": completed_tokens or 0,
        "pending_tokens": pending_tokens or 0,
        "active_tokens": active_tokens or 0
    }
