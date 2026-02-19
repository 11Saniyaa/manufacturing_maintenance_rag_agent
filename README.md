# Manufacturing Maintenance RAG Agent

AI-powered maintenance assistant for manufacturing equipment using LangChain and RAG. Helps factory workers diagnose machine problems with offline local LLM support.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- LM Studio ([Download](https://lmstudio.ai/))

### Setup

1. **Install LM Studio & Model**
   - Download and install LM Studio
   - Download a model (e.g., Mistral 7B)
   - Start Local Server (runs on `http://localhost:1234`)

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   npm run seed
   npm run start:dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

## 🛠️ Tech Stack

- **Frontend**: Angular 16
- **Backend**: NestJS
- **Database**: SQLite
- **AI**: LangChain + RAG
- **LLM**: LM Studio (OpenAI-compatible API)

## 📁 Project Structure

```
├── backend/          # NestJS API with LangChain integration
├── frontend/         # Angular UI
├── knowledge-base/   # Sample data (machines, error codes)
└── database/         # SQLite database (created on first run)
```

## ⚙️ Configuration

Create `backend/.env`:
```env
LLM_PROVIDER=lmstudio
LLM_BASE_URL=http://localhost:1234/v1
LLM_MODEL=local-model
```

## 🎯 Features

- AI-powered chat interface for troubleshooting
- Machine knowledge base (Conveyor, Motor, CNC, Air Compressor)
- Error code lookup and search
- Maintenance schedule tracking
- Offline operation (no cloud services)
- Query logging

## 📝 API Endpoints

- `GET /machines` - List all machines
- `GET /error-codes/search?q=keyword` - Search error codes
- `POST /chat/query` - Send query to AI
- `GET /maintenance` - Get maintenance schedules

## 🔧 Alternative LLM Providers

Supports any OpenAI-compatible API:
- Text Generation WebUI: `http://localhost:5000/v1`
- LocalAI: `http://localhost:8080/v1`
- Custom servers: Configure in `.env`

## 📄 License

MIT License

---

**Repository**: [manufacturing_maintenance_rag_agent](https://github.com/11Saniyaa/manufacturing_maintenance_rag_agent)
