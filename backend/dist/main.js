"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: 'http://localhost:4200',
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe());
    const port = process.env.PORT || 3000;
    const llmProvider = process.env.LLM_PROVIDER || 'lmstudio';
    const llmBaseUrl = process.env.LLM_BASE_URL || 'http://localhost:1234/v1';
    const llmModel = process.env.LLM_MODEL || 'default';
    const llmApiKey = process.env.LLM_API_KEY;
    await app.listen(port);
    console.log(`🚀 Backend server running on http://localhost:${port}`);
    console.log(`🤖 LLM Provider: ${llmProvider}`);
    console.log(`🔗 LLM Base URL: ${llmBaseUrl}`);
    console.log(`📦 LLM Model: ${llmModel}`);
    if (llmApiKey) {
        console.log(`🔑 API Key: ${llmApiKey.substring(0, 8)}...${llmApiKey.substring(llmApiKey.length - 4)} (configured)`);
    }
    else {
        console.log(`⚠️  API Key: Not set (using 'not-needed' - may fail for cloud providers like Groq)`);
    }
    console.log(`💡 To change LLM provider, set LLM_PROVIDER environment variable (lmstudio or openai)`);
    console.log(`📖 See README.md for setup instructions`);
}
bootstrap();
//# sourceMappingURL=main.js.map