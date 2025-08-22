import sys
import os
from dotenv import load_dotenv
from huggingface_hub import InferenceClient

# Load environment variables from .env
load_dotenv()

# Get Hugging Face API token
HF_TOKEN = os.getenv("HF_TOKEN")
if not HF_TOKEN:
    print("Error: HF_TOKEN not found in .env file", file=sys.stderr)
    sys.exit(1)

# Initialize Hugging Face client
try:
    client = InferenceClient(api_key=HF_TOKEN)
except Exception as e:
    print(f"Error initializing InferenceClient: {str(e)}", file=sys.stderr)
    sys.exit(1)

# Get audio file path from command-line argument
if len(sys.argv) < 2:
    print("Error: No audio file path provided", file=sys.stderr)
    sys.exit(1)

audio_file = sys.argv[1]

# Verify file exists
if not os.path.exists(audio_file):
    print(f"Error: Audio file {audio_file} not found", file=sys.stderr)
    sys.exit(1)

try:
    with open(audio_file, "rb") as f:
        audio_bytes = f.read()

    # Transcribe audio using Whisper model
    output = client.automatic_speech_recognition(
        audio_bytes, model="openai/whisper-large-v3"
    )

    # Output transcription to stdout
    print(output["text"])

except Exception as e:
    print(f"Error during transcription: {str(e)}", file=sys.stderr)
    sys.exit(1)