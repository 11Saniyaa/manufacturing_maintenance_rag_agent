import { ChatService } from './chat.service';
export declare class ChatRequestDto {
    query: string;
    machineId?: number;
}
export declare class ChatImageRequestDto {
    imageDataUrl: string;
    machineId?: number;
    note?: string;
}
export declare class ChatParameterRequestDto {
    machineId?: number;
    machineType?: string;
    temperatureC: number;
    vibrationMmS: number;
    currentA: number;
    oilPressureBar?: number;
    rpm: number;
    runtimeHours: number;
    noiseLevel: 'normal' | 'unusual';
    leakObserved: boolean;
    note?: string;
}
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    processQuery(request: ChatRequestDto): Promise<{
        response: string;
        timestamp: string;
    }>;
    diagnoseImage(request: ChatImageRequestDto): Promise<{
        response: string;
        timestamp: string;
    }>;
    diagnoseParameters(request: ChatParameterRequestDto): Promise<{
        response: string;
        timestamp: string;
    }>;
}
