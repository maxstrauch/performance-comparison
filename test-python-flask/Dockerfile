FROM python:3.8 AS builder

RUN mkdir /install

WORKDIR /install

COPY requirements.txt .

RUN pip install --target=/install -r requirements.txt

RUN ls -lah /install

# ---
FROM python:3.8-alpine

COPY --from=builder /install /install

ENV PYTHONPATH=/install:$PYTHONPATH
ENV PORT=8080

EXPOSE 8080

WORKDIR /app

COPY . .

CMD [ "python", "app.py" ]