from fastapi import APIRouter

router = APIRouter(prefix='/token', tags=['token'])

@router.post('/')
async def create_token():
    return {'message': 'Token creation endpoint'}
