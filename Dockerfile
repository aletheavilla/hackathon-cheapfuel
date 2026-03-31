# Stage 1: Build React frontend
FROM node:18-slim AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Python dependencies
FROM python:3.8 AS builder

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1
WORKDIR /app

RUN python -m venv .venv
COPY pyproject.toml README.md ./
COPY backend ./backend
RUN .venv/bin/pip install .

# Stage 3: Final image
FROM python:3.8-slim
WORKDIR /app
COPY --from=builder /app/.venv .venv/
COPY --from=frontend-builder /app/frontend/build ./frontend/build
COPY . .
CMD ["/app/.venv/bin/flask", "--app", "backend.app", "run", "--host=0.0.0.0", "--port=8080"]
