# Use official Python 3.12 slim base image
FROM python:3.12-slim

# Set standard environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    STREAMLIT_SERVER_PORT=8501 \
    STREAMLIT_SERVER_ADDRESS=0.0.0.0

WORKDIR /workspace

# Install system dependencies for build requirements and health checks
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install python packages
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy project workspace files
COPY . .

# Expose port for Streamlit
EXPOSE 8501

# Set Streamlit healthcheck
HEALTHCHECK CMD curl --fail http://localhost:8501/_stcore/health || exit 1

# Launch main Streamlit entrypoint
ENTRYPOINT ["streamlit", "run", "app/1_🏛️_Enterprise_Dashboard.py"]
