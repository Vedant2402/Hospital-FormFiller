# Backend

## Installation

Docker must be installed.

## Folders

Following folder must exist in root.

```bash
databases/   # SQLite files
data/        # Uploaded/static files
temp/        # Temporary files
```

## Files

Following files must exist in root.

`serviceAccountKey.json` - Firebase Admin SDK file.

## Environment file

`.env` must include -

```bash
HF_TOKEN=<token>
FIREBASE_API_KEY=<api_key>
FLASK_SECRET_KEY=<secret_key>
```

`<token>` your huggingface token.

## Docker

Build docker image.

```bash
docker compose build
```

Run docker container.

```bash
docker compose up -d
```

`-d` to avoid logs in the terminal.

## Server

This will start the app on [http://127.0.0.1:5001](http://127.0.0.1:5001).
