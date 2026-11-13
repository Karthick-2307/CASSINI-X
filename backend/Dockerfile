# ASTRA-X Backend Dockerfile (Optional / Deployment Preparation)
# Note: Marked optional/untested per Part 8 instructions if local Docker engine is not available.

FROM python:3.11-slim

# Install system dependencies for GDAL/Rasterio and C compilers
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgdal-dev \
    gdal-bin \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency requirements first for layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY . .

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    ASTRAX_DB_PATH="data/astrax.db" \
    ASTRAX_DATA_DIR="data" \
    ASTRAX_DEMO_MODE="false"

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
