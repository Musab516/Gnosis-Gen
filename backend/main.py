from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from dotenv import load_dotenv
import os
import io
import PyPDF2
import json
import re

# Load environment variables
load_dotenv()
api_key = os.getenv("OPENROUTER_API_KEY")

if not api_key:
    raise ValueError("❌ OPENROUTER_API_KEY not found in .env file")

# Initialize OpenRouter client
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=api_key,
)

# FastAPI setup
app = FastAPI(title="AI Quiz & Study Assistant")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/generate")
async def generate_content(
    mode: str = Form(..., description="'notes' or 'quiz'"),
    user_request: str = Form(None, description="User's natural instruction, e.g., 'Explain only stacks section'"),
    topic: str = Form(None, description="Topic name (optional)"),
    text_input: str = Form(None, description="Raw text or notes (optional)"),
    file: UploadFile = File(None)
):
    """
    Generates either detailed study notes or a structured quiz (MCQs + short answers).
    Accepts PDF, text, or both. Supports natural instructions like:
    - 'Explain this file in detail'
    - 'Create quiz from stack section only'
    - 'Elaborate on recursion'
    """

    content = ""

    # --- Extract from PDF if provided ---
    if file:
        if not file.filename.lower().endswith(".pdf"):
            return {"error": "Only PDF files are supported."}

        pdf_bytes = await file.read()
        reader = PyPDF2.PdfReader(io.BytesIO(pdf_bytes))
        for page in reader.pages:
            text = page.extract_text()
            if text:
                content += text + "\n"

    # --- Add text input if provided ---
    if text_input:
        content += "\n" + text_input

    if not content.strip() and not user_request:
        return {"error": "Please provide either a PDF, text input, or user request."}

    content = content.strip()[:12000]  # limit text length for safety

    # --- Build prompt dynamically ---
    base_params = {
        "model": "gpt-4o-mini",
        "messages": [],
    }

    if mode.lower() == "notes":
        # Notes generation mode
        system_message = "You are an expert AI tutor who creates detailed, structured, and easy-to-understand study notes."
        prompt = f"""
Topic: {topic or "General"}

User Request:
{user_request or "Please create comprehensive notes with explanations and examples."}

Material:
{content if content else "No material provided — use general knowledge of the topic."}
"""
        base_params["messages"] = [
            {"role": "system", "content": system_message},
            {"role": "user", "content": prompt},
        ]

    elif mode.lower() == "quiz":
        # Quiz generation mode
        system_message = "You are an expert AI quiz generator. Respond ONLY with valid JSON in the given format."
        prompt = f"""
Topic: {topic or "General"}

User Request:
{user_request or "Create a well-balanced quiz from the provided material."}

Material:
{content if content else "No material provided — use general knowledge of the topic."}

Now, generate a quiz with exactly this JSON format:

{{
  "mcq": [
    {{
      "question": "What is ...?",
      "options": ["A", "B", "C", "D"],
      "correct_answer": "B"
    }}
  ],
  "short_answer": [
    {{
      "question": "Explain ...",
      "correct_answer": "..."
    }}
  ]
}}
"""
        base_params["messages"] = [
            {"role": "system", "content": system_message},
            {"role": "user", "content": prompt},
        ]
        base_params["response_format"] = {"type": "json_object"}  # ensures structured output

    else:
        return {"error": "Invalid mode. Choose 'notes' or 'quiz'."}

    # --- API Call ---
    try:
        response = client.chat.completions.create(**base_params)
        result = response.choices[0].message.content.strip()

        if mode.lower() == "quiz":
            # Try to parse clean JSON first
            try:
                quiz_data = json.loads(result)
                return {"status": "success", "mode": "quiz", "quiz": quiz_data}

            except json.JSONDecodeError:
                # Fallback: extract JSON from code blocks
                json_match = re.search(r"```json\n(.*?)\n```", result, re.DOTALL)
                if json_match:
                    try:
                        cleaned = json_match.group(1)
                        quiz_data = json.loads(cleaned)
                        return {"status": "success", "mode": "quiz", "quiz": quiz_data}
                    except json.JSONDecodeError:
                        pass

                # Final fallback
                return {
                    "status": "warning",
                    "mode": "quiz",
                    "message": "Could not parse JSON properly. Here's raw text.",
                    "raw_output": result,
                }

        # Notes mode
        return {"status": "success", "mode": "notes", "notes": result}

    except Exception as e:
        return {"error": str(e)}
