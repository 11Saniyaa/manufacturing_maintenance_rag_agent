# Manufacturing Maintenance RAG Agent

AI-powered maintenance assistant for manufacturing equipment using LangChain and RAG.

## Quick Start

### Prerequisites
- Node.js (v18+)
- Groq API key or LM Studio

### Setup

1. **Backend**
   ```bash
   cd backend
   npm install
   npm start
   ```

2. **Frontend**
   ```bash
   cd frontend
   npm install
   npm start
   ```

3. **Configuration**

   Create `backend/.env`:
   ```env
   LLM_PROVIDER=openai
   LLM_BASE_URL=https://api.groq.com/openai/v1
   LLM_MODEL=llama-3.1-8b-instant
   LLM_API_KEY=your_groq_api_key_here
   PORT=3000
   ```

   Get Groq API key: https://console.groq.com/

## Tech Stack

- **Frontend**: Angular 17
- **Backend**: NestJS
- **Database**: SQLite
- **AI**: LangChain + RAG

## Features

- AI-powered troubleshooting chat
- Machine-specific context-aware responses
- Error code lookup and search
- Maintenance schedule tracking
- Query logging

## API Endpoints

- `GET /machines` - List machines
- `GET /machines/:id` - Get machine details
- `GET /error-codes/search?q=keyword` - Search error codes
- `POST /chat/query` - Send query to AI (supports machineId)
- `GET /maintenance` - Get maintenance schedules

## License

MIT License
