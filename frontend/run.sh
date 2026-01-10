#!/bin/bash

echo "Starting FastAPI backend..."

# Activate virtual environment (if exists)
if [ -d "venv" ]; then
    source venv/bin/activate
fi

uvicorn main:app --host 0.0.0.0 --port 8000 --reload

