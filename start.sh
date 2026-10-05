#!/bin/bash

cd "$(dirname "$0")"

echo "========================================"
echo "       FinPilot AI"
echo "   Starting FastAPI Server..."
echo "========================================"

if [ ! -d "venv" ]; then
    echo "Error: Virtual environment not found."
    echo "Please create the venv first."
    exit 1
fi

source venv/bin/activate

echo ""
echo "FinPilot AI server is starting..."
echo ""
echo "Mac:"
echo "http://127.0.0.1:8001"
echo ""
echo "Swagger:"
echo "http://127.0.0.1:8001/docs"
echo ""

uvicorn backend.main:app --reload --host 0.0.0.0 --port 8001