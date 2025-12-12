from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

from app.api.endpoints import generation, export


app = FastAPI(title="DrawTogaf API", version="0.1.0")

# CORS Setup
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://localhost:5174",
    "http://localhost:5175"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(generation.router, prefix="/api", tags=["generation"])
app.include_router(export.router, prefix="/api/export", tags=["export"])

@app.get("/")
def read_root():
    return {"message": "DrawTogaf Wrapper API is running", "env_check": "OK" if os.getenv("OPENROUTER_API_KEY") else "MISSING"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
