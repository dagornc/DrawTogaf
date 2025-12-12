#!/bin/bash
set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== Starting DrawTogaf Development Environment ===${NC}"

# Function to kill process on port
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port)
    if [ -n "$pid" ]; then
        echo -e "${BLUE}Killing process $pid on port $port...${NC}"
        kill -9 $pid
    fi
}

# Cleanup existing processes
kill_port 8000
kill_port 5173

# Check for backend folder
if [ ! -d "backend" ]; then
    echo "Backend directory not found. Creating..."
    mkdir -p backend
fi

# Check for frontend folder
if [ ! -d "frontend" ]; then
    echo "Frontend directory not found. Creating..."
    mkdir -p frontend
fi

# Start Backend
echo -e "${GREEN}>>> Starting Backend...${NC}"
(
    cd backend
    if [ -f "requirements.txt" ]; then
        echo "Installing Python dependencies..."
        pip install -r requirements.txt
    fi
    # Check if uvicorn is available, otherwise just echo
    if command -v uvicorn &> /dev/null; then
        uvicorn app.main:app --reload --port 8000
    else
        echo "Uvicorn not found or app.main not ready. Skipping backend launch."
    fi
) &
BACKEND_PID=$!

# Start Frontend
echo -e "${GREEN}>>> Starting Frontend...${NC}"
(
    cd frontend
    if [ -f "package.json" ]; then
        echo "Installing Node dependencies..."
        npm install
        npm run dev
    else
        echo "package.json not found. Skipping frontend launch."
    fi
) &
FRONTEND_PID=$!

# Open Google Chrome
(
    sleep 3
    echo -e "${GREEN}>>> Opening Google Chrome...${NC}"
    open -a "Google Chrome" http://localhost:5173 || echo "Could not open Google Chrome"
) &

# Cleanup on exit
trap "kill \$BACKEND_PID \$FRONTEND_PID" EXIT

echo -e "${BLUE}=== Services Started (PIDs: Backend=\$BACKEND_PID, Frontend=\$FRONTEND_PID) ===${NC}"
wait
