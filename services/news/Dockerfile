FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .env ./

EXPOSE 6500
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "6500"]