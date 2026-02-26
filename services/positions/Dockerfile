FROM python:3.10-slim

WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONFAULTHANDLER=1

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
 && pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY main.py ./main.py

COPY alembic.ini ./alembic.ini
COPY migrations ./migrations

EXPOSE 4000
CMD ["uvicorn", "main:sio_app", "--host", "0.0.0.0", "--port", "4000"]