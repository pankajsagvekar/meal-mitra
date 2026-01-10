@echo off
echo Starting FastAPI backend...

REM Activate virtual environment (if exists)
IF EXIST venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
)

uvicorn main:app --host 0.0.0.0 --port 8000 --reload

pause

