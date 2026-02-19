import { Injectable } from '@nestjs/common';
import { MachineService } from '../machine/machine.service';
import { ErrorCodeService } from '../error-code/error-code.service';
import { MaintenanceService } from '../maintenance/maintenance.service';
import { QueryLogService } from '../query-log/query-log.service';

@Injectable()
export class ChatService {
  constructor(
    private machineService: MachineService,
    private errorCodeService: ErrorCodeService,
    private maintenanceService: MaintenanceService,
    private queryLogService: QueryLogService,
  ) {}

  /**
   * Process user query and generate AI response using local LLM
   * Supports: Ollama, LM Studio, or any OpenAI-compatible API
   */
  async processQuery(query: string, machineId?: number): Promise<string> {
    try {
      // Fetch relevant knowledge base data
      const context = await this.buildContext(query, machineId);
      const systemPrompt = this.buildSystemPrompt(context);

      // Get LLM configuration from environment or use defaults
      // Default is LM Studio (easier for Windows users, no command-line needed)
      const llmProvider = process.env.LLM_PROVIDER || 'lmstudio'; // 'lmstudio' or 'openai'
      const llmBaseUrl = process.env.LLM_BASE_URL || this.getDefaultBaseUrl(llmProvider);
      const llmModel = process.env.LLM_MODEL || this.getDefaultModel(llmProvider);

      // Import LangChain dynamically
      const { HumanMessage, SystemMessage } = await import('@langchain/core/messages');
      const { ChatOpenAI } = await import('@langchain/openai');
      
      // Use OpenAI-compatible API (works with LM Studio, LocalAI, Text Generation WebUI, etc.)
      const model = new ChatOpenAI({
        modelName: llmModel,
        openAIApiKey: 'not-needed', // Not required for local servers
        configuration: {
          baseURL: llmBaseUrl,
        },
        temperature: 0.7,
        apiKey: 'not-needed',
      });

      // Create messages
      const messages = [
        new SystemMessage(systemPrompt),
        new HumanMessage(query),
      ];

      // Get AI response
      const response = await model.invoke(messages);
      const responseText = response.content as string;

      // Log the query
      await this.queryLogService.create({
        query,
        response: responseText,
        machineId: machineId || null,
      });

      return responseText;
    } catch (error) {
      console.error(`Error processing query with ${process.env.LLM_PROVIDER || 'lmstudio'}:`, error);
      
      // Fallback response if LLM is not available
      return this.getFallbackResponse(query, machineId);
    }
  }

  /**
   * Get default base URL based on provider
   */
  private getDefaultBaseUrl(provider: string): string {
    switch (provider.toLowerCase()) {
      case 'lmstudio':
        return 'http://localhost:1234/v1'; // LM Studio default (recommended for Windows)
      case 'openai':
        return 'http://localhost:1234/v1'; // Generic OpenAI-compatible API
      default:
        return 'http://localhost:1234/v1'; // LM Studio as default
    }
  }

  /**
   * Get default model based on provider
   */
  private getDefaultModel(provider: string): string {
    switch (provider.toLowerCase()) {
      case 'lmstudio':
        return 'local-model'; // LM Studio uses whatever model is loaded
      case 'openai':
        return 'local-model'; // Generic model name for OpenAI-compatible APIs
      default:
        return 'local-model'; // Default model name
    }
  }

  /**
   * Build context from knowledge base based on query
   */
  private async buildContext(query: string, machineId?: number): Promise<any> {
    const context: any = {
      machines: [],
      errorCodes: [],
      maintenance: [],
    };

    // Get machines
    if (machineId) {
      const machine = await this.machineService.findOne(machineId);
      if (machine) {
        context.machines.push(machine);
        context.errorCodes = await this.errorCodeService.findByMachineId(machineId);
        context.maintenance = await this.maintenanceService.findByMachineId(machineId);
      }
    } else {
      context.machines = await this.machineService.findAll();
    }

    // Search for relevant error codes
    const errorCodeMatches = await this.errorCodeService.search(query);
    context.errorCodes.push(...errorCodeMatches);

    // Search for relevant maintenance info
    const maintenanceMatches = await this.maintenanceService.search(query);
    context.maintenance.push(...maintenanceMatches);

    return context;
  }

  /**
   * Build system prompt with knowledge base context
   */
  private buildSystemPrompt(context: any): string {
    let prompt = `You are a helpful maintenance assistant for manufacturing equipment. 
Your role is to help factory workers diagnose machine problems and provide clear, actionable maintenance guidance.

KNOWLEDGE BASE:

`;

    // Add machine information
    if (context.machines.length > 0) {
      prompt += 'AVAILABLE MACHINES:\n';
      context.machines.forEach((machine: any) => {
        prompt += `- ${machine.name} (${machine.type}): ${machine.description || 'No description'}\n`;
      });
      prompt += '\n';
    }

    // Add error codes
    if (context.errorCodes.length > 0) {
      prompt += 'ERROR CODES:\n';
      context.errorCodes.slice(0, 10).forEach((errorCode: any) => {
        prompt += `- ${errorCode.code}: ${errorCode.meaning}\n`;
        prompt += `  Description: ${errorCode.description}\n`;
        prompt += `  Troubleshooting: ${errorCode.troubleshootingSteps}\n\n`;
      });
    }

    // Add maintenance schedules
    if (context.maintenance.length > 0) {
      prompt += 'MAINTENANCE SCHEDULES:\n';
      context.maintenance.slice(0, 10).forEach((maintenance: any) => {
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

  /**
   * Fallback response when Ollama is not available
   */
  private async getFallbackResponse(query: string, machineId?: number): Promise<string> {
    const context = await this.buildContext(query, machineId);
    
    let response = "I'm here to help with maintenance issues. ";
    
    // Try to find relevant error codes
    if (context.errorCodes.length > 0) {
      const errorCode = context.errorCodes[0];
      response += `\n\nBased on the knowledge base, I found error code ${errorCode.code}: ${errorCode.meaning}.\n`;
      response += `Description: ${errorCode.description}\n`;
      response += `Troubleshooting steps: ${errorCode.troubleshootingSteps}`;
    } else {
      response += "\n\nTo get AI-powered assistance, please ensure Ollama is running locally with a model installed (e.g., 'ollama pull mistral' or 'ollama pull llama3').";
      response += "\n\nFor now, here are some general troubleshooting tips:";
      response += "\n1. Check if the machine is properly powered and connected";
      response += "\n2. Inspect for visible damage or unusual sounds";
      response += "\n3. Review the machine's error logs if available";
      response += "\n4. Consult the machine's manual for specific error codes";
      response += "\n5. Ensure regular maintenance schedules are being followed";
    }
    
    // Log the query even with fallback
    await this.queryLogService.create({
      query,
      response,
      machineId: machineId || null,
    });
    
    return response;
  }
}

