# pyrefly: ignore [missing-import]
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class HealthAnalysisRequest(BaseModel):
    symptoms: str = Field(..., description="Symptoms or health complaints reported by the user")
    age: Optional[int] = Field(None, description="Age of the patient")
    gender: Optional[str] = Field(None, description="Gender of the patient")
    medical_history: Optional[str] = Field(None, description="Known existing medical history or allergies")
    duration: Optional[str] = Field(None, description="Duration of symptoms")
    preferred_specialist: Optional[str] = Field(None, description="Optional preferred medical specialist")

class HealthAnalysisResponse(BaseModel):
    recommended_specialist: str
    all_possible_specialists: List[str]
    possible_conditions: List[str]
    triage_urgency: str # e.g., "Routine", "Urgent", "Emergency"
    analysis_summary: str
    suggested_questions_for_doctor: List[str]
    general_health_advice: List[str]
    disclaimer: str

class TrainingExample(BaseModel):
    symptoms: str
    recommended_specialist: str
    possible_conditions: List[str]
    advice: Optional[str] = None
    notes: Optional[str] = None

class AdminTrainRequest(BaseModel):
    source: Optional[str] = Field("manual", description="'manual' to supply dataset or 'database' to fetch verified solutions")
    custom_system_instructions: Optional[str] = Field(None, description="Custom prompt / domain training instructions provided by admin")
    training_examples: Optional[List[TrainingExample]] = Field(default_factory=list, description="Examples or dataset to fine-tune/ground the AI model")
    persist_training: Optional[bool] = Field(True, description="Whether to save and apply this knowledge base permanently")

class ModelStatusResponse(BaseModel):
    status: str
    model_name: str
    gemini_configured: bool
    total_training_examples: int
    custom_instructions_active: bool
    specialists_supported: List[str]
