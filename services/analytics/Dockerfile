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
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:7000/api/health').read()"

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-7000} --proxy-headers"]