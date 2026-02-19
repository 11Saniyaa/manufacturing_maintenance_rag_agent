# Manufacturing Equipment Maintenance Query Agent

A full-stack web application that helps factory workers diagnose machine problems and get maintenance guidance using AI, without needing an expert on-site.

## 🎯 Features

- **AI-Powered Chat Interface**: Ask questions in plain English and get intelligent troubleshooting guidance
- **Machine Knowledge Base**: Pre-loaded with information about:
  - Conveyor systems
  - Industrial motors
  - CNC machines
  - Air compressors
- **Error Code Lookup**: Quick search for error codes and their meanings
- **Troubleshooting Suggestions**: Step-by-step guidance for common issues
- **Maintenance Schedules**: Periodic servicing recommendations
- **Offline Operation**: Runs completely offline using local LLM (Ollama)
- **Query Logging**: All queries are stored locally for analysis

## 🛠️ Tech Stack

### Frontend
- **Angular 16**: Modern web framework
- **Responsive UI**: Clean, chat-style interface
- **Components**: Machine selector, error code search, chat interface

### Backend
- **NestJS**: Node.js framework for REST API
- **SQLite**: Local database storage
- **LangChain**: AI orchestration framework
- **Ollama**: Local LLM runtime (Mistral or Llama3)

### Storage
- **SQLite Database**: Stores machines, error codes, troubleshooting steps, maintenance schedules, and query logs

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
2. **npm** (comes with Node.js)
3. **Local LLM Server** - Choose one:
   - **LM Studio** (Recommended) - [Download](https://lmstudio.ai/) - GUI-based, easiest to use
   - **Text Generation WebUI** - [Download](https://github.com/oobabooga/text-generation-webui) - Advanced users
   - **LocalAI** - [Download](https://github.com/go-skynet/LocalAI) - Self-hosted option
   - **Any OpenAI-compatible API** - Works with most local LLM servers

## 🚀 Setup Instructions

### Step 1: Install Local LLM Server

**Recommended: LM Studio (Easiest for Windows)**

1. Download LM Studio from [https://lmstudio.ai/](https://lmstudio.ai/)
2. Install and launch LM Studio
3. Download a model:
   - Go to "Search" tab
   - Search for a model (e.g., "Mistral 7B", "Llama 3", "Phi-3")
   - Click "Download" on your preferred model
   - Wait for download to complete
4. Start the Local Server:
   - Go to "Local Server" tab
   - Click "Start Server"
   - Server runs on `http://localhost:1234` by default
   - You should see "Server running" message

**Alternative Options:**
- **Text Generation WebUI**: [Setup Guide](https://github.com/oobabooga/text-generation-webui) - Runs on port 5000
- **LocalAI**: [Setup Guide](https://github.com/go-skynet/LocalAI) - Runs on port 8080
- **Any OpenAI-compatible API**: Configure the base URL in `.env` file

### Step 2: Set Up Backend

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Seed the database with sample data:
```bash
npm run seed
```

This will create the SQLite database and populate it with sample machines, error codes, and maintenance schedules.

4. Start the backend server:
```bash
npm run start:dev
```

The backend will run on `http://localhost:3000`

### Step 3: Set Up Frontend

1. Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the Angular development server:
```bash
npm start
```

The frontend will run on `http://localhost:4200` and automatically open in your browser.

## 📁 Project Structure

```
Maintenance_Query_Agent/
├── backend/                 # NestJS backend
│   ├── src/
│   │   ├── chat/           # Chat module with AI integration
│   │   ├── machine/        # Machine management
│   │   ├── error-code/     # Error code lookup
│   │   ├── maintenance/    # Maintenance schedules
│   │   ├── query-log/      # Query logging
│   │   ├── database/       # Database configuration and seeding
│   │   └── main.ts         # Application entry point
│   ├── database/           # SQLite database files (created on first run)
│   └── package.json
├── frontend/                # Angular frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── chat/              # Chat interface
│   │   │   │   ├── machine-selector/  # Machine selection dropdown
│   │   │   │   └── error-code-search/ # Error code search panel
│   │   │   └── services/
│   │   │       └── api.service.ts     # API communication
│   │   └── styles.css
│   └── package.json
├── knowledge-base/          # JSON seed data
│   ├── machines.json
│   ├── error-codes.json
│   ├── troubleshooting.json
│   └── maintenance-schedules.json
└── README.md
```

## 🎮 Usage

### Using the Chat Interface

1. **Select a Machine** (optional): Choose a specific machine from the dropdown to get context-aware responses
2. **Ask a Question**: Type your question in plain English, for example:
   - "My motor is overheating, what should I do?"
   - "What does error code E45 mean?"
   - "How do I maintain the conveyor belt?"
3. **Get AI Response**: The system will analyze your query and provide step-by-step troubleshooting guidance

### Using Error Code Lookup

1. Enter an error code (e.g., "E45") or keyword in the search box
2. View matching error codes with their meanings
3. Click on an error code to see detailed troubleshooting steps

## 🔧 Configuration

### Changing the LLM Provider/Model

**Method 1: Environment Variables (Recommended)**

Create a `.env` file in the `backend` folder:
```env
LLM_PROVIDER=lmstudio        # Options: 'lmstudio' or 'openai'
LLM_BASE_URL=http://localhost:1234/v1
LLM_MODEL=local-model
```

**Method 2: PowerShell Environment Variables**

```powershell
$env:LLM_PROVIDER="lmstudio"
$env:LLM_BASE_URL="http://localhost:1234/v1"
$env:LLM_MODEL="local-model"
```

**Method 3: Edit Code**

Edit `backend/src/chat/chat.service.ts` to change defaults.

**For Text Generation WebUI:**
```env
LLM_PROVIDER=openai
LLM_BASE_URL=http://localhost:5000/v1
LLM_MODEL=local-model
```

### Changing the Backend Port

Edit `backend/src/main.ts`:

```typescript
const port = process.env.PORT || 3000; // Change default port here
```

### Changing the Frontend Port

Edit `frontend/angular.json` or use:

```bash
ng serve --port 4201
```

## 📊 Database

The SQLite database is stored in `backend/database/maintenance.db`. It contains:

- **machines**: Machine inventory
- **error_codes**: Error codes and troubleshooting steps
- **maintenance_schedules**: Periodic maintenance tasks
- **query_logs**: User query history

To reset the database, delete `backend/database/maintenance.db` and run `npm run seed` again.

## 🐛 Troubleshooting

### Backend Issues

**Problem**: Backend won't start
- **Solution**: Make sure port 3000 is not in use, or change the port in `main.ts`

**Problem**: Database errors
- **Solution**: Delete `backend/database/maintenance.db` and run `npm run seed` again

**Problem**: Ollama connection errors
- **Solution**: 
  1. Verify Ollama is running: `ollama list`
  2. Check if the model is installed: `ollama pull mistral`
  3. Verify Ollama is accessible at `http://localhost:11434`

### Frontend Issues

**Problem**: Frontend can't connect to backend
- **Solution**: 
  1. Verify backend is running on `http://localhost:3000`
  2. Check CORS settings in `backend/src/main.ts`
  3. Check the API URL in `frontend/src/app/services/api.service.ts`

**Problem**: Angular build errors
- **Solution**: 
  1. Delete `node_modules` and `package-lock.json`
  2. Run `npm install` again
  3. Clear Angular cache: `rm -rf .angular/cache` (or delete manually on Windows)

### Ollama Issues

**Problem**: AI responses not working
- **Solution**: 
  1. Ensure Ollama is installed and running
  2. Verify a model is installed: `ollama list`
  3. Test Ollama directly: `ollama run mistral`
  4. Check backend logs for error messages

**Problem**: Slow AI responses
- **Solution**: 
  1. Use a smaller model (Mistral instead of Llama3)
  2. Reduce the `temperature` parameter in `chat.service.ts`
  3. Ensure your system has adequate RAM

## 🔒 Security Notes

- This application runs **completely offline** - no data is sent to external services
- All data is stored locally in SQLite
- No API keys or cloud services required
- Perfect for sensitive manufacturing environments

## 📝 Adding New Data

### Adding a New Machine

1. Use the API endpoint:
```bash
POST http://localhost:3000/machines
Content-Type: application/json

{
  "name": "New Machine",
  "type": "Motor",
  "description": "Description here",
  "manufacturer": "Manufacturer",
  "model": "Model-123"
}
```

2. Or edit `backend/src/database/seed.ts` and re-run `npm run seed`

### Adding Error Codes

Similar to adding machines, use the API or edit the seed file.

## 🚀 Production Deployment

For production use:

1. **Backend**:
   - Set `synchronize: false` in `app.module.ts` TypeORM config
   - Use environment variables for configuration
   - Build: `npm run build`
   - Run: `npm run start:prod`

2. **Frontend**:
   - Build: `ng build --configuration production`
   - Serve the `dist/` folder with a web server

## 📚 API Endpoints

### Machines
- `GET /machines` - Get all machines
- `GET /machines/:id` - Get machine by ID
- `GET /machines/type/:type` - Get machines by type
- `POST /machines` - Create new machine

### Error Codes
- `GET /error-codes` - Get all error codes
- `GET /error-codes/search?q=keyword` - Search error codes
- `GET /error-codes/code/:code` - Get error code by code
- `GET /error-codes/machine/:machineId` - Get error codes for machine

### Chat
- `POST /chat/query` - Send query to AI
  ```json
  {
    "query": "My motor is overheating",
    "machineId": 1
  }
  ```

### Maintenance
- `GET /maintenance` - Get all maintenance schedules
- `GET /maintenance/search?q=keyword` - Search maintenance
- `GET /maintenance/machine/:machineId` - Get maintenance for machine

## 🤝 Contributing

This is a standalone application. To extend it:

1. Add more machine types in the seed data
2. Expand the knowledge base with more error codes
3. Enhance the AI prompts for better responses
4. Add more features to the frontend

## 📄 License

MIT License - Feel free to use and modify for your needs.

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Check that Ollama is running and a model is installed
4. Review the console logs for error messages

---

**Built with ❤️ for factory workers who need quick maintenance guidance**

