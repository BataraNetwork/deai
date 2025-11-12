
FROM python:3.11-slim

WORKDIR /app

COPY ./node-engine/requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

COPY ./node-engine /app

CMD ["python", "app.py"]
