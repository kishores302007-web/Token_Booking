from fastapi import APIRouter

router = APIRouter(prefix='/admin', tags=['admin'])

@router.get('/')
async def admin_dashboard():
    return {'message': 'Admin endpoint'}
