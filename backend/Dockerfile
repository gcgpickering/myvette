FROM python:3.12-slim

WORKDIR /app

# Install system deps + Node.js (for gltf-transform Draco compression)
# Also install Playwright's Chromium dependencies upfront
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    # Playwright Chromium dependencies
    libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 \
    libdbus-1-3 libxkbcommon0 libatspi2.0-0 libxcomposite1 libxdamage1 \
    libxfixes3 libxrandr2 libgbm1 libpango-1.0-0 libcairo2 libasound2 \
    libxshmfence1 \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install gltf-transform CLI for Draco mesh compression
RUN npm install -g @gltf-transform/cli 2>/dev/null || true

# Install Python deps (updated 2026-04-02)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && pip install --no-cache-dir firecrawl-py==4.21.0

# Install Playwright Chromium browser
RUN playwright install chromium

# Copy app code
COPY . .

# Create model cache directory
RUN mkdir -p static/models

# Start uvicorn on Railway's $PORT (fallback 8000)
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
