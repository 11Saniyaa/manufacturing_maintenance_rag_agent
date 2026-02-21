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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const machine_service_1 = require("../machine/machine.service");
const error_code_service_1 = require("../error-code/error-code.service");
const maintenance_service_1 = require("../maintenance/maintenance.service");
const query_log_service_1 = require("../query-log/query-log.service");
let ChatService = class ChatService {
    constructor(machineService, errorCodeService, maintenanceService, queryLogService) {
        this.machineService = machineService;
        this.errorCodeService = errorCodeService;
        this.maintenanceService = maintenanceService;
        this.queryLogService = queryLogService;
    }
    async processQuery(query, machineId) {
        try {
            const context = await this.buildContext(query, machineId);
            const systemPrompt = this.buildSystemPrompt(context);
            const llmProvider = process.env.LLM_PROVIDER || 'lmstudio';
            const llmBaseUrl = process.env.LLM_BASE_URL || this.getDefaultBaseUrl(llmProvider);
            const llmModel = process.env.LLM_MODEL || this.getDefaultModel(llmProvider);
            const llmApiKey = process.env.LLM_API_KEY || 'not-needed';
            const { HumanMessage, SystemMessage } = await Promise.resolve().then(() => __importStar(require('@langchain/core/messages')));
            const { ChatOpenAI } = await Promise.resolve().then(() => __importStar(require('@langchain/openai')));
            const model = new ChatOpenAI({
                modelName: llmModel,
                openAIApiKey: llmApiKey,
                configuration: {
                    baseURL: llmBaseUrl,
                },
                temperature: 0.7,
            });
            const messages = [
                new SystemMessage(systemPrompt),
                new HumanMessage(query),
            ];
            const response = await model.invoke(messages);
            const responseText = response.content;
            await this.queryLogService.create({
                query,
                response: responseText,
                machineId: machineId || null,
            });
            return responseText;
        }
        catch (error) {
            console.error(`Error processing query with ${process.env.LLM_PROVIDER || 'lmstudio'}:`, error);
            if (error.message && (error.message.includes('401') || error.message.includes('Unauthorized') || error.message.includes('API key'))) {
                console.error('⚠️  Authentication error: Check your LLM_API_KEY in .env file');
            }
            return this.getFallbackResponse(query, machineId);
        }
    }
    getDefaultBaseUrl(provider) {
        switch (provider.toLowerCase()) {
            case 'lmstudio':
                return 'http://localhost:1234/v1';
            case 'openai':
                return 'http://localhost:1234/v1';
            default:
                return 'http://localhost:1234/v1';
        }
    }
    getDefaultModel(provider) {
        switch (provider.toLowerCase()) {
            case 'lmstudio':
                return 'local-model';
            case 'openai':
                return 'local-model';
            default:
                return 'local-model';
        }
    }
    async buildContext(query, machineId) {
        const context = {
            machines: [],
            errorCodes: [],
            maintenance: [],
        };
        if (machineId) {
            const machine = await this.machineService.findOne(machineId);
            if (machine) {
                context.machines.push(machine);
                context.errorCodes = await this.errorCodeService.findByMachineId(machineId);
                context.maintenance = await this.maintenanceService.findByMachineId(machineId);
            }
        }
        else {
            context.machines = await this.machineService.findAll();
        }
        const errorCodeMatches = await this.errorCodeService.search(query);
        context.errorCodes.push(...errorCodeMatches);
        const maintenanceMatches = await this.maintenanceService.search(query);
        context.maintenance.push(...maintenanceMatches);
        return context;
    }
    buildSystemPrompt(context) {
        let prompt = `You are a helpful maintenance assistant for manufacturing equipment. 
Your role is to help factory workers diagnose machine problems and provide clear, actionable maintenance guidance.

KNOWLEDGE BASE:

`;
        if (context.machines.length > 0) {
            prompt += 'AVAILABLE MACHINES:\n';
            context.machines.forEach((machine) => {
                prompt += `- ${machine.name} (${machine.type}): ${machine.description || 'No description'}\n`;
            });
            prompt += '\n';
        }
        if (context.errorCodes.length > 0) {
            prompt += 'ERROR CODES:\n';
            context.errorCodes.slice(0, 10).forEach((errorCode) => {
                prompt += `- ${errorCode.code}: ${errorCode.meaning}\n`;
                prompt += `  Description: ${errorCode.description}\n`;
                prompt += `  Troubleshooting: ${errorCode.troubleshootingSteps}\n\n`;
            });
        }
        if (context.maintenance.length > 0) {
            prompt += 'MAINTENANCE SCHEDULES:\n';
            context.maintenance.slice(0, 10).forEach((maintenance) => {
                prompt += `- ${maintenance.task} (${maintenance.frequency}): ${maintenance.description}\n`;
                prompt += `  Steps: ${maintenance.steps}\n\n`;
            });
        }
        prompt += `
INSTRUCTIONS:
1. Analyze the user's query and match it with relevant information from the knowledge base.
2. Provide clear, step-by-step troubleshooting guidance.
3. If an error code is mentioned, explain what it means and how to fix it.
4. Suggest preventive maintenance if relevant.
5. Use simple, clear language that factory workers can understand.
6. If you don't have specific information, provide general best practices.
7. Always prioritize safety in your recommendations.

Respond in a helpful, professional manner.`;
        return prompt;
    }
    async getFallbackResponse(query, machineId) {
        const context = await this.buildContext(query, machineId);
        let response = "I'm here to help with maintenance issues. ";
        if (context.errorCodes.length > 0) {
            const errorCode = context.errorCodes[0];
            response += `\n\nBased on the knowledge base, I found error code ${errorCode.code}: ${errorCode.meaning}.\n`;
            response += `Description: ${errorCode.description}\n`;
            response += `Troubleshooting steps: ${errorCode.troubleshootingSteps}`;
        }
        else {
            response += "\n\nTo get AI-powered assistance, please ensure Ollama is running locally with a model installed (e.g., 'ollama pull mistral' or 'ollama pull llama3').";
            response += "\n\nFor now, here are some general troubleshooting tips:";
            response += "\n1. Check if the machine is properly powered and connected";
            response += "\n2. Inspect for visible damage or unusual sounds";
            response += "\n3. Review the machine's error logs if available";
            response += "\n4. Consult the machine's manual for specific error codes";
            response += "\n5. Ensure regular maintenance schedules are being followed";
        }
        await this.queryLogService.create({
            query,
            response,
            machineId: machineId || null,
        });
        return response;
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [machine_service_1.MachineService,
        error_code_service_1.ErrorCodeService,
        maintenance_service_1.MaintenanceService,
        query_log_service_1.QueryLogService])
], ChatService);
//# sourceMappingURL=chat.service.js.map