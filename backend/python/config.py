import os
from typing import List
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
MONGOOSE_URL: str = os.getenv("MONGOOSE_URL", "")
PORT: int = int(os.getenv("PORT", "8000"))

# Supported Medical Specialist Categories
SPECIALISTS: List[str] = [
    "General Physician",
    "Cardiologist",
    "Dermatologist",
    "Neurologist",
    "Psychologist",
    "Nutritionist",
    "Orthopedic",
    "Pediatrician"
]
