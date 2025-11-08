# backend/app.py

from fastapi import FastAPI, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from deepface import DeepFace
from pydantic import BaseModel
from typing import List, Dict, Optional
import asyncio
from concurrent.futures import ThreadPoolExecutor
import logging
import tempfile
import os
import json

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Allow requests from your frontend (React)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Temporary in-memory storage
user_sessions = []

# Chat models
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    reportContext: Optional[Dict] = None

# Thread pool for running DeepFace (since it's CPU-bound)
executor = ThreadPoolExecutor(max_workers=1)

def analyze_emotion_sync(image_path):
    """Synchronous function to analyze emotion using DeepFace"""
    try:
        logger.info(f"Starting DeepFace analysis on file: {image_path}")
        
        # DeepFace works best with file paths, not numpy arrays
        # Use opencv backend (faster) and enforce_detection=False to handle edge cases
        result = DeepFace.analyze(
            img_path=image_path,
            actions=['emotion'],
            enforce_detection=False,
            detector_backend='opencv',
            silent=False  # Set to False to see progress
        )
        
        logger.info("DeepFace analysis completed successfully")
        return result
    except Exception as e:
        logger.error(f"DeepFace error: {str(e)}", exc_info=True)
        raise

@app.get("/")
async def root():
    return {"message": "Backend is running successfully!"}

@app.post("/detect_emotion")
async def detect_emotion(file: UploadFile):
    temp_file_path = None
    try:
        logger.info("Received emotion detection request")
        
        # Read image bytes
        image_bytes = await file.read()
        logger.info(f"Received {len(image_bytes)} bytes of image data")
        
        # Save to temporary file (DeepFace works better with file paths)
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
            temp_file.write(image_bytes)
            temp_file_path = temp_file.name
        
        logger.info(f"Saved image to temporary file: {temp_file_path}")
        
        # Run DeepFace in thread pool with timeout
        try:
            # Use asyncio timeout to prevent hanging
            result = await asyncio.wait_for(
                asyncio.get_event_loop().run_in_executor(
                    executor,
                    analyze_emotion_sync,
                    temp_file_path
                ),
                timeout=60.0  # Increased timeout to 60 seconds for first run
            )
        except asyncio.TimeoutError:
            logger.error("DeepFace analysis timed out after 60 seconds")
            return {"error": "Analysis timed out. DeepFace may be downloading models (first run). Please try again in a moment."}
        except Exception as e:
            logger.error(f"Analysis failed: {str(e)}", exc_info=True)
            return {"error": f"Analysis failed: {str(e)}"}
        
        # Extract results
        if isinstance(result, list) and len(result) > 0:
            dominant = result[0]['dominant_emotion']
            confidence = result[0]['emotion'][dominant]
            emotions = result[0]['emotion']
        else:
            dominant = result['dominant_emotion']
            confidence = result['emotion'][dominant]
            emotions = result['emotion']
        
        logger.info(f"Emotion detected: {dominant} ({confidence}% confidence)")
        
        return {
            "dominant_emotion": dominant,
            "confidence": confidence,
            "emotions": emotions
        }
    except Exception as e:
        logger.error(f"Error in detect_emotion: {str(e)}", exc_info=True)
        return {"error": str(e)}
    finally:
        # Clean up temporary file
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.unlink(temp_file_path)
                logger.info(f"Deleted temporary file: {temp_file_path}")
            except Exception as e:
                logger.warning(f"Could not delete temp file: {e}")

@app.post("/save_session")
async def save_session(name: str = Form(...), emotion: str = Form(...), stress_score: float = Form(...)):
    user_sessions.append({
        "name": name,
        "emotion": emotion,
        "stress_score": stress_score
    })
    return {"status": "saved", "total_sessions": len(user_sessions)}

@app.get("/get_sessions")
async def get_sessions():
    return {"sessions": user_sessions}

@app.post("/chat")
async def chat(request: ChatRequest):
    """Chat endpoint for wellness counseling"""
    try:
        logger.info("Received chat request")
        
        # Get the last user message
        user_messages = [m for m in request.messages if m.role == "user"]
        if not user_messages:
            return {"error": "No user message provided"}
        
        user_message = user_messages[-1].content
        report_context = request.reportContext or {}
        
        # Build context-aware response based on report
        system_context = ""
        if report_context:
            stress_level = report_context.get("stressLevel", "unknown")
            final_score = report_context.get("finalScore", 0)
            system_context = f"\nUser's Stress Assessment:\n- Overall Score: {final_score}/3.00\n- Stress Level: {stress_level}\n"
            
            if report_context.get("emotionScore"):
                system_context += f"- Emotion Score: {report_context.get('emotionScore')}/3.00\n"
            if report_context.get("cognitiveScore"):
                system_context += f"- Cognitive Score: {report_context.get('cognitiveScore')}/3.00\n"
            if report_context.get("healthScore"):
                system_context += f"- Health Score: {report_context.get('healthScore')}/3.00\n"
        
        # Generate helpful response based on the query
        response_text = generate_wellness_response(user_message, system_context, stress_level if report_context else "unknown")
        
        return {
            "choices": [{
                "delta": {
                    "content": response_text
                }
            }]
        }
    except Exception as e:
        logger.error(f"Chat error: {str(e)}", exc_info=True)
        return {"error": str(e)}

