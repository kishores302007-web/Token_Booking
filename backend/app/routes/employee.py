from fastapi import APIRouter

router = APIRouter(prefix='/employee', tags=['employee'])

@router.get('/')
async def employee_dashboard():
    return {'message': 'Employee endpoint'}
