from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import Base, engine
from app.routes.admin import router as admin_router
from app.routes.auth import router as auth_router
from app.routes.employee import router as employee_router
from app.routes.token import router as token_router

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title='Token Booking API')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(auth_router)
app.include_router(token_router)
app.include_router(admin_router)
app.include_router(employee_router)

@app.get('/')
async def root():
    return {'message': 'Token Booking API root'}
