FROM python:3.10-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    python3-dev \
    libpq-dev \
    curl \
    wget \
    gnupg \
    software-properties-common \
    openjdk-17-jdk \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js (LTS)
RUN curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - && \
    apt-get install -y nodejs && \
    npm cache clean --force

# Install Docker CLI
RUN curl -fsSL https://get.docker.com | sh && \
    useradd -m -u 1000 appuser && \
    usermod -aG docker appuser

# Set up working directory
WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    DJANGO_SETTINGS_MODULE=code_editor.settings \
    NODE_ENV=production \
    DOCKER_HOST=unix:///var/run/docker.sock \
    JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64 \
    PATH=/usr/lib/jvm/java-17-openjdk-amd64/bin:$PATH

# Set up /tmp/java
RUN mkdir -p /tmp/java && \
    chown appuser:docker /tmp/java && \
    chmod 775 /tmp/java

USER appuser

EXPOSE 8000

CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "code_editor.asgi:application"]