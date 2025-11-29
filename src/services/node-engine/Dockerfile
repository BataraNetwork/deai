# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Set the PYTHONPATH environment variable to include the project root
ENV PYTHONPATH "${PYTHONPATH}:."

# Copy the requirements file into the container at /usr/src/app
COPY services/node-engine/requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire project context into the container
# This makes all modules available for import
COPY . .

# Make port 8080 available to the world outside this container
EXPOSE 8080

# The CMD is removed from here because it is defined in docker-compose.yml
# This allows the same image to be used for both the web server and the celery worker.
