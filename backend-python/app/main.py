# app/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from app.core.fuzzy_triage import FuzzyTriageEngine
from app.core.bed_predictor import BedPredictor

app = FastAPI(
    title="CareFlow AI Analytics Engine",
    description="Fuzzy Logic Triage & Bed Allocation Microservice",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TriageRequest(BaseModel):
    heart_rate: float = Field(..., ge=30, le=250, description="Heart rate in BPM")
    spo2: float = Field(..., ge=50, le=100, description="Oxygen saturation in %")
    temperature: float = Field(..., ge=90, le=115, description="Body temperature in Fahrenheit")
    symptom_severity: float = Field(..., ge=1, le=10, description="Subjective symptom severity (1-10)")

class BedRequest(BaseModel):
    triage_score: float = Field(..., ge=0, le=100)
    age: int = Field(..., ge=0, le=120)
    comorbidities_count: int = Field(..., ge=0, le=10)
    spo2: float = Field(..., ge=50, le=100)
    heart_rate: float = Field(..., ge=30, le=250)

@app.get("/")
def read_root():
    return {"status": "online", "service": "CareFlow AI Analytics Engine", "version": "1.0.0"}

@app.post("/api/triage")
def compute_triage(data: TriageRequest):
    try:
        result = FuzzyTriageEngine.evaluate_triage(
            heart_rate=data.heart_rate,
            spo2=data.spo2,
            temperature=data.temperature,
            symptom_severity=data.symptom_severity
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/bed-recommendation")
def compute_bed_recommendation(data: BedRequest):
    try:
        result = BedPredictor.predict_allocation(
            triage_score=data.triage_score,
            age=data.age,
            comorbidities_count=data.comorbidities_count,
            spo2=data.spo2,
            heart_rate=data.heart_rate
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
