from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import firebase_admin
from firebase_admin import credentials, firestore
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List
import uuid
from datetime import datetime

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Firebase Admin Firestore Initialization
if not firebase_admin._apps:
    # Initialize using service account key file or default project options
    cred_path = os.environ.get("FIREBASE_SERVICE_ACCOUNT_KEY")
    if cred_path and os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred, {
            'projectId': os.environ.get("FIREBASE_PROJECT_ID", "private-vioces")
        })
    else:
        # Fallback to default application credentials or project ID initialization
        firebase_admin.initialize_app(options={
            'projectId': os.environ.get("FIREBASE_PROJECT_ID", "private-vioces")
        })

db = firestore.client()

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

# Add routes to the router
@api_router.get("/")
async def root():
    return {"message": "Private Voices API - Connected to Firestore"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    
    doc_ref = db.collection("status_checks").document(status_obj.id)
    doc_ref.set({
        "id": status_obj.id,
        "client_name": status_obj.client_name,
        "timestamp": status_obj.timestamp.isoformat()
    })
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    docs = db.collection("status_checks").order_by("timestamp", direction=firestore.Query.DESCENDING).limit(100).stream()
    checks = []
    for doc in docs:
        data = doc.to_dict()
        if "timestamp" in data and isinstance(data["timestamp"], str):
            try:
                data["timestamp"] = datetime.fromisoformat(data["timestamp"])
            except ValueError:
                data["timestamp"] = datetime.utcnow()
        checks.append(StatusCheck(**data))
    return checks

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

