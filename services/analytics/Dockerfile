FROM python:3.10-slim

WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY main.py ./main.py

EXPOSE 7000
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-7000}"]