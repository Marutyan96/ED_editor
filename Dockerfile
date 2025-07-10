# Используем официальный образ Python
FROM python:3.10-slim

# Установка системных зависимостей
RUN apt-get update && apt-get install -y --fix-missing \
    build-essential \
    gcc \
    g++ \
    make \
    cmake \
    python3-dev \
    libpq-dev \
    openjdk-17-jdk \
    mono-devel \
    mono-mcs \
    mono-runtime \
    php-cli \
    php-common \
    curl \
    wget \
    gnupg \
    software-properties-common \
    sudo \
    && rm -rf /var/lib/apt/lists/*

# Установка Node.js (LTS)
RUN curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - && \
    apt-get install -y nodejs && \
    npm cache clean --force

# Установка Docker CLI
RUN curl -fsSL https://get.docker.com | sh

# Установка Go
RUN curl -fsSL https://dl.google.com/go/go1.20.linux-amd64.tar.gz -o go.tar.gz && \
    tar -C /usr/local -xzf go.tar.gz && \
    rm go.tar.gz && \
    ln -s /usr/local/go/bin/go /usr/local/bin/go && \
    ln -s /usr/local/go/bin/gofmt /usr/local/bin/gofmt

# Создание пользователя приложения
RUN useradd -m -u 1000 appuser && \
    usermod -aG docker appuser

# Настройка рабочей директории
WORKDIR /app

# Создание и настройка директорий для временных файлов
RUN mkdir -p \
    /app/temp \
    /tmp/c_temp \
    /tmp/csharp_temp \
    /tmp/php_temp \
    /tmp/java \
    /tmp/go_temp && \
    chown -R appuser:appuser \
    /app/temp \
    /tmp/c_temp \
    /tmp/csharp_temp \
    /tmp/php_temp \
    /tmp/java \
    /tmp/go_temp && \
    chmod -R 777 \
    /app/temp \
    /tmp/c_temp \
    /tmp/csharp_temp \
    /tmp/php_temp \
    /tmp/java \
    /tmp/go_temp

# Установка Python-зависимостей
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копирование кода приложения с правильными правами
COPY --chown=appuser:appuser . .

# Настройка переменных окружения
ENV PYTHONUNBUFFERED=1 \
    DJANGO_SETTINGS_MODULE=code_editor.settings \
    NODE_ENV=production \
    DOCKER_HOST=unix:///var/run/docker.sock \
    JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64 \
    PATH=/usr/lib/jvm/java-17-openjdk-amd64/bin:/usr/local/go/bin:$PATH \
    TEMP_DIR=/app/temp \
    C_TEMP_DIR=/tmp/c_temp \
    CSHARP_TEMP_DIR=/tmp/csharp_temp \
    PHP_TEMP_DIR=/tmp/php_temp \
    JAVA_TMP_DIR=/tmp/java \
    GO_TEMP_DIR=/tmp/go_temp

# Проверка доступности директорий и установленных пакетов
RUN echo "Проверка прав доступа:" && \
    ls -ld /app/temp && \
    ls -ld /tmp/c_temp && \
    ls -ld /tmp/csharp_temp && \
    ls -ld /tmp/php_temp && \
    ls -ld /tmp/java && \
    ls -ld /tmp/go_temp && \
    touch /app/temp/test && \
    touch /tmp/c_temp/test && \
    touch /tmp/csharp_temp/test && \
    touch /tmp/php_temp/test && \
    touch /tmp/java/test && \
    touch /tmp/go_temp/test && \
    echo "Проверка установки Mono:" && \
    mcs --version && \
    mono --version && \
    echo "Проверка установки PHP:" && \
    php --version && \
    php -r "echo 'PHP работает!';" && \  
    echo "Проверка установки Go:" && \
    go version && \
    echo "Проверка WebSocket-подключения:" && \
    python3 -c "import websockets; print('WebSockets доступны')" && \ 
    echo "Все проверки пройдены успешно"

# Переключение на пользователя приложения
USER appuser

# Открываем порты
EXPOSE 8000 8001

# Команда запуска
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "code_editor.asgi:application"]