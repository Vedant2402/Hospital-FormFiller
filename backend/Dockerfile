FROM python:3.12-slim

WORKDIR /app

# Install system dependencies for building packages like llama-cpp-python
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    git \
    g++ \
    make \
    libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip setuptools wheel
# RUN pip install --no-cache-dir -r requirements.txt # Use --no-cache-dir to reduce image size

# Install with cache for faster builds
RUN pip install -r requirements.txt 

# Copy Python code
COPY src/ ./src

# Copy database, data, and temp folders
COPY databases/ ./databases
COPY data/ ./data
COPY temp/ ./temp

# Expose Flask port
EXPOSE 5000

# Start Flask app
CMD ["python", "-m", "src.server"]
