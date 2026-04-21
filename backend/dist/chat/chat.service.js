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
            console.log(`Processing query with machineId: ${machineId}, query: ${query}`);
            const context = await this.buildContext(query, machineId);
            const systemPrompt = this.buildSystemPrompt(context);
            const llmProvider = process.env.LLM_PROVIDER || 'lmstudio';
            const llmBaseUrl = process.env.LLM_BASE_URL || this.getDefaultBaseUrl(llmProvider);
            const llmModel = process.env.LLM_MODEL || this.getDefaultModel(llmProvider);
            const llmApiKey = process.env.LLM_API_KEY || 'not-needed';
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
                { role: 'system', content: systemPrompt },
                { role: 'user', content: query },
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
    async diagnoseImage(imageDataUrl, machineId, note) {
        try {
            if (!imageDataUrl || typeof imageDataUrl !== 'string' || !imageDataUrl.startsWith('data:image/')) {
                return 'Please upload a valid image file to analyze.';
            }
            const payloadBytes = this.estimateDataUrlBytes(imageDataUrl);
            if (payloadBytes > 4_000_000) {
                return 'Image is too large for analysis payload. Please upload a clearer but smaller JPG/PNG/WEBP image.';
            }
            const context = await this.buildContext(note || 'image diagnosis', machineId);
            const systemPrompt = this.buildSystemPrompt(context) +
                '\n\nYou are now doing visual machine fault triage from a user-submitted photo.' +
                '\nFocus on: visible damage, leaks, corrosion, loose parts, overheating indicators, belt/chain condition, alignment issues, vibration clues, and safety hazards.' +
                '\nDo not guess hidden/internal faults from visual data alone; clearly mark uncertainty.' +
                '\nIf image quality is low, explicitly request one or two better angles before concluding.' +
                '\nReturn concise output with this exact structure:' +
                '\n1) What I can see' +
                '\n2) Likely issue(s)' +
                '\n3) Immediate safe checks' +
                '\n4) Recommended next actions' +
                '\n5) Confidence (Low/Medium/High)' +
                '\n6) Extra photo needed? (Yes/No + what to capture)';
            const llmProvider = process.env.LLM_PROVIDER || 'lmstudio';
            const llmBaseUrl = process.env.LLM_BASE_URL || this.getDefaultBaseUrl(llmProvider);
            const llmModel = process.env.LLM_VISION_MODEL || process.env.LLM_MODEL || this.getDefaultModel(llmProvider);
            const llmApiKey = process.env.LLM_API_KEY || 'not-needed';
            const { ChatOpenAI } = await Promise.resolve().then(() => __importStar(require('@langchain/openai')));
            const model = new ChatOpenAI({
                modelName: llmModel,
                openAIApiKey: llmApiKey,
                configuration: {
                    baseURL: llmBaseUrl,
                },
                temperature: 0.3,
            });
            const userText = note?.trim()
                ? `User note: ${note.trim()}\nAnalyze this machine photo and explain what might be wrong.`
                : 'Analyze this machine photo and explain what might be wrong.';
            const messages = [
                { role: 'system', content: systemPrompt },
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: userText },
                        { type: 'image_url', image_url: { url: imageDataUrl } },
                    ],
                },
            ];
            const response = await model.invoke(messages);
            const responseText = Array.isArray(response.content)
                ? response.content.map((part) => typeof part === 'string' ? part : (part?.text || '')).join('\n').trim()
                : response.content;
            await this.queryLogService.create({
                query: note?.trim() ? `[IMAGE] ${note.trim()}` : '[IMAGE] Diagnose machine photo',
                response: responseText,
                machineId: machineId || null,
            });
            return responseText;
        }
        catch (error) {
            console.error('Error diagnosing image:', error);
            if (error?.message?.toLowerCase?.().includes('invalid image data')) {
                return 'Uploaded image format is not supported by the vision model. Please upload JPG, PNG, or WEBP.';
            }
            if (error?.message?.includes('model') || error?.message?.includes('vision') || error?.message?.includes('image')) {
                return "Image analysis is not available with the current model. Set a vision-capable model in backend/.env as LLM_VISION_MODEL and try again.";
            }
            return 'Could not analyze this image right now. Please try again in a moment.';
        }
    }
    async diagnoseParameters(request) {
        try {
            const machine = request.machineId ? await this.machineService.findOne(request.machineId) : null;
            const machineType = (machine?.type || request.machineType || 'General').trim();
            const thresholds = this.getThresholdsForMachineType(machineType);
            const flags = [];
            let score = 0;
            if (request.temperatureC >= thresholds.tempCritical) {
                score += 3;
                flags.push(`Temperature is critical (${request.temperatureC} deg C)`);
            }
            else if (request.temperatureC >= thresholds.tempWarn) {
                score += 2;
                flags.push(`Temperature is high (${request.temperatureC} deg C)`);
            }
            if (request.vibrationMmS >= thresholds.vibrationCritical) {
                score += 3;
                flags.push(`Vibration is critical (${request.vibrationMmS} mm/s)`);
            }
            else if (request.vibrationMmS >= thresholds.vibrationWarn) {
                score += 2;
                flags.push(`Vibration is elevated (${request.vibrationMmS} mm/s)`);
            }
            if (request.currentA >= thresholds.currentCritical) {
                score += 3;
                flags.push(`Current draw is critical (${request.currentA} A)`);
            }
            else if (request.currentA >= thresholds.currentWarn) {
                score += 2;
                flags.push(`Current draw is high (${request.currentA} A)`);
            }
            if (request.oilPressureBar !== undefined && request.oilPressureBar < thresholds.oilPressureMin) {
                score += 2;
                flags.push(`Oil pressure is below safe minimum (${request.oilPressureBar} bar)`);
            }
            if (request.noiseLevel === 'unusual') {
                score += 1;
                flags.push('Unusual noise reported');
            }
            if (request.leakObserved) {
                score += 2;
                flags.push('Leak observed');
            }
            if (request.runtimeHours > thresholds.runtimeWarnHours) {
                score += 1;
                flags.push(`Long runtime since last maintenance (${request.runtimeHours} hours)`);
            }
            let condition = 'Normal';
            if (score >= 7)
                condition = 'Critical';
            else if (score >= 3)
                condition = 'Warning';
            const likelyIssue = this.getLikelyIssue(machineType, flags);
            const immediateActions = this.getImmediateActions(machineType, condition, request);
            const escalateRule = condition === 'Critical'
                ? 'Stop machine and escalate to maintenance lead immediately.'
                : 'Escalate if readings remain high after first corrective checks.';
            const summaryLines = [
                `Condition: ${condition}`,
                `Machine: ${machine?.name || machineType}`,
                '',
                'Detected Risk Signals:',
                ...(flags.length ? flags.map((f, i) => `${i + 1}. ${f}`) : ['1. No major abnormal parameter detected']),
                '',
                `Likely Issue: ${likelyIssue}`,
                '',
                'Immediate Actions:',
                ...immediateActions.map((a, i) => `${i + 1}. ${a}`),
                '',
                `Escalation: ${escalateRule}`,
            ];
            if (request.note?.trim()) {
                summaryLines.push('', `Operator Note: ${request.note.trim()}`);
            }
            const response = summaryLines.join('\n');
            await this.queryLogService.create({
                query: `[PARAMETERS] ${machine?.name || machineType}`,
                response,
                machineId: request.machineId || null,
            });
            return response;
        }
        catch (error) {
            console.error('Error diagnosing parameters:', error);
            return 'Could not analyze machine parameters right now. Please retry with valid readings.';
        }
    }
    estimateDataUrlBytes(dataUrl) {
        const commaIndex = dataUrl.indexOf(',');
        if (commaIndex === -1)
            return 0;
        const base64 = dataUrl.slice(commaIndex + 1);
        const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
        return Math.floor((base64.length * 3) / 4) - padding;
    }
    getThresholdsForMachineType(machineType) {
        const type = machineType.toLowerCase();
        if (type.includes('conveyor')) {
            return {
                tempWarn: 70,
                tempCritical: 85,
                vibrationWarn: 5.5,
                vibrationCritical: 8,
                currentWarn: 18,
                currentCritical: 24,
                oilPressureMin: 1.5,
                runtimeWarnHours: 220,
            };
        }
        if (type.includes('motor')) {
            return {
                tempWarn: 75,
                tempCritical: 90,
                vibrationWarn: 4.5,
                vibrationCritical: 7,
                currentWarn: 20,
                currentCritical: 28,
                oilPressureMin: 1.2,
                runtimeWarnHours: 180,
            };
        }
        if (type.includes('cnc')) {
            return {
                tempWarn: 65,
                tempCritical: 80,
                vibrationWarn: 3.8,
                vibrationCritical: 6,
                currentWarn: 16,
                currentCritical: 22,
                oilPressureMin: 2.0,
                runtimeWarnHours: 140,
            };
        }
        if (type.includes('air compressor')) {
            return {
                tempWarn: 85,
                tempCritical: 100,
                vibrationWarn: 5,
                vibrationCritical: 7.5,
                currentWarn: 22,
                currentCritical: 30,
                oilPressureMin: 2.5,
                runtimeWarnHours: 160,
            };
        }
        return {
            tempWarn: 75,
            tempCritical: 90,
            vibrationWarn: 5,
            vibrationCritical: 7.5,
            currentWarn: 20,
            currentCritical: 28,
            oilPressureMin: 1.5,
            runtimeWarnHours: 180,
        };
    }
    getLikelyIssue(machineType, flags) {
        const signalText = flags.join(' ').toLowerCase();
        if (signalText.includes('leak'))
            return 'Seal or line leakage with performance loss risk';
        if (signalText.includes('vibration') && signalText.includes('temperature'))
            return 'Bearing wear or misalignment causing friction heating';
        if (signalText.includes('current draw'))
            return 'Electrical overload or mechanical binding';
        if (machineType.toLowerCase().includes('air compressor'))
            return 'Pressure regulation or compressor stage efficiency issue';
        if (machineType.toLowerCase().includes('cnc'))
            return 'Spindle or axis drive stress condition';
        return 'General stress condition; inspect mechanical and electrical loads';
    }
    getImmediateActions(machineType, condition, request) {
        const actions = [
            'Reduce machine load and recheck key readings after 10-15 minutes.',
            'Inspect cooling path, vents, and lubrication points.',
            'Check fasteners, alignment, and visible wear components.',
        ];
        if (request.leakObserved) {
            actions.unshift('Contain leak safely and inspect seals/hoses before normal operation.');
        }
        if (request.noiseLevel === 'unusual') {
            actions.push('Perform acoustic check near bearings, couplings, and motor mounts.');
        }
        if (machineType.toLowerCase().includes('conveyor')) {
            actions.push('Check belt tension, pulley alignment, and material buildup on rollers.');
        }
        if (machineType.toLowerCase().includes('cnc')) {
            actions.push('Inspect spindle/tool holder condition and verify coolant flow.');
        }
        if (machineType.toLowerCase().includes('air compressor')) {
            actions.push('Check air filter, intake path, and pressure regulator settings.');
        }
        if (condition === 'Critical') {
            actions.unshift('Move machine to safe state; avoid continued production load.');
        }
        return actions.slice(0, 6);
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