from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, List
import uvicorn
import os

from config import PORT, SPECIALISTS, GEMINI_MODEL, GEMINI_API_KEY
from schemas import (
    HealthAnalysisRequest,
    HealthAnalysisResponse,
    AdminTrainRequest,
    ModelStatusResponse
)
from ai_service import service
from db import get_database

app = FastAPI(
    title="Healthcare AI Specialist & Triage Service",
    description="FastAPI microservice powered by Google Gemini API for health triage, specialist recommendation, and admin model training.",
    version="1.0.0"
)

# CORS middleware for communication with frontend and nodejs backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", tags=["Health Check"])
def health_check():
    return {
        "status": "healthy",
        "service": "Healthcare AI Specialist & Triage Service",
        "gemini_model": GEMINI_MODEL,
        "configured": bool(service.api_key or os.getenv("GEMINI_API_KEY"))
    }

@app.get("/api/v1/specialists", response_model=List[str], tags=["Specialists"])
def get_supported_specialists():
    """Returns the list of supported health specialist categories."""
    return SPECIALISTS

@app.get("/api/v1/ai/status", response_model=ModelStatusResponse, tags=["AI Model"])
def get_model_status():
    """Returns model information, dataset count, and configuration state."""
    has_key = bool(service.api_key or os.getenv("GEMINI_API_KEY"))
    return ModelStatusResponse(
        status="ready" if has_key else "missing_api_key",
        model_name=service.model_name,
        gemini_configured=has_key,
        total_training_examples=len(service.training_examples),
        custom_instructions_active=bool(service.custom_instructions),
        specialists_supported=SPECIALISTS
    )

@app.post("/api/v1/ai/analyze-problem", response_model=HealthAnalysisResponse, tags=["AI Diagnostics"])
async def analyze_health_problem(request: HealthAnalysisRequest):
    """
    Analyzes patient health problems, predicts possible conditions, recommends
    the appropriate specialist, and provides triage urgency and safe advice.
    Automatically logs and persists AI analyses to MongoDB backend.
    """
    try:
        result = await service.analyze_health_problem(request)
        
        # Automatically persist AI analysis into MongoDB
        try:
            database = get_database()
            if database is not None:
                # Find or create problem_type
                type_name = result.recommended_specialist or "General Health"
                problem_type = await database["problem_type"].find_one({"name": type_name})
                if not problem_type:
                    type_res = await database["problem_type"].insert_one({
                        "name": type_name,
                        "description": f"Health concerns related to {type_name}"
                    })
                    type_id = type_res.inserted_id
                else:
                    type_id = problem_type["_id"]

                # Insert problem record with full AI analysis and complete symptoms
                await database["user_problems"].insert_one({
                    "problem": result.identified_health_problem or request.symptoms,
                    "description": request.symptoms,
                    "symptoms": request.symptoms,
                    "type": type_id,
                    "ai_analysis": result.model_dump(),
                    "patient_profile": {
                        "symptoms": request.symptoms,
                        "age": request.age,
                        "gender": request.gender,
                        "duration": request.duration,
                        "medical_history": request.medical_history
                    },
                    "status": "pending_doctor_review"
                })
        except Exception as db_err:
            print(f"Non-blocking error saving AI analysis to MongoDB: {db_err}")

        return result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")

@app.post("/api/v1/ai/admin-train", tags=["Admin Training"])
async def train_ai_model(request: AdminTrainRequest):
    """
    Admin endpoint to train/fine-tune the AI model with new clinical examples,
    custom instructions, or doctor-verified solutions from MongoDB.
    """
    new_examples: List[Dict[str, Any]] = []

    # 1. Process provided training examples
    if request.training_examples:
        for ex in request.training_examples:
            new_examples.append(ex.model_dump())

    # 2. Optionally pull verified solutions from database
    if request.source == "database":
        try:
            database = get_database()
            if database is not None:
                # Find solutions verified by doctors (verifyIsTrue == True)
                solutions_cursor = database["doctors_solution"].find({"verifyIsTrue": True})
                solutions = await solutions_cursor.to_list(length=100)
                
                for sol in solutions:
                    # Find matching user problem
                    prob = await database["user_problems"].find_one({"_id": sol.get("user_problem")})
                    if prob:
                        # Find doctor specialization if available
                        doc = await database["doctors"].find_one({"_id": sol.get("doctor")})
                        spec = doc.get("specialization", "General Physician") if doc else "General Physician"
                        
                        new_examples.append({
                            "symptoms": prob.get("problem", "") + ": " + prob.get("description", ""),
                            "recommended_specialist": spec,
                            "possible_conditions": [prob.get("problem", "Health Condition")],
                            "advice": sol.get("solution", "Follow doctor's guidance."),
                            "notes": "Extracted from verified clinical solutions in database"
                        })
        except Exception as db_err:
            print(f"Error fetching verified solutions from database: {db_err}")

    if request.persist_training:
        service.save_training_data(
            examples=new_examples,
            custom_instructions=request.custom_system_instructions
        )

    return {
        "message": "AI model training and knowledge base updated successfully!",
        "added_examples_count": len(new_examples),
        "total_active_training_examples": len(service.training_examples),
        "custom_instructions_set": bool(request.custom_system_instructions or service.custom_instructions)
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)
