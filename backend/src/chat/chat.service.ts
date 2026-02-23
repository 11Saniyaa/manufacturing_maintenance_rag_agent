import { Injectable } from '@nestjs/common';
import { MachineService } from '../machine/machine.service';
import { ErrorCodeService } from '../error-code/error-code.service';
import { MaintenanceService } from '../maintenance/maintenance.service';
import { QueryLogService } from '../query-log/query-log.service';
import { SystemMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import * as fs from 'fs';
import * as path from 'path';

interface TroubleshootingGuide {
  issue: string;
  category: string;
  causes: string[];
  steps: string[];
  prevention: string[];
}

interface QueryContext {
  machines: any[];
  errorCodes: any[];
  maintenance: any[];
  troubleshooting: TroubleshootingGuide[];
  extractedEntities: {
    errorCodes: string[];
    machineTypes: string[];
    keywords: string[];
  };
}

@Injectable()
export class ChatService {
  private troubleshootingData: TroubleshootingGuide[] = [];

  constructor(
    private machineService: MachineService,
    private errorCodeService: ErrorCodeService,
    private maintenanceService: MaintenanceService,
    private queryLogService: QueryLogService,
  ) {
    this.loadTroubleshootingData();
  }

  private loadTroubleshootingData() {
    try {
      const filePath = path.join(process.cwd(), 'knowledge-base', 'troubleshooting.json');
      const data = fs.readFileSync(filePath, 'utf-8');
      this.troubleshootingData = JSON.parse(data);
    } catch (error) {
      console.warn('Could not load troubleshooting data:', error.message);
      this.troubleshootingData = [];
    }
  }

  async processQuery(
    query: string, 
    machineId?: number, 
    conversationHistory: Array<{ text: string; isUser: boolean }> = []
  ): Promise<string> {
    try {
      console.log(`Processing query with machineId: ${machineId}, query: ${query}`);
      
      // Extract entities from query for better matching
      const extractedEntities = this.extractEntities(query);
      
      // Build comprehensive context
      const context = await this.buildContext(query, machineId, extractedEntities);
      
      // Build enhanced system prompt
      const systemPrompt = this.buildSystemPrompt(context);
      
      // Configure LLM
      const llmProvider = process.env.LLM_PROVIDER || 'lmstudio';
      const llmBaseUrl = process.env.LLM_BASE_URL || this.getDefaultBaseUrl(llmProvider);
      const llmModel = process.env.LLM_MODEL || this.getDefaultModel(llmProvider);
      const llmApiKey = process.env.LLM_API_KEY || 'not-needed';

      const model = new ChatOpenAI({
        modelName: llmModel,
        openAIApiKey: llmApiKey,
        configuration: {
          baseURL: llmBaseUrl,
        },
        temperature: 0.3, // Lower temperature for more accurate, focused responses
        maxTokens: 1000,
      });

      // Build messages array with conversation history
      const messages: any[] = [
        new SystemMessage(systemPrompt),
      ];

      // Add conversation history (last 5 exchanges to keep context manageable)
      const recentHistory = conversationHistory.slice(-10); // Last 10 messages (5 exchanges)
      for (const msg of recentHistory) {
        if (msg.isUser) {
          messages.push(new HumanMessage(msg.text));
        } else {
          // Add assistant responses as AIMessage for proper conversation flow
          messages.push(new AIMessage(msg.text));
        }
      }

      // Add current query
      messages.push(new HumanMessage(query));

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
      if (error.message && (error.message.includes('401') || error.message.includes('Unauthorized') || error.message.includes('API key'))) {
        console.error('⚠️  Authentication error: Check your LLM_API_KEY in .env file');
      }
      return this.getFallbackResponse(query, machineId);
    }
  }

  private extractEntities(query: string): { errorCodes: string[]; machineTypes: string[]; keywords: string[] } {
    const errorCodes: string[] = [];
    const machineTypes: string[] = [];
    const keywords: string[] = [];

    // Extract error codes (patterns like E45, M101, C88, etc.)
    const errorCodePattern = /\b([A-Z]\d{2,3})\b/g;
    const codeMatches = query.match(errorCodePattern);
    if (codeMatches) {
      errorCodes.push(...codeMatches);
    }

    // Extract machine types (common manufacturing equipment)
    const machineTypeKeywords = ['conveyor', 'motor', 'cnc', 'compressor', 'pump', 'valve', 'sensor', 'actuator'];
    const queryLower = query.toLowerCase();
    machineTypeKeywords.forEach(type => {
      if (queryLower.includes(type)) {
        machineTypes.push(type);
      }
    });

    // Extract important keywords (nouns and technical terms)
    const importantKeywords = [
      'overheating', 'vibration', 'pressure', 'temperature', 'leak', 'noise',
      'error', 'fault', 'failure', 'maintenance', 'repair', 'troubleshoot',
      'belt', 'bearing', 'oil', 'filter', 'spindle', 'alignment', 'tension'
    ];
    importantKeywords.forEach(keyword => {
      if (queryLower.includes(keyword)) {
        keywords.push(keyword);
      }
    });

    return { errorCodes, machineTypes, keywords };
  }

  private async buildContext(
    query: string,
    machineId: number | undefined,
    extractedEntities: { errorCodes: string[]; machineTypes: string[]; keywords: string[] }
  ): Promise<QueryContext> {
    const context: QueryContext = {
      machines: [],
      errorCodes: [],
      maintenance: [],
      troubleshooting: [],
      extractedEntities,
    };

    // Load machine-specific context
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

    // Enhanced search with multiple strategies
    const searchResults = await this.enhancedSearch(query, extractedEntities, machineId);
    context.errorCodes.push(...searchResults.errorCodes);
    context.maintenance.push(...searchResults.maintenance);
    context.troubleshooting = searchResults.troubleshooting;

    // Remove duplicates
    context.errorCodes = this.deduplicate(context.errorCodes, 'code');
    context.maintenance = this.deduplicate(context.maintenance, 'id');

    return context;
  }

  private async enhancedSearch(
    query: string,
    extractedEntities: { errorCodes: string[]; machineTypes: string[]; keywords: string[] },
    machineId?: number
  ): Promise<{ errorCodes: any[]; maintenance: any[]; troubleshooting: TroubleshootingGuide[] }> {
    const results = {
      errorCodes: [] as any[],
      maintenance: [] as any[],
      troubleshooting: [] as TroubleshootingGuide[],
    };

    // Search by error codes if found
    if (extractedEntities.errorCodes.length > 0) {
      for (const code of extractedEntities.errorCodes) {
        const codes = await this.errorCodeService.findByCode(code);
        results.errorCodes.push(...codes);
      }
    }

    // Search by keywords
    const searchTerms = [
      query,
      ...extractedEntities.keywords,
      ...extractedEntities.machineTypes,
    ];

    for (const term of searchTerms) {
      if (term && term.trim()) {
        const errorCodes = await this.errorCodeService.search(term);
        results.errorCodes.push(...errorCodes);
        
        const maintenance = await this.maintenanceService.search(term);
        results.maintenance.push(...maintenance);
      }
    }

    // Search troubleshooting guide
    const queryLower = query.toLowerCase();
    results.troubleshooting = this.troubleshootingData.filter(guide => {
      const issueMatch = guide.issue.toLowerCase().includes(queryLower) || 
                        queryLower.includes(guide.issue.toLowerCase());
      const categoryMatch = extractedEntities.machineTypes.some(type => 
        guide.category.toLowerCase().includes(type) || type.includes(guide.category.toLowerCase())
      );
      const keywordMatch = extractedEntities.keywords.some(keyword =>
        guide.issue.toLowerCase().includes(keyword) ||
        guide.causes.some(cause => cause.toLowerCase().includes(keyword)) ||
        guide.steps.some(step => step.toLowerCase().includes(keyword))
      );
      
      return issueMatch || categoryMatch || keywordMatch;
    });

    // If no specific matches, include general troubleshooting guides
    if (results.troubleshooting.length === 0) {
      results.troubleshooting = this.troubleshootingData.slice(0, 3);
    }

    return results;
  }

  private deduplicate<T>(array: T[], key: keyof T): T[] {
    const seen = new Set();
    return array.filter(item => {
      const value = item[key];
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
  }

  private buildSystemPrompt(context: QueryContext): string {
    let prompt = `You are an expert maintenance assistant for manufacturing equipment. Your role is to help factory workers diagnose machine problems, understand error codes, and provide clear, actionable maintenance guidance.

IMPORTANT: Always prioritize safety in your recommendations. If a situation is dangerous, clearly state that the machine should be shut down immediately.

KNOWLEDGE BASE:

`;

    // Machines section
    if (context.machines.length > 0) {
      prompt += '=== AVAILABLE MACHINES ===\n';
      context.machines.forEach((machine) => {
        prompt += `• ${machine.name} (Type: ${machine.type})\n`;
        if (machine.description) prompt += `  Description: ${machine.description}\n`;
        if (machine.manufacturer) prompt += `  Manufacturer: ${machine.manufacturer}\n`;
        if (machine.model) prompt += `  Model: ${machine.model}\n`;
        if (machine.commonIssues && machine.commonIssues.length > 0) {
          prompt += `  Common Issues: ${machine.commonIssues.join(', ')}\n`;
        }
        prompt += '\n';
      });
    }

    // Error codes section
    if (context.errorCodes.length > 0) {
      prompt += '=== ERROR CODES ===\n';
      context.errorCodes.slice(0, 15).forEach((errorCode) => {
        prompt += `• Error Code: ${errorCode.code}\n`;
        prompt += `  Meaning: ${errorCode.meaning}\n`;
        if (errorCode.description) {
          prompt += `  Description: ${errorCode.description}\n`;
        }
        if (errorCode.troubleshootingSteps && Array.isArray(errorCode.troubleshootingSteps)) {
          prompt += `  Troubleshooting Steps:\n`;
          errorCode.troubleshootingSteps.forEach((step: string, index: number) => {
            prompt += `    ${index + 1}. ${step}\n`;
          });
        }
        if (errorCode.machineType) {
          prompt += `  Machine Type: ${errorCode.machineType}\n`;
        }
        prompt += '\n';
      });
    }

    // Maintenance schedules section
    if (context.maintenance.length > 0) {
      prompt += '=== MAINTENANCE SCHEDULES ===\n';
      context.maintenance.slice(0, 10).forEach((maintenance) => {
        prompt += `• Task: ${maintenance.task}\n`;
        prompt += `  Frequency: ${maintenance.frequency}\n`;
        if (maintenance.description) {
          prompt += `  Description: ${maintenance.description}\n`;
        }
        if (maintenance.steps && Array.isArray(maintenance.steps)) {
          prompt += `  Steps:\n`;
          maintenance.steps.forEach((step: string, index: number) => {
            prompt += `    ${index + 1}. ${step}\n`;
          });
        }
        prompt += '\n';
      });
    }

    // Troubleshooting guides section
    if (context.troubleshooting.length > 0) {
      prompt += '=== TROUBLESHOOTING GUIDES ===\n';
      context.troubleshooting.slice(0, 5).forEach((guide) => {
        prompt += `• Issue: ${guide.issue}\n`;
        prompt += `  Category: ${guide.category}\n`;
        if (guide.causes && guide.causes.length > 0) {
          prompt += `  Common Causes:\n`;
          guide.causes.forEach((cause, index) => {
            prompt += `    - ${cause}\n`;
          });
        }
        if (guide.steps && guide.steps.length > 0) {
          prompt += `  Troubleshooting Steps:\n`;
          guide.steps.forEach((step, index) => {
            prompt += `    ${index + 1}. ${step}\n`;
          });
        }
        if (guide.prevention && guide.prevention.length > 0) {
          prompt += `  Prevention:\n`;
          guide.prevention.forEach((prevention, index) => {
            prompt += `    - ${prevention}\n`;
          });
        }
        prompt += '\n';
      });
    }

    // Extracted entities (for context)
    if (context.extractedEntities.errorCodes.length > 0 || 
        context.extractedEntities.machineTypes.length > 0 ||
        context.extractedEntities.keywords.length > 0) {
      prompt += '=== DETECTED ENTITIES ===\n';
      if (context.extractedEntities.errorCodes.length > 0) {
        prompt += `Error Codes Mentioned: ${context.extractedEntities.errorCodes.join(', ')}\n`;
      }
      if (context.extractedEntities.machineTypes.length > 0) {
        prompt += `Machine Types Mentioned: ${context.extractedEntities.machineTypes.join(', ')}\n`;
      }
      if (context.extractedEntities.keywords.length > 0) {
        prompt += `Key Terms: ${context.extractedEntities.keywords.join(', ')}\n`;
      }
      prompt += '\n';
    }

    prompt += `=== RESPONSE GUIDELINES ===

1. ANALYZE THE QUERY: Carefully read the user's question and identify:
   - Specific error codes mentioned
   - Machine types or equipment involved
   - Symptoms or problems described
   - Urgency level (safety-critical issues should be flagged immediately)

2. MATCH WITH KNOWLEDGE BASE: Use the information above to find relevant:
   - Error codes and their meanings
   - Troubleshooting steps
   - Maintenance procedures
   - Preventive measures

3. PROVIDE STRUCTURED RESPONSES:
   - Start with a clear summary of the issue
   - If an error code is mentioned, explain what it means
   - Provide step-by-step troubleshooting instructions
   - Include safety warnings if applicable
   - Suggest preventive maintenance if relevant
   - If multiple solutions exist, prioritize the most common or effective ones

4. FORMAT YOUR RESPONSE:
   - Use clear headings and bullet points
   - Number steps for easy following
   - Use simple, technical language appropriate for factory workers
   - Be concise but thorough

5. WHEN INFORMATION IS UNCLEAR:
   - Acknowledge what you don't know
   - Provide general best practices
   - Suggest consulting machine manuals or technical support
   - Recommend safety precautions

6. ALWAYS:
   - Prioritize safety
   - Be specific and actionable
   - Reference relevant error codes, maintenance schedules, or troubleshooting guides
   - Provide context about why certain steps are important

Respond in a helpful, professional, and clear manner. Make your response easy to follow for someone working on the factory floor.`;

    return prompt;
  }

  private getDefaultBaseUrl(provider: string): string {
    switch (provider.toLowerCase()) {
      case 'lmstudio':
        return 'http://localhost:1234/v1';
      case 'openai':
        return 'https://api.groq.com/openai/v1';
      case 'groq':
        return 'https://api.groq.com/openai/v1';
      default:
        return 'http://localhost:1234/v1';
    }
  }

  private getDefaultModel(provider: string): string {
    switch (provider.toLowerCase()) {
      case 'lmstudio':
        return 'local-model';
      case 'openai':
        return 'gpt-3.5-turbo';
      case 'groq':
        return 'llama-3.1-8b-instant';
      default:
        return 'local-model';
    }
  }

  private async getFallbackResponse(query: string, machineId?: number): Promise<string> {
    const context = await this.buildContext(query, machineId, this.extractEntities(query));
    
    let response = "I'm here to help with maintenance issues. ";

    // Try to provide useful information even without LLM
    if (context.errorCodes.length > 0) {
      const errorCode = context.errorCodes[0];
      response += `\n\nI found information about error code ${errorCode.code}: ${errorCode.meaning}.\n\n`;
      response += `Description: ${errorCode.description}\n\n`;
      if (errorCode.troubleshootingSteps && Array.isArray(errorCode.troubleshootingSteps)) {
        response += `Troubleshooting steps:\n`;
        errorCode.troubleshootingSteps.forEach((step: string, index: number) => {
          response += `${index + 1}. ${step}\n`;
        });
      }
    } else if (context.troubleshooting.length > 0) {
      const guide = context.troubleshooting[0];
      response += `\n\nI found a troubleshooting guide for: ${guide.issue}\n\n`;
      if (guide.steps && guide.steps.length > 0) {
        response += `Troubleshooting steps:\n`;
        guide.steps.forEach((step: string, index: number) => {
          response += `${index + 1}. ${step}\n`;
        });
      }
    } else {
      response += "\n\nTo get AI-powered assistance, please ensure your LLM service is running.";
      response += "\n\nFor now, here are some general troubleshooting tips:";
      response += "\n1. Check if the machine is properly powered and connected";
      response += "\n2. Inspect for visible damage, leaks, or unusual sounds";
      response += "\n3. Review the machine's error logs if available";
      response += "\n4. Consult the machine's manual for specific error codes";
      response += "\n5. Ensure regular maintenance schedules are being followed";
      response += "\n6. Check fluid levels (oil, coolant, etc.)";
      response += "\n7. Verify safety systems are operational";
    }

    await this.queryLogService.create({
      query,
      response,
      machineId: machineId || null,
    });

    return response;
  }
}

