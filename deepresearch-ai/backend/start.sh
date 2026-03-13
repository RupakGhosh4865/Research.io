#!/bin/bash

# Start the Celery worker in the background
# -P solo is used because Render free tier has limited resources
echo "Starting Celery Worker..."
celery -A celery_worker.celery_app worker --loglevel=info -P solo &

# Start the FastAPI server
echo "Starting FastAPI Server..."
exec uvicorn main:app --host 0.0.0.0 --port $PORT
