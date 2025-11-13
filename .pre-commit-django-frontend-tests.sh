#!/bin/bash

# Exit immediately if a command fails
set -e

echo "Activating Python venv..."
source ./backend/venv/Scripts/activate || source ./backend/venv/bin/activate

echo "Running Django backend tests..."
cd backend
pytest --maxfail=1 --disable-warnings
cd ..

echo "Running frontend tests..."
cd frontend
npm install
npm test -- --watchAll=false
cd ..

echo "All tests passed!"
