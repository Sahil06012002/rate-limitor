# Rate Limiting Proxy API

A proxy API service that handles rate limiting for third-party APIs, acting as an intermediary layer between clients and their target APIs.

## Features

- API Key Authentication
- Application Registration
- Request Proxying with Rate Limiting
- Request Queueing
- Logging and Monitoring

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   PORT=3000
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   REDIS_URL=redis://localhost:6379
   ```
  Public supabase credentials are include in the .env.example 

4. Run a redis server locally on port 6379

5. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication

- **POST /api/auth/register**
  - Register a new user and get an API key
  - No authentication required
  - Returns: `{ api_key: string }`

### Application Management

- **POST /api/apps/register**
  - Register a new application to proxy
  - Requires API key authentication
  - Body:
    ```json
    {
      "name": "string",
      "baseUrl": "string",
      "rateLimit": number,
      "timeWindow": number
    }
    ```

- **GET /api/apps**
  - List all registered applications
  - Requires API key authentication

### Proxy Endpoints

- **ANY /api/apis/:appId/**
  - Proxy endpoint for registered applications
  - Requires API key authentication
  - All HTTP methods supported
  - Path after appId is forwarded to the target API

## Rate Limiting Strategy

The service implements a Token Bucket rate limiting strategy:

1. Each application has a bucket of tokens (rate limit)
2. Tokens are consumed with each request
3. Tokens are replenished after the time window
4. When no tokens are available:
   - Requests are queued
   - 429 status code is returned with queue position
   - Requests are processed when tokens become available

## Error Handling

- 401: Unauthorized (missing or invalid API key)
- 404: App not found
- 429: Rate limit exceeded
- 500: Internal server error

## Monitoring and Logging

- Request logging using Morgan
- Application logging using Winston
- Logs stored in:
  - console (all levels)
  - error.log (error level)
  - combined.log (all levels)

## Example Usage

1. Register for an API key:
```bash
curl -X POST http://localhost:3000/api/auth/register
```

2. Register an application:
```bash
curl -X POST http://localhost:3000/api/apps/register \
  -H "X-API-Key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Example API",
    "baseUrl": "https://api.example.com",
    "rateLimit": 100,
    "timeWindow": 3600
  }'
```

3. Use the proxy:
```bash
curl http://localhost:3000/api/apis/your_app_id/endpoint \
  -H "X-API-Key: your_api_key"
```
