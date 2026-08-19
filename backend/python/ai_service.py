import json
import os
from typing import List, Dict, Any, Optional
from google import genai
# pyrefly: ignore [missing-import]
from google.genai import types
from config import GEMINI_API_KEY, GEMINI_MODEL, SPECIALISTS
from schemas import HealthAnalysisRequest, HealthAnalysisResponse, TrainingExample

TRAINING_DATA_FILE = os.path.join(os.path.dirname(__file__), "training_data.json")

DEFAULT_SYSTEM_INSTRUCTION = f"""You are an advanced medical triage and health problem analysis AI assistant for a healthcare platform.
Your primary role is to evaluate health complaints/symptoms reported by users and recommend the most appropriate medical specialist, potential non-definitive conditions to investigate, triage urgency level, and safe wellness advice.

You must only map to the following approved specialist categories:
{", ".join(SPECIALISTS)}

Rules & Guidelines:
1. Always choose the most relevant 'recommended_specialist' from the approved list above.
2. If multiple specialists could apply, list them in 'all_possible_specialists'.
3. Assign a triage urgency: "Routine", "Urgent", or "Emergency".
4. Provide structured, actionable, and empathetic responses.
5. Emphasize that this is an AI-assisted evaluation and does not substitute a licensed physician's clinical diagnosis.
"""

class GeminiHealthService:
    def __init__(self):
        self.api_key = GEMINI_API_KEY
        self.model_name = GEMINI_MODEL
        self.training_examples: List[Dict[str, Any]] = []
        self.custom_instructions: str = ""
        self._load_training_data()

    def _get_client(self) -> genai.Client:
        key = self.api_key or os.getenv("GEMINI_API_KEY", "")
        if not key:
            raise ValueError("GEMINI_API_KEY is not set. Please provide it in your .env file or configuration.")
        return genai.Client(api_key=key)

    def _load_training_data(self):
        """Loads cached/saved training data and system adjustments if available."""
        if os.path.exists(TRAINING_DATA_FILE):
            try:
                with open(TRAINING_DATA_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.training_examples = data.get("training_examples", [])
                    self.custom_instructions = data.get("custom_instructions", "")
            except Exception as e:
                print(f"Error loading training data: {e}")

    def save_training_data(self, examples: List[Dict[str, Any]], custom_instructions: Optional[str] = None):
        """Saves new training examples and instructions to disk."""
        if custom_instructions is not None:
            self.custom_instructions = custom_instructions
        
        # Merge unique training examples by symptoms
        existing_symptoms = {ex.get("symptoms", "").strip().lower() for ex in self.training_examples}
        for ex in examples:
            if ex.get("symptoms", "").strip().lower() not in existing_symptoms:
                self.training_examples.append(ex)
                existing_symptoms.add(ex.get("symptoms", "").strip().lower())

        with open(TRAINING_DATA_FILE, "w", encoding="utf-8") as f:
            json.dump({
                "custom_instructions": self.custom_instructions,
                "training_examples": self.training_examples
            }, f, indent=2)

    def build_system_prompt(self) -> str:
        prompt = DEFAULT_SYSTEM_INSTRUCTION
        if self.custom_instructions:
            prompt += f"\n\n[ADMIN CUSTOM INSTRUCTIONS]:\n{self.custom_instructions}"

        if self.training_examples:
            prompt += "\n\n[GROUND TRUTH CLINICAL TRAINING EXAMPLES / FEW-SHOT DATASET]:\n"
            for idx, ex in enumerate(self.training_examples[:30], 1):
                prompt += (
                    f"Example #{idx}:\n"
                    f"- Symptoms: {ex.get('symptoms')}\n"
                    f"- Recommended Specialist: {ex.get('recommended_specialist')}\n"
                    f"- Possible Conditions: {', '.join(ex.get('possible_conditions', []))}\n"
                    f"- Advice: {ex.get('advice', 'Consult a doctor.')}\n\n"
                )
        return prompt

    async def analyze_health_problem(self, request: HealthAnalysisRequest) -> HealthAnalysisResponse:
        client = self._get_client()

        user_content = f"""
Patient Health Profile & Symptoms:
- Reported Symptoms: {request.symptoms}
- Patient Age: {request.age if request.age is not None else 'Not specified'}
- Patient Gender: {request.gender or 'Not specified'}
- Medical History / Allergies: {request.medical_history or 'None reported'}
- Duration of Symptoms: {request.duration or 'Not specified'}
- User Preferred Specialist: {request.preferred_specialist or 'None'}

Please analyze this clinical case thoroughly and provide the output conforming strictly to the requested JSON schema.
"""

        system_prompt = self.build_system_prompt()

        response = client.models.generate_content(
            model=self.model_name,
            contents=user_content,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                response_mime_type="application/json",
                response_schema=HealthAnalysisResponse,
                temperature=0.2
            )
        )

        # Parse response into schema model
        parsed_data = json.loads(response.text)
        return HealthAnalysisResponse(**parsed_data)

service = GeminiHealthService()