def generate_wellness_response(user_message: str, context: str, stress_level: str) -> str:
    """Generate a helpful wellness counseling response"""
    message_lower = user_message.lower()
    
    # Context-aware responses
    if any(word in message_lower for word in ["stress", "anxious", "worried", "pressure"]):
        if stress_level in ["High", "Critical"]:
            return f"I understand you're experiencing significant stress. Given your assessment shows a {stress_level.lower()} stress level, I recommend:\n\n1. **Deep Breathing Exercises**: Practice 4-7-8 breathing (inhale 4s, hold 7s, exhale 8s) for 5 minutes daily.\n\n2. **Physical Activity**: Engage in 30 minutes of moderate exercise like walking, yoga, or swimming to release endorphins.\n\n3. **Sleep Hygiene**: Aim for 7-9 hours of quality sleep. Establish a consistent bedtime routine.\n\n4. **Professional Support**: Consider speaking with a therapist or counselor for ongoing support.\n\n5. **Mindfulness**: Try meditation apps or practice mindfulness for 10-15 minutes daily.\n\nWould you like me to elaborate on any of these techniques?"
        else:
            return "It's great that you're being proactive about managing stress! Here are some effective strategies:\n\n**Immediate Relief**:\n- Take 5 deep breaths\n- Step away for a 10-minute walk\n- Listen to calming music\n\n**Long-term Strategies**:\n- Regular exercise routine\n- Balanced nutrition\n- Social connections\n- Hobbies and interests\n\nWhat specific area would you like to focus on?"
    
    elif any(word in message_lower for word in ["sleep", "tired", "insomnia", "rest"]):
        return "Sleep is crucial for managing stress. Here are tips for better sleep:\n\n**Sleep Hygiene**:\n- Maintain a consistent sleep schedule\n- Create a dark, cool, quiet bedroom\n- Avoid screens 1 hour before bed\n- Limit caffeine after 2 PM\n- Try relaxation techniques before sleep\n\n**If you're having trouble sleeping**:\n- Progressive muscle relaxation\n- Guided sleep meditation\n- Write down worries before bed\n- Ensure your mattress and pillow are comfortable\n\nHow's your current sleep routine?"
    
    elif any(word in message_lower for word in ["diet", "nutrition", "food", "eating"]):
        return "Nutrition plays a key role in stress management:\n\n**Stress-Reducing Foods**:\n- Omega-3 rich foods (salmon, walnuts)\n- Complex carbs (whole grains)\n- Magnesium sources (spinach, almonds)\n- Vitamin C (citrus fruits)\n\n**Avoid**:\n- Excessive caffeine\n- High-sugar foods\n- Processed foods\n- Alcohol (can disrupt sleep)\n\n**Tips**:\n- Eat regular, balanced meals\n- Stay hydrated\n- Consider meal planning to reduce decision fatigue\n\nWould you like specific meal suggestions?"
    
    elif any(word in message_lower for word in ["exercise", "workout", "fitness", "physical"]):
        return "Exercise is one of the most effective stress relievers:\n\n**Benefits**:\n- Releases endorphins (natural mood boosters)\n- Improves sleep quality\n- Increases energy levels\n- Enhances cognitive function\n\n**Recommended**:\n- 150 minutes moderate exercise per week\n- Mix of cardio, strength, and flexibility\n- Activities you enjoy are more sustainable\n\n**Low-impact options**:\n- Walking, yoga, swimming, cycling\n- Start with 10-15 minutes and build up\n\nWhat type of exercise do you enjoy?"
    
    elif any(word in message_lower for word in ["help", "advice", "recommend", "suggest"]):
        return f"Based on your stress assessment, here are personalized recommendations:\n\n{context}\n\n**Priority Actions**:\n1. Identify your main stress triggers\n2. Practice daily stress-reduction techniques\n3. Maintain healthy routines (sleep, diet, exercise)\n4. Seek social support\n5. Consider professional guidance if needed\n\nWhat specific area would you like to explore further?"
    
    elif any(word in message_lower for word in ["thank", "thanks"]):
        return "You're very welcome! Remember, managing stress is a journey, not a destination. Don't hesitate to reach out if you have more questions or need additional support. Take care of yourself! 😊"
    
    else:
        return f"I'm here to help with your wellness journey based on your stress assessment.{context}\n\nI can help you with:\n- Stress management techniques\n- Sleep improvement strategies\n- Nutrition and diet advice\n- Exercise recommendations\n- Coping strategies\n\nWhat would you like to know more about?"
