FROM python:3.9-slim

WORKDIR /app

COPY ./services/node-engine/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ./services/node-engine /app

EXPOSE 5001

CMD ["gunicorn", "--bind", "0.0.0.0:5001", "wsgi:app"]
