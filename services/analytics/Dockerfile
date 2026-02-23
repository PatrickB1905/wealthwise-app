FROM python:3.10-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

RUN pip install --upgrade pip

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY app ./app
COPY main.py ./main.py

RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 7000

HEALTHCHECK --interval=10s --timeout=5s --retries=15 \
  CMD python -c "import os,urllib.request; p=os.getenv('ANALYTICS_PORT','7000'); urllib.request.urlopen(f'http://localhost:{p}/api/health').read()"

CMD ["sh", "-c", "gunicorn -k uvicorn.workers.UvicornWorker -w ${WEB_CONCURRENCY:-2} -b 0.0.0.0:${ANALYTICS_PORT:-7000} main:app --access-logfile - --error-logfile -"]