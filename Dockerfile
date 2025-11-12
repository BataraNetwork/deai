# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Install Redis
RUN apt-get update && apt-get install -y redis-server

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container at /app
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application's code into the container at /app
COPY . .

# Make the entrypoint script executable
RUN chmod +x entrypoint.sh

# Make port 8080 available to the world outside this container
EXPOSE 8080

# Define environment variables
ENV PORT 8080
ENV MODEL_NAME gemma
ENV API_KEY default-secret-key

# Start Redis and then the application
CMD redis-server --daemonize yes && ./entrypoint.sh
