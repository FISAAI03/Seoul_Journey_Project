FROM python:3.12-slim

# ✅ uv 설치
RUN pip install --no-cache-dir uv

WORKDIR /workspace

# ✅ 파일 복사
COPY . .

# ✅ 의존성 설치
RUN uv sync

EXPOSE 5000


