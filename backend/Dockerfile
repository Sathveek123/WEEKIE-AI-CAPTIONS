FROM python:3.11-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p data/temp data/output

ENV PORT=8095
EXPOSE 8095

CMD sh -c "gunicorn --bind 0.0.0.0:${PORT:-8095} --timeout 600 --workers 2 'app:create_app()'"
