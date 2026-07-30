# Use official Python 3.12 slim base image
FROM python:3.12-slim

# Set standard environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# Install system dependencies for build requirements
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy root requirements.txt first
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy backend files and root src/ folder
COPY backend/ ./backend
COPY src/ ./src
COPY models/ ./models
COPY reports/ ./reports

EXPOSE 8000

# Set FastAPI healthcheck
HEALTHCHECK CMD curl --fail http://localhost:8000/health || exit 1

# Launch main uvicorn app
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
