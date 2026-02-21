# Manufacturing Maintenance RAG Agent

AI-powered maintenance assistant for manufacturing equipment using LangChain and RAG.

## Quick Start

### Prerequisites
- Node.js (v18+)
- LM Studio or Groq API key

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
   LLM_API_KEY=your_api_key_here
   PORT=3000
   ```

   **For local LLM (LM Studio):**
   ```env
   LLM_PROVIDER=lmstudio
   LLM_BASE_URL=http://localhost:1234/v1
   LLM_MODEL=your-model-name
   PORT=3000
   ```

## Tech Stack

- **Frontend**: Angular 17
- **Backend**: NestJS
- **Database**: SQLite
- **AI**: LangChain + RAG

## Features

- AI-powered troubleshooting chat
- Machine knowledge base & error code lookup
- Maintenance schedule tracking
- Query logging

## API Endpoints

- `GET /machines` - List machines
- `GET /error-codes/search?q=keyword` - Search error codes
- `POST /chat/query` - Send query to AI
- `GET /maintenance` - Get maintenance schedules

## License

MIT License
